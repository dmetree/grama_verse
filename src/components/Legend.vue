<script setup>
import { ref } from 'vue';

const isExpanded = ref(false);
</script>

<template>
  <div class="legend" :class="{ expanded: isExpanded }">
    <button 
      class="legend-toggle"
      @click="isExpanded = !isExpanded"
      :aria-label="isExpanded ? 'Hide legend' : 'Show legend'"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span v-if="!isExpanded">Help</span>
    </button>
    
    <transition name="slide">
      <div v-if="isExpanded" class="legend-content">
        <h3>How to Navigate</h3>
        
        <div class="legend-section">
          <h4>Keyboard Shortcuts</h4>
          <ul>
            <li><kbd>↑</kbd> or <kbd>W</kbd> - Move forward</li>
            <li><kbd>↓</kbd> or <kbd>S</kbd> - Move backward</li>
            <li><kbd>←</kbd> or <kbd>A</kbd> - Turn left</li>
            <li><kbd>→</kbd> or <kbd>D</kbd> - Turn right</li>
          </ul>
        </div>
        
        <div class="legend-section">
          <h4>Minimap</h4>
          <ul>
            <li>Each color represents a different capture route</li>
            <li>Click dots to teleport to that location</li>
            <li>Click empty areas to search nearby</li>
            <li>Use toggle button to minimize/expand</li>
          </ul>
        </div>
        
        <div class="legend-section">
          <h4>Street View</h4>
          <ul>
            <li>Use keyboard arrows or WASD to navigate</li>
            <li>Compass shows current direction</li>
            <li>Click and drag to look around</li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.legend {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 60;
}

.legend-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.legend-toggle:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.legend.expanded .legend-toggle {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.legend-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 16px;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.legend-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.legend-section {
  margin-bottom: 16px;
}

.legend-section:last-child {
  margin-bottom: 0;
}

.legend-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.legend-section ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.legend-section li {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  line-height: 1.5;
}

kbd {
  display: inline-block;
  padding: 2px 6px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
  font-weight: 600;
  color: #333;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .legend {
    top: auto;
    bottom: 20px;
    right: 20px;
    left: auto;
  }
  
  .legend-content {
    max-width: calc(100vw - 40px);
  }
}
</style>
