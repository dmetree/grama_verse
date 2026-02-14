<script setup>
import { useUserStore } from './stores/user';
import MapillaryView from './components/MapillaryView.vue';
import GramadoStreet from './components/GramadoStreet.vue';
import LocationInfo from './components/LocationInfo.vue';
import NearbyRoutes from './components/NearbyRoutes.vue';

const userStore = useUserStore();

function handleMapillaryPosition(data) {
  userStore.position.lat = data.lat;
  userStore.position.lng = data.lng;
  if (data.bearing !== undefined) {
    userStore.position.bearing = data.bearing;
  }
}

function handleMapillaryBearing(bearing) {
  userStore.position.bearing = bearing;
}
</script>

<template>
  <div id="app">
    <div class="main-view">
      <div class="street-view-container">
        <MapillaryView 
          :lat="userStore.position.lat" 
          :lng="userStore.position.lng"
          :bearing="userStore.position.bearing"
          :targetImageId="userStore.position.targetImageId"
          @update-position="handleMapillaryPosition"
          @update-bearing="handleMapillaryBearing"
        />
        
        <LocationInfo 
          :lat="userStore.position.lat"
          :lng="userStore.position.lng"
        />
        
        <NearbyRoutes />
      </div>
      
      <GramadoStreet />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #000;
}

#app {
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.main-view {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.street-view-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
</style>
