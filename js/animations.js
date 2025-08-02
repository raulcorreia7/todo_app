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
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'animation-canvas';
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
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
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
        bus.addEventListener('taskCompleted', (e) => {
            this.createTaskCompleteEffect(e.detail.taskElement);
        });

        // Listen for all tasks completed
        bus.addEventListener('allTasksCompleted', () => {
            this.createVictoryCelebration();
        });

        // Listen for settings changes
        bus.addEventListener('settingsChanged', (e) => {
            if (e.detail.animations !== undefined) {
                this.toggleAnimations(e.detail.animations);
            }
        });
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
                color: this.getRandomSparkleColor()
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
                color: this.getRandomPetalColor()
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
        this.canvas.style.opacity = '1';
        
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
            this.canvas.style.opacity = '0';
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
            
            sparkles.forEach(sparkle => {
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
            
            petals.forEach(petal => {
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
                    this.ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
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
        
        element.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
            element.style.boxShadow = '';
        }, { once: true });
    }

    /**
     * Create button press effect
     * @param {HTMLElement} button - Button element
     */
    createButtonPress(button) {
        if (!settingsManager.getSettings().animations) return;
        
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    /**
     * Create checkbox toggle effect
     * @param {HTMLElement} checkbox - Checkbox element
     */
    createCheckboxToggle(checkbox) {
        if (!settingsManager.getSettings().animations) return;
        
        checkbox.style.transform = 'scale(1.2)';
        setTimeout(() => {
            checkbox.style.transform = '';
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
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    /**
     * Toggle animations on/off
     * @param {boolean} enabled - Whether to enable animations
     */
    toggleAnimations(enabled) {
        if (!enabled) {
            this.canvas.style.display = 'none';
        } else {
            this.canvas.style.display = 'block';
        }
    }

    /**
     * Get random sparkle color
     * @returns {string} - CSS color
     */
    getRandomSparkleColor() {
        const colors = [
            '#FFD700', // Gold
            '#87CEEB', // Sky Blue
            '#DDA0DD', // Plum
            '#98FB98', // Pale Green
            '#F0E68C'  // Khaki
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Get random petal color
     * @returns {string} - CSS color with transparency
     */
    getRandomPetalColor() {
        const colors = [
            'rgba(255, 182, 193, 0.7)', // Light Pink
            'rgba(173, 216, 230, 0.7)', // Light Blue
            'rgba(221, 160, 221, 0.7)', // Plum
            'rgba(144, 238, 144, 0.7)', // Light Green
            'rgba(255, 218, 185, 0.7)'  // Peach
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Create premium achievement unlock effect
     * @param {number} x - Center x coordinate
     * @param {number} y - Center y coordinate
     * @param {string} color - Theme color for particles
     */
    createAchievementUnlockEffect(x, y, color = '#e94560') {
        if (!settingsManager.getSettings().animations) return;

        // Show canvas
        this.canvas.style.opacity = '1';
        
        // Create premium particle burst
        const particles = [];
        const particleCount = 24;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 3 + Math.random() * 4;
            const size = 3 + Math.random() * 5;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: size,
                life: 1,
                decay: 0.015 + Math.random() * 0.01,
                color: color,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                shape: Math.random() > 0.5 ? 'star' : 'circle'
            });
        }
        
        // Create floating light orbs
        const orbs = [];
        const orbCount = 6;
        
        for (let i = 0; i < orbCount; i++) {
            const angle = (i / orbCount) * Math.PI * 2;
            const radius = 40 + Math.random() * 30;
            
            orbs.push({
                x: x,
                y: y,
                targetX: x + Math.cos(angle) * radius,
                targetY: y + Math.sin(angle) * radius,
                size: 8 + Math.random() * 12,
                opacity: 0.6,
                fadeSpeed: 0.008,
                color: color,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
        
        this.animateAchievementParticles(particles, orbs);
        
        // Hide canvas after animation
        setTimeout(() => {
            this.canvas.style.opacity = '0';
        }, 2500);
    }

    /**
     * Animate achievement particles and orbs
     * @param {Array} particles - Array of particle objects
     * @param {Array} orbs - Array of orb objects
     */
    animateAchievementParticles(particles, orbs) {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            let activeParticles = 0;
            let activeOrbs = 0;
            
            // Animate particles
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.08; // gravity
                particle.life -= particle.decay;
                particle.rotation += particle.rotationSpeed;
                
                if (particle.life > 0) {
                    activeParticles++;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = particle.life;
                    this.ctx.translate(particle.x, particle.y);
                    this.ctx.rotate(particle.rotation);
                    
                    if (particle.shape === 'star') {
                        this.drawStar(0, 0, particle.size);
                    } else {
                        this.ctx.fillStyle = particle.color;
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    
                    // Add glow effect
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = particle.color;
                    this.ctx.fill();
                    
                    this.ctx.restore();
                }
            });
            
            // Animate orbs
            orbs.forEach(orb => {
                // Move towards target
                orb.x += (orb.targetX - orb.x) * 0.05;
                orb.y += (orb.targetY - orb.y) * 0.05;
                
                // Pulse
                orb.pulsePhase += 0.05;
                const pulseScale = 1 + Math.sin(orb.pulsePhase) * 0.1;
                
                // Fade
                orb.opacity -= orb.fadeSpeed;
                
                if (orb.opacity > 0) {
                    activeOrbs++;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = orb.opacity;
                    this.ctx.translate(orb.x, orb.y);
                    this.ctx.scale(pulseScale, pulseScale);
                    
                    // Draw orb with gradient
                    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, orb.size);
                    gradient.addColorStop(0, orb.color);
                    gradient.addColorStop(0.7, orb.color + '80');
                    gradient.addColorStop(1, 'transparent');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, orb.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.restore();
                }
            });
            
            if (activeParticles > 0 || activeOrbs > 0) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * Draw a star shape
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Star size
     */
    drawStar(x, y, size) {
        this.ctx.fillStyle = this.ctx.strokeStyle = this.ctx.shadowColor = '#FFD700';
        this.ctx.beginPath();
        
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const innerAngle = angle + Math.PI / 5;
            
            if (i === 0) {
                this.ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            } else {
                this.ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            }
            
            this.ctx.lineTo(x + Math.cos(innerAngle) * (size * 0.5), y + Math.sin(innerAngle) * (size * 0.5));
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Create loading shimmer effect
     * @param {HTMLElement} element - Element to apply shimmer to
     */
    createLoadingShimmer(element) {
        if (!settingsManager.getSettings().animations) return;
        
        element.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)';
        element.style.backgroundSize = '200% 100%';
        element.style.animation = 'shimmer 1.5s infinite';
    }

    /**
     * Remove loading shimmer effect
     * @param {HTMLElement} element - Element to remove shimmer from
     */
    removeLoadingShimmer(element) {
        element.style.background = '';
        element.style.animation = '';
    }
}

// Create global animation manager
const animationManager = new AnimationManager();

// Add CSS for shimmer animation
const style = document.createElement('style');
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
