/**
 * Nebula Parallax Effect
 * Creates a subtle parallax effect based on device tilt
 */

class NebulaParallax {
  constructor() {
    this.isEnabled = true;
    this.isSupported = "DeviceOrientationEvent" in window;
    this.nebulaElement = null;
    this.lastAlpha = 0;
    this.lastBeta = 0;
    this.smoothing = 0.1;

    this.init();
  }

  init() {
    this.nebulaElement = document.querySelector(".nebula-bg");
    if (!this.nebulaElement) return;

    this.setupDeviceOrientation();
    this.checkPreference();
  }

  checkPreference() {
    // Check if user has reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    this.isEnabled = !prefersReducedMotion.matches;

    // Listen for preference changes
    prefersReducedMotion.addEventListener("change", (e) => {
      this.isEnabled = !e.matches;
      if (this.isEnabled) {
        this.startParallax();
      } else {
        this.stopParallax();
      }
    });
  }

  setupDeviceOrientation() {
    if (!this.isSupported || !this.isEnabled) return;

    // Request permission for iOS 13+
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            this.startParallax();
          }
        })
        .catch(console.error);
    } else {
      // For other browsers
      this.startParallax();
    }
  }

  startParallax() {
    if (!this.isEnabled) return;

    window.addEventListener(
      "deviceorientation",
      this.handleOrientation.bind(this)
    );
  }

  stopParallax() {
    window.removeEventListener(
      "deviceorientation",
      this.handleOrientation.bind(this)
    );
    if (this.nebulaElement) {
      this.nebulaElement.style.transform = "";
    }
  }

  handleOrientation(event) {
    if (!this.nebulaElement || !this.isEnabled) return;

    const { alpha, beta, gamma } = event;

    // Smooth the values to prevent jerky movements
    const smoothedAlpha = this.smoothValue(alpha, this.lastAlpha);
    const smoothedBeta = this.smoothValue(beta, this.lastBeta);

    this.lastAlpha = smoothedAlpha;
    this.lastBeta = smoothedBeta;

    // Calculate subtle movement
    const moveX = (smoothedGamma || 0) * 0.5;
    const moveY = (smoothedBeta || 0) * 0.3;

    // Apply transform with limits
    const limitedMoveX = Math.max(-10, Math.min(10, moveX));
    const limitedMoveY = Math.max(-5, Math.min(5, moveY));

    this.nebulaElement.style.transform = `translate(${limitedMoveX}px, ${limitedMoveY}px)`;
  }

  smoothValue(current, previous) {
    if (!current || !previous) return current || 0;
    return previous + (current - previous) * this.smoothing;
  }

  enable() {
    this.isEnabled = true;
    this.startParallax();
  }

  disable() {
    this.isEnabled = false;
    this.stopParallax();
  }
}

// Create global nebula parallax instance
const nebulaParallax = new NebulaParallax();

// Export for debugging
if (window.DEV) {
  window.nebulaParallax = nebulaParallax;
}
