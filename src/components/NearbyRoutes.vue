<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { fetchNearbyImages } from '../services/mapillary';

const userStore = useUserStore();
const nearbySequences = ref([]);
const isLoading = ref(false);

// Color hash function (same as GramadoStreet)
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

async function fetchNearbySequences() {
  if (!userStore.position.lat || !userStore.position.lng) return;
  
  isLoading.value = true;
  try {
    const images = await fetchNearbyImages(
      userStore.position.lat,
      userStore.position.lng,
      0.01, // 1km radius
      100
    );
    
    // Group by sequence
    const sequenceMap = new Map();
    images.forEach(img => {
      const seqId = img.sequence;
      if (!seqId) return;
      
      if (!sequenceMap.has(seqId)) {
        sequenceMap.set(seqId, {
          id: seqId,
          images: [],
          color: hashColor(seqId)
        });
      }
      sequenceMap.get(seqId).images.push(img);
    });
    
    // Sort images within each sequence by capture time
    sequenceMap.forEach(seq => {
      seq.images.sort((a, b) => {
        const timeA = new Date(a.captured_at || 0).getTime();
        const timeB = new Date(b.captured_at || 0).getTime();
        return timeA - timeB;
      });
    });
    
    // Convert to array and sort by image count (most images first)
    nearbySequences.value = Array.from(sequenceMap.values())
      .sort((a, b) => b.images.length - a.images.length)
      .slice(0, 5); // Show top 5 sequences
      
  } catch (err) {
    console.error('Failed to fetch nearby sequences:', err);
  } finally {
    isLoading.value = false;
  }
}

function teleportToSequence(sequence) {
  if (sequence.images.length === 0) return;
  
  // Get the first image in the sequence (start of route)
  const firstImage = sequence.images[0];
  const [lng, lat] = firstImage.geometry.coordinates;
  
  userStore.position.lat = lat;
  userStore.position.lng = lng;
  userStore.position.targetImageId = firstImage.id;
}

// Fetch sequences only on initial load
onMounted(() => {
  fetchNearbySequences();
});
</script>

<template>
  <div class="nearby-routes">
    <div class="routes-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <span>Nearby Routes</span>
      <button 
        class="refresh-btn"
        @click="fetchNearbySequences"
        :disabled="isLoading"
        title="Find nearby routes"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
      </button>
    </div>
    
    <div v-if="isLoading" class="loading-text">Loading...</div>
    
    <div v-else-if="nearbySequences.length === 0" class="empty-text">
      No routes nearby
    </div>
    
    <div v-else class="routes-list">
      <button
        v-for="seq in nearbySequences"
        :key="seq.id"
        class="route-item"
        @click="teleportToSequence(seq)"
        :title="`${seq.images.length} images - Click to teleport to start`"
      >
        <div class="route-color" :style="{ backgroundColor: seq.color }"></div>
        <div class="route-info">
          <span class="route-count">{{ seq.images.length }} images</span>
          <span class="route-id">{{ seq.id.slice(0, 8) }}...</span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.nearby-routes {
  position: absolute;
  bottom: 120px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  color: white;
  font-size: 13px;
  z-index: 50;
  min-width: 200px;
  max-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.routes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  opacity: 0.9;
}

.routes-header svg {
  flex-shrink: 0;
  opacity: 0.8;
}

.routes-header span {
  flex: 1;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-text,
.empty-text {
  font-size: 12px;
  opacity: 0.7;
  text-align: center;
  padding: 8px 0;
}

.routes-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.route-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  text-align: left;
}

.route-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.route-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.route-count {
  font-weight: 600;
  font-size: 12px;
}

.route-id {
  font-size: 10px;
  opacity: 0.6;
  font-family: monospace;
}

@media (max-width: 768px) {
  .nearby-routes {
    bottom: 260px;
    right: 20px;
    left: auto;
    max-width: calc(100vw - 40px);
  }
}
</style>
