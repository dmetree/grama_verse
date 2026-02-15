<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserStore } from '../stores/user';
import { fetchNearbyImages } from '../services/mapillary';

const mapContainer = ref(null);
const mapState = ref('normal'); // 'minimized', 'normal', 'wide'
let map = null;
let userMarker = null;

const userStore = useUserStore();

function cycleMapState() {
  if (mapState.value === 'normal') {
    mapState.value = 'wide';
  } else if (mapState.value === 'wide') {
    mapState.value = 'minimized';
  } else {
    mapState.value = 'normal';
  }
}

// Constants
const FETCH_RADIUS = 0.002;
const FETCH_LIMIT = 500;
const REFETCH_THRESHOLD = 0.0005; // ~50m

/**
 * Generates a consistent HSL color for a given sequence ID.
 */
function getColorForSequence(sequenceId) {
  if (!sequenceId) return '#05CB63'; // Fallback to green
  
  let hash = 0;
  for (let i = 0; i < sequenceId.length; i++) {
    hash = sequenceId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use HSL for better visibility and distinct colors
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 45%)`;
}

onMounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
  setTimeout(initMap, 100);
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

function initMap() {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value, {
    zoomControl: false // Cleaner UI
  }).setView([userStore.position.lat, userStore.position.lng], 18);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const userIcon = L.divIcon({
    className: 'user-marker',
    html: '<div style="width: 14px; height: 14px; background: red; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
  
  userMarker = L.marker([userStore.position.lat, userStore.position.lng], { icon: userIcon }).addTo(map);

  // Mapillary Coverage Layer (GeoJSON Points)
  const coverageLayer = L.geoJSON(null, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 6, // Enlarged 2x as requested
        fillColor: '#05CB63',
        color: '#fff',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.8,
        interactive: true // Ensure dots are interactive
      });
    },
    onEachFeature: (feature, layer) => {
      layer.on('click', (L_event) => {
        // Stop propagation to prevent global map click from firing
        L.DomEvent.stopPropagation(L_event);
        
        // Update store position to exact dot location
        // This makes loadNearestImage much more reliable
        if (feature.geometry && feature.geometry.coordinates) {
          userStore.position.lng = feature.geometry.coordinates[0];
          userStore.position.lat = feature.geometry.coordinates[1];
        }
      });
    }
  }).addTo(map);
  
  updateCoverage(userStore.position.lat, userStore.position.lng, coverageLayer);

  map.on('click', (e) => {
     userStore.position.lat = e.latlng.lat;
     userStore.position.lng = e.latlng.lng;
     userStore.position.targetImageId = null; // Search fallback
  });

  // Add Scale Control
  L.control.scale({ imperial: false, metric: true, position: 'topright' }).addTo(map);
  
  watch(() => userStore.position, (newPos) => {
    if (!map) return;
    userMarker.setLatLng([newPos.lat, newPos.lng]);
    map.panTo([newPos.lat, newPos.lng], { animate: true });
    
    updateCoverage(newPos.lat, newPos.lng, coverageLayer);
  }, { deep: true });
}

let lastFetchCenter = { lat: 0, lng: 0 };
let isFetching = false;
let sequenceLayers = []; // Keep track of manually added layers (polylines)

async function updateCoverage(lat, lng, mainLayer) {
  const dist = Math.sqrt(Math.pow(lat - lastFetchCenter.lat, 2) + Math.pow(lng - lastFetchCenter.lng, 2));
  
  // Re-fetch if we moved more than ~50m (0.0005 degrees)
  // This ensures we always have high-density dots around the user
  if (dist < REFETCH_THRESHOLD) {
    return; 
  }

  if (isFetching) return;
  isFetching = true;

  try {
    const images = await fetchNearbyImages(lat, lng, FETCH_RADIUS, FETCH_LIMIT);

    if (images.length > 0) {
       // Clear old state
       mainLayer.clearLayers();
       sequenceLayers.forEach(l => map.removeLayer(l));
       sequenceLayers = [];
       
       // Group images by sequence
       const sequences = {};
       images.forEach(img => {
         const sid = img.sequence;
         if (!sequences[sid]) sequences[sid] = [];
         sequences[sid].push(img);
       });

       // Render each sequence
       Object.keys(sequences).forEach(sid => {
         const seqImages = sequences[sid];
         
         // Sort by capture time
         seqImages.sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at));
         
         const color = getColorForSequence(sid);
         const points = seqImages.map(img => [img.geometry.coordinates[1], img.geometry.coordinates[0]]);

         // 1. Draw connecting line
         if (points.length > 1) {
           const polyline = L.polyline(points, {
             color: color,
             weight: 2,
             opacity: 0.5,
             interactive: false
           }).addTo(map);
           sequenceLayers.push(polyline);
         }

         // 2. Draw points
         seqImages.forEach(img => {
           const feature = {
             type: "Feature",
             geometry: img.geometry,
             properties: { id: img.id, sequence: sid }
           };
           
           const marker = L.circleMarker([img.geometry.coordinates[1], img.geometry.coordinates[0]], {
             radius: 6,
             fillColor: color,
             color: '#fff',
             weight: 1,
             opacity: 0.8,
             fillOpacity: 0.8,
             interactive: true
           });

           marker.on('click', (L_event) => {
             L.DomEvent.stopPropagation(L_event);
             userStore.position.lng = img.geometry.coordinates[0];
             userStore.position.lat = img.geometry.coordinates[1];
             userStore.position.targetImageId = img.id; // Precise teleport
           });

           mainLayer.addLayer(marker);
         });
       });
       
       lastFetchCenter = { lat, lng };
    }
  } catch (err) {
    // Error logged by service
  } finally {
    isFetching = false;
  }
}

function handleMove(direction) {
  userStore.move(direction);
}

</script>

<template>
  <div class="container">
    <div 
      ref="mapContainer" 
      id="map-container"
      :class="{ 
        'minimized': mapState === 'minimized',
        'wide': mapState === 'wide'
      }"
    ></div>
    
    <button 
      class="minimap-toggle"
      @click="cycleMapState"
      :aria-label="mapState === 'minimized' ? 'Expand minimap' : mapState === 'normal' ? 'Maximize minimap' : 'Minimize minimap'"
    >
      <svg v-if="mapState === 'minimized'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <svg v-else-if="mapState === 'normal'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #eee;
}

#map-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 320px;
  height: 240px;
  z-index: 1000;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

#map-container.minimized {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

#map-container.minimized :deep(.leaflet-control-container) {
  display: none;
}

#map-container.wide {
  width: 600px;
  height: 450px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.minimap-toggle {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  color: #333;
}

.minimap-toggle:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.minimap-toggle:active {
  transform: scale(0.95);
}

:deep(.leaflet-control-scale) {
  display: block !important; 
  opacity: 1 !important;
  visibility: visible !important;
  z-index: 1000 !important;
  color: #fff !important;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 6px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  margin-top: 10px;
  margin-right: 10px;
  font-weight: 500;
}

:deep(.leaflet-control-scale-line) {
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-top: none;
  line-height: 1.1;
  padding: 2px 5px 1px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: transparent; 
}

/* Smooth panning animation */
:deep(.leaflet-map-pane) {
  transition: transform 0.2s ease-out;
}

/* Hover effects for markers */
:deep(.leaflet-marker-icon),
:deep(.leaflet-interactive) {
  transition: all 0.2s ease;
}

:deep(.leaflet-interactive:hover) {
  filter: brightness(1.2);
  transform: scale(1.15);
  cursor: pointer;
}

/* Mobile responsive */
@media (max-width: 768px) {
  #map-container {
    top: auto;
    bottom: 20px;
    right: 20px;
    width: 280px;
    height: 200px;
  }
  
  .minimap-toggle {
    top: auto;
    bottom: 30px;
    right: 30px;
  }
}

@media (max-width: 480px) {
  #map-container {
    width: calc(100% - 40px);
    height: 160px;
    bottom: 20px;
    right: 20px;
    left: 20px;
  }
  
  .minimap-toggle {
    bottom: 30px;
    right: 30px;
  }
}
</style>
