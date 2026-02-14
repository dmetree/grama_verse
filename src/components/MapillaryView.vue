<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Viewer } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';
import { fetchNearbyImages, getMapillaryToken } from '../services/mapillary';
import { useUserStore } from '../stores/user';

const props = defineProps({
  lat: Number,
  lng: Number,
  bearing: Number,
  targetImageId: String // New: Support direct teleport
});

const emit = defineEmits(['update-position', 'update-bearing']);

const mContainer = ref(null);
let viewer = null;
const lastEmitTime = ref(0);
const isLoading = ref(true);
const currentBearing = ref(0);

// Constants
// Reduced to 0.005 (~500m) to avoid dramatic jumps on empty space clicks.
const SEARCH_RADIUS = 0.005; 

onMounted(() => {
  if (props.targetImageId) {
    initOrUpdateViewer(props.targetImageId);
  } else if (props.lat && props.lng) {
    setTimeout(() => loadNearestImage(props.lat, props.lng), 500);
  }
  
  // Add keyboard controls
  window.addEventListener('keydown', handleKeyPress);
});

onBeforeUnmount(() => {
  if (viewer) {
    viewer.remove();
  }
  window.removeEventListener('keydown', handleKeyPress);
});

function handleKeyPress(e) {
  // Prevent if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  const userStore = useUserStore();
  
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault();
      userStore.move('up');
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault();
      userStore.move('down');
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault();
      userStore.move('left');
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault();
      userStore.move('right');
      break;
  }
}

function handleNavigate(direction) {
  const userStore = useUserStore();
  userStore.move(direction);
}

watch(() => [props.lat, props.lng, props.targetImageId], async ([newLat, newLng, newId]) => {
  if (Date.now() - lastEmitTime.value < 1000) {
     return;
  }

  if (newId) {
     initOrUpdateViewer(newId);
     return;
  }

  if (viewer) {
     loadNearestImage(newLat, newLng);
  }
});

async function loadNearestImage(lat, lng) {
  try {
    isLoading.value = true;
    
    // If we have a direct target, we don't need to search
    if (props.targetImageId) {
       initOrUpdateViewer(props.targetImageId);
       return;
    }

    // Fetch multiple images within the radius
    const images = await fetchNearbyImages(lat, lng, SEARCH_RADIUS, 10);
    
    if (images.length > 0) {
      // Find the image that is TRULY closest to the clicked point
      let nearestImage = images[0];
      let minDistance = Infinity;

      images.forEach(img => {
        const [imgLng, imgLat] = img.geometry.coordinates;
        const dist = Math.sqrt(Math.pow(lat - imgLat, 2) + Math.pow(lng - imgLng, 2));
        if (dist < minDistance) {
          minDistance = dist;
          nearestImage = img;
        }
      });

      const imageId = nearestImage.id;
      
      if (viewer) {
        const currentImage = await viewer.getImage();
        if (currentImage && currentImage.id === imageId) {
          isLoading.value = false;
          return;
        }
      }

      initOrUpdateViewer(imageId);
    } else {
      isLoading.value = false;
    }
  } catch (err) {
    isLoading.value = false;
    // Error logged by service
  }
}

function initOrUpdateViewer(imageId) {
  if (!viewer) {
    viewer = new Viewer({
      accessToken: getMapillaryToken(),
      container: mContainer.value,
      imageId: imageId,
      component: {
        cover: false,
      },
    });
    
    viewer.on('image', async () => {
      const image = await viewer.getImage();
      if (image) {
        const lng = image.originalLngLat.lng;
        const lat = image.originalLngLat.lat;
        const bearing = image.originalCompassAngle; 
        
        currentBearing.value = bearing;
        isLoading.value = false;
        
        lastEmitTime.value = Date.now();
        emit('update-position', { lat, lng, bearing });
      }
    });

    viewer.on('bearing', async () => {
      const bearing = await viewer.getBearing();
      currentBearing.value = bearing;
      emit('update-bearing', bearing);
    });

  } else {
    viewer.moveTo(imageId).then(() => {
      isLoading.value = false;
    }).catch(e => {
       if (e.name !== 'CancelMapillaryError') {
          console.error("Move failed", e);
       }
       isLoading.value = false;
    });
  }
}

</script>

<template>
  <div class="mapillary-container">
    <div ref="mContainer" class="m-viewer"></div>
    
    <!-- Loading Spinner -->
    <transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Loading street view...</p>
      </div>
    </transition>
    
    <!-- Compass -->
    <div class="compass" :style="{ transform: `rotate(${-currentBearing}deg)` }">
      <div class="compass-inner">
        <div class="compass-needle"></div>
        <span class="compass-n">N</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mapillary-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.m-viewer {
  width: 100%;
  height: 100%;
  background: #000;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Compass */
.compass {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 60px;
  height: 60px;
  z-index: 50;
  transition: transform 0.3s ease-out;
}

.compass-inner {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compass-needle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 20px solid #e74c3c;
  top: 8px;
}

.compass-n {
  position: absolute;
  top: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .compass {
    width: 50px;
    height: 50px;
  }
}
</style>
