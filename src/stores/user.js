import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // Gramado Central Bus Station (Rodoviária de Gramado)
  const position = ref({
    lat: -29.378889, 
    lng: -50.876111,
    bearing: 90, // Facing East typically
    targetImageId: null // Optional: for direct teleport
  })

  // Approx meters per degree (lat): 111,000
  // 0.0001 ~ 11 meters
  const STEP_SIZE = 0.0001
  const TURN_SIZE = 15 // degrees

  function move(direction) {
    if (direction === 'up') {
      // Move forward based on bearing
      const rad = position.value.bearing * (Math.PI / 180);
      position.value.lat += Math.cos(rad) * STEP_SIZE;
      position.value.lng += Math.sin(rad) * STEP_SIZE;
      position.value.targetImageId = null; // Clear direct target when moving manually
    } else if (direction === 'down') {
      // Move backward
      const rad = position.value.bearing * (Math.PI / 180);
      position.value.lat -= Math.cos(rad) * STEP_SIZE;
      position.value.lng -= Math.sin(rad) * STEP_SIZE;
      position.value.targetImageId = null; // Clear direct target when moving manually
    } else if (direction === 'left') {
      // Turn Left
      position.value.bearing -= TURN_SIZE;
    } else if (direction === 'right') {
      // Turn Right
      position.value.bearing += TURN_SIZE;
    }
  }

  return { position, move }
})
