<script setup>
import GramadoStreet from './components/GramadoStreet.vue'
import MapillaryView from './components/MapillaryView.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

function handleMapillaryPosition(pos) {
  // Update store, which updates map marker
  // Check if position actually changed significantly to avoid jitter/loops
  const EPSILON = 0.000001;
  if (Math.abs(userStore.position.lat - pos.lat) > EPSILON || 
      Math.abs(userStore.position.lng - pos.lng) > EPSILON) {
      
      userStore.position.lat = pos.lat;
      userStore.position.lng = pos.lng;
  }
  
  if (pos.bearing !== undefined) {
      userStore.position.bearing = pos.bearing;
  }
}

function handleMapillaryBearing(bearing) {
  userStore.position.bearing = bearing;
}
</script>

<template>
  <main>
    <div class="app-container">
      <!-- Full Screen Street View (Background) -->
      <div class="street-view-layer">
        <MapillaryView 
          :lat="userStore.position.lat" 
          :lng="userStore.position.lng"
          :bearing="userStore.position.bearing"
          :targetImageId="userStore.position.targetImageId"
          @update-position="handleMapillaryPosition"
          @update-bearing="handleMapillaryBearing"
        />
      </div>

      <!-- Minimap Overlay (Top Right) -->
      <div class="minimap-layer">
        <GramadoStreet />
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100dvh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.app-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.street-view-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.minimap-layer {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 140px; /* Small, mobile friendly */
  height: 180px;
  z-index: 10;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  border: 2px solid rgba(255, 255, 255, 0.8);
  background: white; /* Fallback */
}

@media (min-width: 768px) {
  .minimap-layer {
    width: 200px;
    height: 250px;
    top: 24px;
    right: 24px;
  }
}
</style>
<style>
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}
#app {
  width: 100%;
  height: 100%;
  padding: 0;
}
</style>
