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
    if (this.currentResolve) {
      this.currentResolve(true);
    }
    this.close();
  }
  
  /**
   * Cancel the current modal action
   */
  cancel() {
    if (this.currentReject) {
      this.currentReject(false);
    }
    this.close();
  }
  
  /**
   * Close the modal
   */
  close() {
    this.overlay.classList.remove('active');
    this.modal.classList.remove('active');
    
    // Clear resolve/reject functions
    this.currentResolve = null;
    this.currentReject = null;
  }
}

// Create global instance
const modalManager = new ModalManager();