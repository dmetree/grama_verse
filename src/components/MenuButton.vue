<script setup>
const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['toggle']);
</script>

<template>
  <button 
    class="menu-button"
    :class="{ open: isOpen }"
    @click="emit('toggle')"
    aria-label="Toggle menu"
  >
    <span class="line line-1"></span>
    <span class="line line-2"></span>
    <span class="line line-3"></span>
  </button>
</template>

<style scoped>
.menu-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.line {
  width: 24px;
  height: 2px;
  background: #333;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Animate to X when open */
.menu-button.open .line-1 {
  transform: translateY(8px) rotate(45deg);
}

.menu-button.open .line-2 {
  opacity: 0;
  transform: scaleX(0);
}

.menu-button.open .line-3 {
  transform: translateY(-8px) rotate(-45deg);
}

@media (max-width: 768px) {
  .menu-button {
    width: 45px;
    height: 45px;
  }
  
  .line {
    width: 20px;
  }
}
</style>
