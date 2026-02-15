<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

const currentPage = ref('landing');

const pages = [
  { id: 'landing', name: 'Home', icon: '🏠' },
  { id: 'map', name: 'Interactive Map', icon: '🗺️' },
  { id: 'roadmap', name: 'Roadmap', icon: '🚀' },
  { id: 'advertise', name: 'Post Ad', icon: '📢' }
];

function navigateTo(pageId) {
  currentPage.value = pageId;
  if (pageId === 'map') {
    emit('close');
  }
}
</script>

<template>
  <div>
    <!-- Backdrop -->
    <transition name="fade">
      <div 
        v-if="isOpen"
        class="sidebar-backdrop"
        @click="emit('close')"
      ></div>
    </transition>
    
    <!-- Sidebar -->
    <transition name="slide">
      <div v-if="isOpen" class="sidebar">
        <!-- Header -->
        <div class="sidebar-header">
          <h2>GramaVerse</h2>
        </div>
        
        <!-- Navigation -->
        <nav class="sidebar-nav">
          <button
            v-for="page in pages"
            :key="page.id"
            class="nav-item"
            :class="{ active: currentPage === page.id }"
            @click="navigateTo(page.id)"
          >
            <span class="nav-icon">{{ page.icon }}</span>
            <span class="nav-name">{{ page.name }}</span>
          </button>
        </nav>
        
        <!-- Content Area -->
        <div class="sidebar-content">
          <!-- Landing Page -->
          <div v-if="currentPage === 'landing'" class="page">
            <h3>Welcome to GramaVerse! 👋</h3>
            <p>Explore Gramado, Brazil through interactive street view imagery powered by Mapillary.</p>
            
            <div class="feature-list">
              <div class="feature">
                <span class="feature-icon">🗺️</span>
                <div>
                  <h4>Interactive Map</h4>
                  <p>Navigate through Gramado's streets with smooth transitions</p>
                </div>
              </div>
              <div class="feature">
                <span class="feature-icon">⌨️</span>
                <div>
                  <h4>Keyboard Controls</h4>
                  <p>Use arrow keys or WASD to move around</p>
                </div>
              </div>
              <div class="feature">
                <span class="feature-icon">🎨</span>
                <div>
                  <h4>Color-Coded Routes</h4>
                  <p>Each route has a unique color for easy tracking</p>
                </div>
              </div>
            </div>
            
            <button class="cta-button" @click="navigateTo('map')">
              Start Exploring →
            </button>
          </div>
          
          <!-- Map Page -->
          <div v-if="currentPage === 'map'" class="page">
            <h3>Interactive Map</h3>
            <p>Click anywhere on the map or use keyboard shortcuts to navigate.</p>
            
            <div class="tips">
              <h4>Quick Tips:</h4>
              <ul>
                <li>Click colored dots to teleport</li>
                <li>Use ↑↓←→ or WASD to navigate</li>
                <li>Click the minimap toggle for different views</li>
                <li>Check nearby routes panel for quick jumps</li>
              </ul>
            </div>
          </div>
          
          <!-- Roadmap Page -->
          <div v-if="currentPage === 'roadmap'" class="page">
            <h3>Roadmap 🚀</h3>
            
            <div class="roadmap-section">
              <h4>✅ Completed</h4>
              <ul class="roadmap-list">
                <li>Multi-colored routes for different sequences</li>
                <li>Glassmorphism minimap with 3 states</li>
                <li>Navigation controls and compass</li>
                <li>Keyboard shortcuts (Arrow keys + WASD)</li>
                <li>Location info and nearby routes panels</li>
                <li>Wide map modal view</li>
              </ul>
            </div>
            
            <div class="roadmap-section">
              <h4>🔮 Planned</h4>
              <ul class="roadmap-list">
                <li>User annotations on images</li>
                <li>YouTube video overlays</li>
                <li>Business listings on map</li>
                <li>Search functionality</li>
                <li>User accounts & authentication</li>
                <li>Favorites and bookmarks</li>
                <li>Mobile app version</li>
              </ul>
            </div>
          </div>
          
          <!-- Post Advertisement Page -->
          <div v-if="currentPage === 'advertise'" class="page">
            <h3>Post Your Business 📢</h3>
            <p>Promote your business on GramaVerse! Add your listing to specific locations on the map.</p>
            
            <form class="ad-form" @submit.prevent>
              <div class="form-group">
                <label>Business Name</label>
                <input type="text" placeholder="Your business name" />
              </div>
              
              <div class="form-group">
                <label>Description</label>
                <textarea placeholder="Tell us about your business" rows="3"></textarea>
              </div>
              
              <div class="form-group">
                <label>Location</label>
                <input type="text" placeholder="Address or coordinates" />
              </div>
              
              <div class="form-group">
                <label>Media Link (Video/Poster)</label>
                <input type="url" placeholder="https://..." />
              </div>
              
              <div class="pricing-info">
                <p><strong>Pricing:</strong> Contact us for listing options</p>
              </div>
              
              <button type="submit" class="submit-btn">Submit Listing</button>
            </form>
          </div>
        </div>
        
        <!-- Contact Section -->
        <div class="sidebar-footer">
          <h4>Contact Us</h4>
          <div class="contact-links">
            <a 
              href="https://api.whatsapp.com/send/?phone=5553981332682&text=Hello%21+I+am+interested+in+your+map+listings.&type=phone_number&app_absent=0"
              target="_blank"
              class="contact-link"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            <a 
              href="#"
              target="_blank"
              class="contact-link disabled"
              title="Coming soon"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2500;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 380px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  z-index: 2600;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #666;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.sidebar-nav {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-item {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.nav-icon {
  font-size: 20px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.page h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.page p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.feature {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
}

.feature-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.feature h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.feature p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.cta-button {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.tips {
  background: rgba(59, 130, 246, 0.05);
  padding: 16px;
  border-radius: 12px;
  border-left: 3px solid #3b82f6;
}

.tips h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
}

.tips li {
  margin-bottom: 6px;
  color: #666;
  font-size: 13px;
}

.roadmap-section {
  margin-bottom: 24px;
}

.roadmap-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.roadmap-list {
  margin: 0;
  padding-left: 20px;
}

.roadmap-list li {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.ad-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.pricing-info {
  padding: 12px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  border-left: 3px solid #fbbf24;
}

.pricing-info p {
  margin: 0;
  font-size: 13px;
  color: #92400e;
}

.submit-btn {
  padding: 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.02);
}

.sidebar-footer h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.contact-link:hover:not(.disabled) {
  background: #25d366;
  color: white;
  transform: translateX(4px);
}

.contact-link.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    max-width: 90vw;
  }
}
</style>
