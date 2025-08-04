/**
 * Modal Manager - Handles all custom modal functionality
 * Provides a consistent, styled modal system that fits the luxury design language
 */
class ModalManager {
  constructor() {
    this.modal = document.getElementById('modal');
    this.overlay = document.getElementById('modalOverlay');
    this.titleElement = document.getElementById('modalTitle');
    this.descriptionElement = document.getElementById('modalDescription');
    this.cancelButton = document.getElementById('modalCancelButton');
    this.confirmButton = document.getElementById('modalConfirmButton');
    this.closeButton = document.querySelector('.modal-close');
    
    this.currentResolve = null;
    this.currentReject = null;
    this.soundPlayed = false;
    this.isProcessing = false;
    
    this.init();
  }
  
  /**
   * Initialize the modal manager
   */
  init() {
    // Setup event listeners
    this.overlay.addEventListener('click', () => this.close());
    this.closeButton.addEventListener('click', () => this.close());
    this.cancelButton.addEventListener('click', () => this.cancel());
    this.confirmButton.addEventListener('click', () => this.confirm());
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }
  
  /**
   * Show a confirmation modal
   * @param {Object} options - Modal configuration
   * @param {string} options.title - Modal title
   * @param {string} options.message - Modal message
   * @param {string} [options.cancelText="Cancel"] - Cancel button text
   * @param {string} [options.confirmText="Confirm"] - Confirm button text
   * @param {string} [options.confirmStyle="primary"] - Button style (primary, danger)
   * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false if cancelled
   */
  async show(options = {}) {
    return new Promise((resolve, reject) => {
      // Store resolve/reject functions for later use
      this.currentResolve = resolve;
      this.currentReject = reject;
      
      // Configure modal content
      this.titleElement.textContent = options.title || 'Confirm Action';
      this.descriptionElement.textContent = options.message || 'Are you sure you want to perform this action?';
      
      // Configure button text
      this.cancelButton.textContent = options.cancelText || 'Cancel';
      this.confirmButton.textContent = options.confirmText || 'Confirm';
      
      // Configure button style
      if (options.confirmStyle === 'danger') {
        this.confirmButton.className = 'btn btn--danger-hybrid';
      } else {
        this.confirmButton.className = 'btn btn--primary';
      }
      
      // Show modal
      this.overlay.classList.add('active');
      this.modal.classList.add('active');
      
      // Focus confirm button for accessibility
      this.confirmButton.focus();
    });
  }
  
  /*
   * Show a delete confirmation modal with specific styling
   * @param {string} taskTitle - Title of the task to be deleted
   * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false if cancelled
   */
  async showDeleteConfirm(taskTitle) {
    // Add special class for delete modal styling
    this.modal.classList.add('delete-modal');
    
    return this.show({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`,
      cancelText: 'Cancel',
      confirmText: 'Delete',
      confirmStyle: 'danger'
    });
  }
  
  /**
   * Confirm the current modal action
   */
  confirm() {
    // Prevent multiple processing
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Disable buttons during processing
    this.confirmButton.disabled = true;
    this.cancelButton.disabled = true;
    
    if (this.currentResolve) {
      // Check if this is a delete action
      if (this.confirmButton.classList.contains('btn--danger-hybrid')) {
        // Add deleting class for animations
        this.modal.classList.add('deleting');
        
        // Create particle effects
        this.createParticleEffect();
        
        // Play sound effect if available (only once)
        if (typeof audioManager !== 'undefined' && !this.soundPlayed) {
          audioManager.play('delete');
          this.soundPlayed = true; // Mark sound as played
        }
        
        // Resolve after animations complete
        setTimeout(() => {
          this.currentResolve(true);
          this.close();
          // Reset flags when modal is closed
          this.soundPlayed = false;
          this.isProcessing = false;
        }, 600);
      } else {
        // For non-delete actions, resolve immediately
        this.currentResolve(true);
        this.close();
        // Reset flags
        this.isProcessing = false;
      }
    } else {
      this.close();
      // Reset flags
      this.isProcessing = false;
    }
  }
  
  /**
   * Cancel the current modal action
   */
  cancel() {
    // Reset flags
    this.soundPlayed = false;
    this.isProcessing = false;
    
    // Enable buttons
    this.confirmButton.disabled = false;
    this.cancelButton.disabled = false;
    
    if (this.currentReject) {
      this.currentReject(false);
    }
    this.close();
  }
  
  /**
   * Create particle effect for delete confirmation
   */
  createParticleEffect() {
    // Create particle container if it doesn't exist
    let particleContainer = this.modal.querySelector('.particle-container');
    if (!particleContainer) {
      particleContainer = document.createElement('div');
      particleContainer.className = 'particle-container';
      this.modal.appendChild(particleContainer);
    }
    
    // Clear existing particles
    particleContainer.innerHTML = '';
    
    // Get modal position for particle origin
    const modalRect = this.modal.getBoundingClientRect();
    const centerX = modalRect.width / 2;
    const centerY = modalRect.height / 2;
    
    // Create main particles with enhanced visibility
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random angle and distance
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 120 + Math.random() * 150;
      
      // Calculate end position
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      // Set CSS custom properties for animation
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      // Set random starting position near center with slight variation
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      particle.style.left = `${centerX + offsetX}px`;
      particle.style.top = `${centerY + offsetY}px`;
      
      // Add random delay
      particle.style.animationDelay = `${Math.random() * 0.4}s`;
      
      // Vary particle sizes for more dynamic effect
      const size = 6 + Math.random() * 6;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      particleContainer.appendChild(particle);
    }
    
    // Create ambient particles for enhanced atmosphere
    const ambientParticleCount = 20;
    for (let i = 0; i < ambientParticleCount; i++) {
      const ambientParticle = document.createElement('div');
      ambientParticle.className = 'ambient-particle';
      
      // Random angle and distance
      const angle = (Math.PI * 2 * i) / ambientParticleCount + (Math.random() - 0.5) * 0.8;
      const distance = 180 + Math.random() * 170;
      
      // Calculate end position
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      // Set CSS custom properties for animation
      ambientParticle.style.setProperty('--tx', `${tx}px`);
      ambientParticle.style.setProperty('--ty', `${ty}px`);
      
      // Set random starting position near center with slight variation
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;
      ambientParticle.style.left = `${centerX + offsetX}px`;
      ambientParticle.style.top = `${centerY + offsetY}px`;
      
      // Add random delay
      ambientParticle.style.animationDelay = `${Math.random() * 0.6}s`;
      
      // Vary ambient particle sizes
      const size = 3 + Math.random() * 4;
      ambientParticle.style.width = `${size}px`;
      ambientParticle.style.height = `${size}px`;
      
      particleContainer.appendChild(ambientParticle);
    }
    
    // Add some extra sparkles for more visual impact
    const sparkleCount = 10;
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'particle';
      sparkle.style.background = 'white';
      sparkle.style.boxShadow = `0 0 ${8 + Math.random() * 8}px var(--danger-text)`;
      
      // Random angle and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 80;
      
      // Calculate end position
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      // Set CSS custom properties for animation
      sparkle.style.setProperty('--tx', `${tx}px`);
      sparkle.style.setProperty('--ty', `${ty}px`);
      
      // Set random starting position near center
      sparkle.style.left = `${centerX}px`;
      sparkle.style.top = `${centerY}px`;
      
      // Add random delay
      sparkle.style.animationDelay = `${Math.random() * 0.2}s`;
      
      // Smaller size for sparkles
      sparkle.style.width = '4px';
      sparkle.style.height = '4px';
      
      particleContainer.appendChild(sparkle);
    }
  }
  
  /**
   * Close the modal
   */
  close() {
    this.overlay.classList.remove('active');
    this.modal.classList.remove('active');
    this.modal.classList.remove('deleting'); // Remove deleting class
    this.modal.classList.remove('delete-modal'); // Remove delete modal class
    
    // Reset flags and enable buttons
    this.soundPlayed = false;
    this.isProcessing = false;
    this.confirmButton.disabled = false;
    this.cancelButton.disabled = false;
    
    // Clear resolve/reject functions
    this.currentResolve = null;
    this.currentReject = null;
  }
}

// Create global instance
const modalManager = new ModalManager();
