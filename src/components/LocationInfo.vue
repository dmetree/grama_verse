<script setup>
import { computed } from 'vue';

const props = defineProps({
  lat: Number,
  lng: Number,
  captureDate: String,
  sequenceId: String,
  imageCount: Number
});

const formattedDate = computed(() => {
  if (!props.captureDate) return 'Unknown';
  const date = new Date(props.captureDate);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
});

const coordinates = computed(() => {
  if (!props.lat || !props.lng) return 'Unknown location';
  return `${props.lat.toFixed(6)}, ${props.lng.toFixed(6)}`;
});
</script>

<template>
  <div class="location-info">
    <div class="info-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <span>{{ coordinates }}</span>
    </div>
    
    <div v-if="captureDate" class="info-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span>{{ formattedDate }}</span>
    </div>
    
    <div v-if="imageCount" class="info-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>{{ imageCount }} images in sequence</span>
    </div>
  </div>
</template>

<style scoped>
.location-info {
  position: absolute;
  bottom: 120px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 13px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 300px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item svg {
  flex-shrink: 0;
  opacity: 0.8;
}

.info-item span {
  font-weight: 500;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .location-info {
    bottom: 260px;
    left: 50%;
    transform: translateX(-50%);
    max-width: calc(100% - 40px);
  }
}
</style>
