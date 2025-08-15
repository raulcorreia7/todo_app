/**
 * Animation and celebration effects for Luxury Todo
 * Handles particle effects, transitions, and visual feedback
 */

class AnimationManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.isAnimating = false;
    this.animationId = null;

    this.init();
  }

  /**
   * Initialize animation system
   */
  init() {
    this.createCanvas();
    this.setupEventListeners();
  }

  /**
   * Create canvas for particle effects
   */
  createCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "animation-canvas";
    this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  /**
   * Resize canvas to match window
   */
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for task completion events
    bus.addEventListener("taskCompleted", (e) => {
      this.createTaskCompleteEffect(e.detail.taskElement);
    });

    // Listen for all tasks completed
    bus.addEventListener("allTasksCompleted", () => {
      this.createVictoryCelebration();
    });

    // Listen for settings changes
    bus.addEventListener("settingsChanged", (e) => {
      if (e.detail && e.detail.animations !== undefined) {
        this.toggleAnimations(e.detail.animations);
      }
    });

    // Listen for theme changes
    bus.addEventListener("themeChanged", (e) => {
      this.handleThemeChange(e.detail.theme);
    });
  }

  /**
   * Create AI edit feedback effect
   * @param {HTMLElement} element - The element being edited
   * @param {string} type - Type of feedback ('active', 'success', 'loading')
   */
  createAIEditFeedback(element, type = "active") {
    if (!element || !settingsManager.getSettings().animations) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Get current theme properties
    const theme = themeManager.getCurrentTheme();
    if (!theme) return;

    // Create theme-adaptive particle effect
    this.createThemeAdaptiveParticles(centerX, centerY, theme, type);

    // Add glow effect to element
    this.addAIGlowEffect(element, type);
  }

  /**
   * Create divine motion path for particles
   * @returns {Object} Motion path configuration
   */
  createDivineMotionPath() {
    return {
      phase: Math.random() * Math.PI * 2,
      amplitude: 20 + Math.random() * 30,
      frequency: 0.01 + Math.random() * 0.02,
      verticalDrift: (Math.random() - 0.5) * 0.5,
    };
  }

  /**
   * Animate theme-adaptive particles
   * @param {Array} particles - Array of particles
   * @param {string} type - Animation type
   */
  animateThemeParticles(particles, type) {
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let activeParticles = 0;

      particles.forEach((particle) => {
        // Apply divine motion
        if (particle.divineMotion) {
          particle.divineMotion.phase += particle.divineMotion.frequency;
          const divineX =
            Math.cos(particle.divineMotion.phase) *
            particle.divineMotion.amplitude;
          const divineY =
            Math.sin(particle.divineMotion.phase) *
            particle.divineMotion.amplitude *
            0.5;

          particle.x +=
            divineX * 0.01 + particle.vx + particle.divineMotion.verticalDrift;
          particle.y += divineY * 0.01 + particle.vy;
        } else {
          particle.x += particle.vx;
          particle.y += particle.vy;
        }

        // Apply rotation
        particle.rotation += particle.rotationSpeed;

        // Apply life decay
        particle.life -= particle.decay;
        particle.opacity = particle.life;

        // Special behavior for different types
        if (type === "loading") {
          // Particles orbit in loading state
          const centerX = this.canvas.width / 2;
          const centerY = this.canvas.height / 2;
          const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
          particle.x =
            centerX + Math.cos(angle + 0.02) * Math.abs(particle.x - centerX);
          particle.y =
            centerY + Math.sin(angle + 0.02) * Math.abs(particle.y - centerY);
        }

        if (particle.life > 0) {
          activeParticles++;

          this.ctx.save();
          this.ctx.globalAlpha = particle.opacity;
          this.ctx.translate(particle.x, particle.y);
          this.ctx.rotate(particle.rotation);

          // Draw particle with divine glow effect
          if (type === "success") {
            // Success particles have a star shape
            this.drawStarParticle(particle);
          } else {
            // Regular particles with glow
            this.drawGlowParticle(particle);
          }

          this.ctx.restore();
        }
      });

      if (activeParticles > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Draw glowing particle
   * @param {Object} particle - Particle object
   */
  drawGlowParticle(particle) {
    // Outer glow
    const gradient = this.ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      particle.size * 3
    );
    gradient.addColorStop(0, particle.glowColor + "40");
    gradient.addColorStop(0.5, particle.glowColor + "20");
    gradient.addColorStop(1, "transparent");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size * 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner core
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw star-shaped particle for success state
   * @param {Object} particle - Particle object
   */
  drawStarParticle(particle) {
    const spikes = 5;
    const outerRadius = particle.size * 2;
    const innerRadius = particle.size;

    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.closePath();
    this.ctx.fill();

    // Add glow effect
    this.ctx.shadowColor = particle.glowColor;
    this.ctx.shadowBlur = 10;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  /**
   * Create task completion effect
   * @param {HTMLElement} taskElement - The task element that was completed
   */
  createTaskCompleteEffect(taskElement) {
    if (!taskElement || !settingsManager.getSettings().animations) return;

    const rect = taskElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create sparkle burst
    this.createSparkleBurst(centerX, centerY);

    // Create mood bloom petals
    this.createMoodBloom(centerX, centerY);
  }

  /**
   * Create sparkle burst effect
   * @param {number} x - Center x coordinate
   * @param {number} y - Center y coordinate
   */
  createSparkleBurst(x, y) {
    const sparkles = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;

      sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: 2 + Math.random() * 4,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        color: this.getRandomSparkleColor(),
      });
    }

    this.animateSparkles(sparkles);
  }

  /**
   * Create mood bloom petals
   * @param {number} x - Center x coordinate
   * @param {number} y - Center y coordinate
   */
  createMoodBloom(x, y) {
    const petals = [];
    const count = 6;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 20 + Math.random() * 30;

      petals.push({
        x: x,
        y: y,
        targetX: x + Math.cos(angle) * radius,
        targetY: y + Math.sin(angle) * radius,
        size: 8 + Math.random() * 12,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 0.8,
        fadeSpeed: 0.01,
        color: this.getRandomPetalColor(),
      });
    }

    this.animatePetals(petals);
  }

  /**
   * Create victory celebration
   */
  createVictoryCelebration() {
    if (!settingsManager.getSettings().animations) return;

    // Show canvas
    this.canvas.style.opacity = "1";

    // Create multiple burst effects
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Large central burst
    this.createSparkleBurst(centerX, centerY);

    // Multiple smaller bursts around
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = centerX + (Math.random() - 0.5) * 400;
        const y = centerY + (Math.random() - 0.5) * 400;
        this.createSparkleBurst(x, y);
      }, i * 200);
    }

    // Hide canvas after celebration
    setTimeout(() => {
      this.canvas.style.opacity = "0";
    }, 3000);
  }

  /**
   * Animate sparkles
   * @param {Array} sparkles - Array of sparkle particles
   */
  animateSparkles(sparkles) {
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let activeSparkles = 0;

      sparkles.forEach((sparkle) => {
        sparkle.x += sparkle.vx;
        sparkle.y += sparkle.vy;
        sparkle.vy += 0.1; // gravity
        sparkle.life -= sparkle.decay;

        if (sparkle.life > 0) {
          activeSparkles++;

          this.ctx.save();
          this.ctx.globalAlpha = sparkle.life;
          this.ctx.fillStyle = sparkle.color;
          this.ctx.beginPath();
          this.ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
          this.ctx.fill();

          // Add sparkle effect
          this.ctx.strokeStyle = sparkle.color;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(sparkle.x - sparkle.size * 2, sparkle.y);
          this.ctx.lineTo(sparkle.x + sparkle.size * 2, sparkle.y);
          this.ctx.moveTo(sparkle.x, sparkle.y - sparkle.size * 2);
          this.ctx.lineTo(sparkle.x, sparkle.y + sparkle.size * 2);
          this.ctx.stroke();
          this.ctx.restore();
        }
      });

      if (activeSparkles > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Animate petals
   * @param {Array} petals - Array of petal particles
   */
  animatePetals(petals) {
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let activePetals = 0;

      petals.forEach((petal) => {
        // Move towards target
        petal.x += (petal.targetX - petal.x) * 0.05;
        petal.y += (petal.targetY - petal.y) * 0.05;

        // Rotate
        petal.rotation += petal.rotationSpeed;

        // Fade
        petal.opacity -= petal.fadeSpeed;

        if (petal.opacity > 0) {
          activePetals++;

          this.ctx.save();
          this.ctx.globalAlpha = petal.opacity;
          this.ctx.translate(petal.x, petal.y);
          this.ctx.rotate(petal.rotation);

          // Draw petal shape
          this.ctx.fillStyle = petal.color;
          this.ctx.beginPath();
          this.ctx.ellipse(
            0,
            0,
            petal.size,
            petal.size * 0.6,
            0,
            0,
            Math.PI * 2
          );
          this.ctx.fill();

          this.ctx.restore();
        }
      });

      if (activePetals > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Create hover effect for task items
   * @param {HTMLElement} element - Task element
   */
  createHoverEffect(element) {
    if (!settingsManager.getSettings().animations) return;

    element.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
    element.style.transform = "translateY(-2px)";
    element.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";

    element.addEventListener(
      "mouseleave",
      () => {
        element.style.transform = "translateY(0)";
        element.style.boxShadow = "";
      },
      { once: true }
    );
  }

  /**
   * Create button press effect
   * @param {HTMLElement} button - Button element
   */
  createButtonPress(button) {
    if (!settingsManager.getSettings().animations) return;

    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "";
    }, 150);
  }

  /**
   * Create checkbox toggle effect
   * @param {HTMLElement} checkbox - Checkbox element
   */
  createCheckboxToggle(checkbox) {
    if (!settingsManager.getSettings().animations) return;

    checkbox.style.transform = "scale(1.2)";
    setTimeout(() => {
      checkbox.style.transform = "";
    }, 200);
  }

  /**
   * Create smooth scroll effect
   * @param {HTMLElement} element - Element to scroll to
   */
  smoothScrollTo(element) {
    if (!settingsManager.getSettings().animations) {
      element.scrollIntoView();
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  /**
   * Toggle animations on/off
   * @param {boolean} enabled - Whether to enable animations
   */
  toggleAnimations(enabled) {
    if (!enabled) {
      this.canvas.style.display = "none";
    } else {
      this.canvas.style.display = "block";
    }
  }

  /**
   * Get random sparkle color
   * @returns {string} - CSS color
   */
  getRandomSparkleColor() {
    const colors = [
      "#FFD700", // Gold
      "#87CEEB", // Sky Blue
      "#DDA0DD", // Plum
      "#98FB98", // Pale Green
      "#F0E68C", // Khaki
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get random petal color
   * @returns {string} - CSS color with transparency
   */
  getRandomPetalColor() {
    const colors = [
      "rgba(255, 182, 193, 0.7)", // Light Pink
      "rgba(173, 216, 230, 0.7)", // Light Blue
      "rgba(221, 160, 221, 0.7)", // Plum
      "rgba(144, 238, 144, 0.7)", // Light Green
      "rgba(255, 218, 185, 0.7)", // Peach
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Create loading shimmer effect
   * @param {HTMLElement} element - Element to apply shimmer to
   */
  createLoadingShimmer(element) {
    if (!settingsManager.getSettings().animations) return;

    element.style.background =
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)";
    element.style.backgroundSize = "200% 100%";
    element.style.animation = "shimmer 1.5s infinite";
  }

  /**
   * Remove loading shimmer effect
   * @param {HTMLElement} element - Element to remove shimmer from
   */
  removeLoadingShimmer(element) {
    element.style.background = "";
    element.style.animation = "";
  }

  /**
   * Handle theme change events
   * @param {string} themeName - Name of the new theme
   */
  handleThemeChange(themeName) {
    const theme = themeManager.getTheme(themeName);
    if (!theme) return;

    // Update canvas styling based on theme
    this.updateCanvasForTheme(theme);

    // Clear existing particles for smooth transition
    this.clearCurrentParticles();

    // Update animation timing
    this.updateAnimationTiming(theme);
  }

  /**
   * Update canvas styling for the current theme
   * @param {Object} theme - Current theme object
   */
  updateCanvasForTheme(theme) {
    // Apply theme-specific canvas styling
    if (theme.tags?.includes("dark")) {
      this.canvas.style.filter = "brightness(0.8) contrast(1.1)";
    } else {
      this.canvas.style.filter = "brightness(1.1) contrast(0.9)";
    }

    // Special handling for specific themes
    switch (theme.name) {
      case "Arctic Sky":
        this.canvas.style.filter +=
          " drop-shadow(0 0 10px rgba(77, 166, 255, 0.3))";
        break;
      case "Aurora":
        this.canvas.style.filter +=
          " drop-shadow(0 0 10px rgba(0, 255, 136, 0.3))";
        break;
      case "Midnight":
        this.canvas.style.filter +=
          " drop-shadow(0 0 10px rgba(233, 69, 96, 0.3))";
        break;
    }
  }

  /**
   * Clear current particles for smooth theme transition
   */
  clearCurrentParticles() {
    // Clear canvas immediately
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Reset particles array
    this.particles = [];

    // Cancel any ongoing animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update animation timing based on theme
   * @param {Object} theme - Current theme object
   */
  updateAnimationTiming(theme) {
    const duration = theme.animationDuration || "2.5s";
    const easing = theme.animationEasing || "cubic-bezier(0.4, 0, 0.2, 1)";

    // Update CSS custom properties for animations
    document.documentElement.style.setProperty(
      "--animation-duration",
      duration
    );
    document.documentElement.style.setProperty("--animation-easing", easing);

    // Update canvas transition timing
    this.canvas.style.transition = `all ${duration} ${easing}`;
  }

  /**
   * Create theme transition effect
   * @param {string} fromTheme - Previous theme name
   * @param {string} toTheme - New theme name
   */
  createThemeTransitionEffect(fromTheme, toTheme) {
    if (!settingsManager.getSettings().animations) return;

    const from = themeManager.getTheme(fromTheme);
    const to = themeManager.getTheme(toTheme);
    if (!from || !to) return;

    // Create transition particles at screen center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Blend colors from both themes
    const transitionParticles = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 50 + Math.random() * 100;

      transitionParticles.push({
        x: centerX,
        y: centerY,
        targetX: centerX + Math.cos(angle) * radius,
        targetY: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 3 + Math.random() * 4,
        life: 1,
        decay: 0.02,
        color: this.blendThemeColors(from.glowPrimary, to.glowPrimary),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        opacity: 0.8,
      });
    }

    this.animateTransitionParticles(transitionParticles);
  }

  /**
   * Blend two theme colors for transition effect
   * @param {string} color1 - First theme color
   * @param {string} color2 - Second theme color
   * @returns {string} Blended color
   */
  blendThemeColors(color1, color2) {
    // Simple color blending - in a real implementation, you might want more sophisticated color mixing
    return Math.random() > 0.5 ? color1 : color2;
  }

  /**
   * Animate transition particles
   * @param {Array} particles - Transition particles
   */
  animateTransitionParticles(particles) {
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let activeParticles = 0;

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        particle.opacity = particle.life;
        particle.rotation += particle.rotationSpeed;

        if (particle.life > 0) {
          activeParticles++;

          this.ctx.save();
          this.ctx.globalAlpha = particle.opacity;
          this.ctx.translate(particle.x, particle.y);
          this.ctx.rotate(particle.rotation);

          // Draw transition particle with special effect
          const gradient = this.ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            particle.size * 2
          );
          gradient.addColorStop(0, particle.color + "80");
          gradient.addColorStop(1, "transparent");

          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.restore();
        }
      });

      if (activeParticles > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Get theme-specific particle configuration
   * @param {Object} theme - Theme object
   * @returns {Object} Particle configuration
   */
  getThemeParticleConfig(theme) {
    return {
      count: parseInt(theme.particleCount) || 50,
      size: parseInt(theme.particleSize) || 3,
      color: theme.particleColor || "#ffffff",
      glowColor: theme.glowPrimary || "#ffffff",
      speed: theme.tags?.includes("dark") ? 1.2 : 0.8,
      lifetime: theme.tags?.includes("light") ? 2.0 : 3.0,
    };
  }

  /**
   * Create divine blessing effect for special achievements
   * @param {HTMLElement} element - Element to create effect around
   */
  createDivineBlessing(element) {
    if (!element || !settingsManager.getSettings().animations) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const theme = themeManager.getCurrentTheme();
    const config = this.getThemeParticleConfig(theme);

    // Create sacred geometry pattern
    this.createSacredGeometry(centerX, centerY, config);
  }

  /**
   * Create sacred geometry particle pattern
   * @param {number} x - Center x coordinate
   * @param {number} y - Center y coordinate
   * @param {Object} config - Particle configuration
   */
  createSacredGeometry(x, y, config) {
    const particles = [];
    const layers = 3;
    const particlesPerLayer = config.count / layers;

    for (let layer = 0; layer < layers; layer++) {
      const radius = 30 + layer * 40;
      const speed = 0.5 + layer * 0.3;

      for (let i = 0; i < particlesPerLayer; i++) {
        const angle = (i / particlesPerLayer) * Math.PI * 2;
        const divineOffset = Math.sin(angle * 3) * 10; // Sacred pattern

        particles.push({
          x: x + Math.cos(angle) * (radius + divineOffset),
          y: y + Math.sin(angle) * (radius + divineOffset),
          originalX: x + Math.cos(angle) * radius,
          originalY: y + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          size: config.size * (1 - layer * 0.2),
          life: 1,
          decay: 0.005,
          color: config.color,
          glowColor: config.glowColor,
          layer: layer,
          sacredPhase: Math.random() * Math.PI * 2,
          sacredSpeed: speed,
        });
      }
    }

    this.animateSacredGeometry(particles);
  }

  /**
   * Animate sacred geometry particles
   * @param {Array} particles - Sacred geometry particles
   */
  animateSacredGeometry(particles) {
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let activeParticles = 0;

      particles.forEach((particle) => {
        // Sacred motion - circular with divine pattern
        particle.sacredPhase += particle.sacredSpeed * 0.02;
        const divineX = Math.cos(particle.sacredPhase) * 20;
        const divineY = Math.sin(particle.sacredPhase) * 20;

        particle.x = particle.originalX + divineX;
        particle.y = particle.originalY + divineY;

        particle.life -= particle.decay;
        particle.opacity = particle.life;

        if (particle.life > 0) {
          activeParticles++;

          this.ctx.save();
          this.ctx.globalAlpha = particle.opacity;
          this.ctx.translate(particle.x, particle.y);

          // Draw sacred particle with enhanced glow
          this.drawSacredParticle(particle);

          this.ctx.restore();
        }
      });

      if (activeParticles > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Draw sacred particle with enhanced divine effects
   * @param {Object} particle - Sacred particle
   */
  drawSacredParticle(particle) {
    // Multi-layered glow effect
    const glowLayers = 3;

    for (let layer = glowLayers; layer > 0; layer--) {
      const size = particle.size * layer;
      const opacity = (particle.opacity * 0.3) / layer;

      this.ctx.globalAlpha = opacity;
      this.ctx.fillStyle = particle.glowColor;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Inner core
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Start particle effect using Canvas API
   * @param {HTMLElement} element - Element to center particles on
   */
  startParticleEffect(element) {
    if (!element || !settingsManager.getSettings().animations) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Get current theme properties
    const theme = themeManager.getCurrentTheme();
    if (!theme) return;

    // Create particles with theme-adaptive colors
    const particleCount = parseInt(theme.particleCount) || 50;
    const particleSize = parseInt(theme.particleSize) || 3;
    const particleColor = theme.particleColor || "#ffffff";
    const glowPrimary = theme.glowPrimary || particleColor;
    const glowSecondary = theme.glowSecondary || particleColor;

    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 30 + Math.random() * 50;
      const speed = 0.5 + Math.random() * 1.5;

      particles.push({
        x: centerX,
        y: centerY,
        targetX: centerX + Math.cos(angle) * radius,
        targetY: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: particleSize + Math.random() * 2,
        life: 1,
        decay: 0.01,
        color: particleColor,
        glowColor: glowPrimary,
        secondaryGlowColor: glowSecondary,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.8,
        divineMotion: this.createDivineMotionPath(),
      });
    }

    this.animateParticles(particles, "success");
  }

  /**
   * Animate particles with divine motion
   * @param {Array} particles - Array of particles
   * @param {string} type - Animation type
   */
  animateParticles(particles, type) {
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let activeParticles = 0;

      particles.forEach((particle) => {
        // Apply divine motion
        if (particle.divineMotion) {
          particle.divineMotion.phase += particle.divineMotion.frequency;
          const divineX =
            Math.cos(particle.divineMotion.phase) *
            particle.divineMotion.amplitude;
          const divineY =
            Math.sin(particle.divineMotion.phase) *
            particle.divineMotion.amplitude *
            0.5;

          particle.x +=
            divineX * 0.01 + particle.vx + particle.divineMotion.verticalDrift;
          particle.y += divineY * 0.01 + particle.vy;
        } else {
          particle.x += particle.vx;
          particle.y += particle.vy;
        }

        // Apply rotation
        particle.rotation += particle.rotationSpeed;

        // Apply life decay
        particle.life -= particle.decay;
        particle.opacity = particle.life;

        if (particle.life > 0) {
          activeParticles++;

          this.ctx.save();
          this.ctx.globalAlpha = particle.opacity;
          this.ctx.translate(particle.x, particle.y);
          this.ctx.rotate(particle.rotation);

          // Draw particle with divine glow effect
          if (type === "success") {
            this.drawDivineParticle(particle);
          } else {
            this.drawGlowParticle(particle);
          }

          this.ctx.restore();
        }
      });

      if (activeParticles > 0) {
        requestAnimationFrame(animate);
      }
    };

    // Show canvas
    this.canvas.style.opacity = "1";

    // Start animation
    animate();

    // Hide canvas after animation completes
    setTimeout(() => {
      this.canvas.style.opacity = "0";
    }, 3000);
  }

  /**
   * Draw divine particle with enhanced glow effect
   * @param {Object} particle - Particle object
   */
  drawDivineParticle(particle) {
    // Create multiple glow layers for divine effect
    const layers = [
      {
        size: particle.size * 4,
        alpha: 0.1,
        color: particle.secondaryGlowColor,
      },
      {
        size: particle.size * 3,
        alpha: 0.2,
        color: particle.secondaryGlowColor,
      },
      { size: particle.size * 2, alpha: 0.3, color: particle.glowColor },
      { size: particle.size, alpha: 0.8, color: particle.color },
    ];

    layers.forEach((layer) => {
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, layer.size);
      gradient.addColorStop(
        0,
        layer.color +
          Math.floor(layer.alpha * 255)
            .toString(16)
            .padStart(2, "0")
      );
      gradient.addColorStop(
        0.5,
        layer.color +
          Math.floor(layer.alpha * 0.5 * 255)
            .toString(16)
            .padStart(2, "0")
      );
      gradient.addColorStop(1, "transparent");

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, layer.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Add star-shaped core for success particles
    this.drawStarParticle(particle);
  }

  /**
   * Show screen vignette effect
   */
  showVignette() {
    if (!settingsManager.getSettings().animations) return;

    // Create vignette overlay
    const vignette = document.createElement("div");
    vignette.id = "ai-vignette";
    vignette.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
            background: radial-gradient(
                circle at center,
                transparent 0%,
                transparent 40%,
                rgba(0, 0, 0, 0.1) 60%,
                rgba(0, 0, 0, 0.3) 80%,
                rgba(0, 0, 0, 0.6) 100%
            );
            opacity: 0;
            transition: opacity 0.5s ease;
        `;

    document.body.appendChild(vignette);

    // Get current theme for adaptive colors
    const theme = themeManager.getCurrentTheme();
    if (theme) {
      const primaryColor = this.hexToRgba(theme.glowPrimary || "#ffffff", 0.1);
      const secondaryColor = this.hexToRgba(
        theme.glowSecondary || "#ffffff",
        0.2
      );

      vignette.style.background = `radial-gradient(
                circle at center,
                transparent 0%,
                transparent 40%,
                ${primaryColor} 60%,
                ${secondaryColor} 80%,
                rgba(0, 0, 0, 0.6) 100%
            )`;
    }

    // Fade in vignette
    setTimeout(() => {
      vignette.style.opacity = "1";
    }, 10);

    // Fade out and remove vignette
    setTimeout(() => {
      vignette.style.opacity = "0";
      setTimeout(() => {
        vignette.remove();
      }, 500);
    }, 1500);
  }

  /**
   * Convert hex color to rgba
   * @param {string} hex - Hex color string
   * @param {number} alpha - Alpha value (0-1)
   * @returns {string} RGBA color string
   */
  hexToRgba(hex, alpha) {
    // Remove # if present
    hex = hex.replace("#", "");

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

// Create global animation manager
const animationManager = new AnimationManager();

// Add CSS for shimmer animation
const style = document.createElement("style");
style.textContent = `
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
document.head.appendChild(style);

// Export for debugging
if (window.DEV) {
  window.animationManager = animationManager;
}

// Global reference for external access
window.Animations = animationManager;
