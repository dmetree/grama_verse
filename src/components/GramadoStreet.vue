<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserStore } from '../stores/user';
import { fetchNearbyImages } from '../services/mapillary';

const mapContainer = ref(null);
let map = null;
let userMarker = null;

const userStore = useUserStore();

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
    <div ref="mapContainer" id="map-container"></div>
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
  width: 100%;
  height: 100%;
  z-index: 1;
}
:deep(.leaflet-control-scale) {
  display: block !important; 
  opacity: 1 !important;
  visibility: visible !important;
  z-index: 1000 !important;
  color: #333 !important;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  margin-top: 10px;
  margin-right: 10px;
}
:deep(.leaflet-control-scale-line) {
  border: 2px solid #555;
  border-top: none;
  line-height: 1.1;
  padding: 2px 5px 1px;
  font-size: 11px;
  font-weight: bold;
  color: #333;
  background: transparent; 
}
</style>
