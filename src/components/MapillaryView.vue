<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Viewer } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';
import { fetchNearbyImages, getMapillaryToken } from '../services/mapillary';

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

// Constants
// Reduced to 0.005 (~500m) to avoid dramatic jumps on empty space clicks.
const SEARCH_RADIUS = 0.005; 

onMounted(() => {
  if (props.targetImageId) {
    initOrUpdateViewer(props.targetImageId);
  } else if (props.lat && props.lng) {
    setTimeout(() => loadNearestImage(props.lat, props.lng), 500);
  }
});

onBeforeUnmount(() => {
  if (viewer) {
    viewer.remove();
  }
});

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
          return;
        }
      }

      initOrUpdateViewer(imageId);
    }
  } catch (err) {
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
        
        lastEmitTime.value = Date.now();
        emit('update-position', { lat, lng, bearing });
      }
    });

    viewer.on('bearing', async () => {
      const bearing = await viewer.getBearing();
      emit('update-bearing', bearing);
    });

  } else {
    viewer.moveTo(imageId).catch(e => {
       if (e.name !== 'CancelMapillaryError') {
          console.error("Move failed", e);
       }
    });
  }
}

</script>

<template>
  <div ref="mContainer" class="m-viewer"></div>
</template>

<style scoped>
.m-viewer {
  width: 100%;
  height: 100%;
  background: #000;
}
</style>
