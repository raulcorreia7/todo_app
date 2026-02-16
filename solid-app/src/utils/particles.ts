export interface ParticleOptions {
  count?: number;
  color?: string;
  size?: number;
  duration?: number;
  spread?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  decay: number;
  color: string;
  glowColor: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: "sparkle" | "confetti" | "star";
}

interface CompletionEffectState {
  particles: Particle[];
  scrollOffset: number;
  centerX: number;
  centerY: number;
  startTime: number;
  duration: number;
}

const DEFAULT_SPARKLE_COUNT = 16;
const DEFAULT_STAR_COUNT = 6;
const MAX_ACTIVE_EFFECTS = 3;
const DEFAULT_VICTORY_WAVES = 5;
const MAX_CANVAS_PIXEL_RATIO = 2;

class AnimationManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isAnimating = false;
  private activeEffects: CompletionEffectState[] = [];
  private animationId: number | null = null;
  private pixelRatio = 1;
  private spriteCache = new Map<string, HTMLCanvasElement>();
  private lastFrameTime = 0;
  private onResize = () => this.resizeCanvas();
  private onVisibilityChange = () => {
    if (!document.hidden && this.activeEffects.length > 0) {
      this.startAnimationLoop();
    }
  };

  init(): void {
    if (typeof window === "undefined") return;
    this.createCanvas();
    this.setupEventListeners();
  }

  private createCanvas(): void {
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
      transition: opacity 0.2s ease;
      will-change: opacity;
      contain: strict;
    `;

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    this.resizeCanvas();
    window.addEventListener("resize", this.onResize, { passive: true });
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.ctx) return;

    this.pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      MAX_CANVAS_PIXEL_RATIO
    );
    this.canvas.width = Math.floor(window.innerWidth * this.pixelRatio);
    this.canvas.height = Math.floor(window.innerHeight * this.pixelRatio);
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  private setupEventListeners(): void {
    document.addEventListener("taskCompleted", ((e: CustomEvent) => {
      this.createTaskCompleteEffect(e.detail.taskElement);
    }) as EventListener);

    document.addEventListener("allTasksCompleted", () => {
      this.createVictoryCelebration();
    });

    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private showCanvas(): void {
    if (this.canvas) {
      this.canvas.style.opacity = "1";
    }
  }

  private hideCanvas(): void {
    if (this.canvas && this.activeEffects.length === 0) {
      this.canvas.style.opacity = "0";
    }
  }

  private getThemeColors(): {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  } {
    const style = getComputedStyle(document.documentElement);
    const glow = style.getPropertyValue("--color-glow").trim() || "#6366f1";
    const accent = style.getPropertyValue("--color-accent").trim() || "#8b5cf6";

    return {
      primary: glow,
      secondary: accent,
      accent: style.getPropertyValue("--accent-color").trim() || "#10b981",
      glow,
    };
  }

  createTaskCompleteEffect(taskElement: HTMLElement): void {
    if (!taskElement || document.hidden) return;

    if (this.activeEffects.length >= MAX_ACTIVE_EFFECTS) {
      this.activeEffects.shift();
    }

    const rect = taskElement.getBoundingClientRect();
    const scrollY = window.scrollY;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const particles = this.createCompletionParticles(centerX, centerY);

    const effect: CompletionEffectState = {
      particles,
      scrollOffset: scrollY,
      centerX,
      centerY,
      startTime: performance.now(),
      duration: 1200,
    };

    this.activeEffects.push(effect);
    this.showCanvas();
    this.startAnimationLoop();
  }

  private createCompletionParticles(x: number, y: number): Particle[] {
    const colors = this.getThemeColors();
    const particles: Particle[] = [];

    const sparkleCount = DEFAULT_SPARKLE_COUNT;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + Math.random() * 0.3;
      const velocity = 3 + Math.random() * 4;
      const type = Math.random() > 0.5 ? "sparkle" : "confetti";

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2,
        size:
          type === "confetti" ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        color: type === "confetti" ? this.randomConfettiColor() : colors.glow,
        glowColor: colors.glow,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        type,
      });
    }

    const starCount = DEFAULT_STAR_COUNT;
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2;
      const velocity = 2 + Math.random() * 2;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 1,
        size: 6 + Math.random() * 4,
        life: 1,
        decay: 0.018 + Math.random() * 0.008,
        color: colors.glow,
        glowColor: colors.glow,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        type: "star",
      });
    }

    return particles;
  }

  private randomConfettiColor(): string {
    const colors = [
      "#fbbf24",
      "#f472b6",
      "#60a5fa",
      "#34d399",
      "#a78bfa",
      "#fb7185",
      "#38bdf8",
    ];
    return colors[Math.floor(Math.random() * colors.length)] ?? "#fbbf24";
  }

  private startAnimationLoop(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }

  private animate(): void {
    if (!this.ctx || !this.canvas) return;

    if (document.hidden) {
      this.isAnimating = false;
      this.animationId = null;
      return;
    }

    const currentScrollY = window.scrollY;
    const now = performance.now();
    const deltaScale = Math.min((now - this.lastFrameTime) / 16.6667, 1.5);
    this.lastFrameTime = now;
    const width = this.canvas.width / this.pixelRatio;
    const height = this.canvas.height / this.pixelRatio;

    this.ctx.clearRect(0, 0, width, height);

    for (let e = this.activeEffects.length - 1; e >= 0; e--) {
      const effect = this.activeEffects[e];
      if (!effect) {
        continue;
      }

      const effectScrollDelta = currentScrollY - effect.scrollOffset;
      let activeCount = 0;

      for (const particle of effect.particles) {
        if (particle.life <= 0) continue;
        activeCount++;

        particle.x += particle.vx * deltaScale;
        particle.y += (particle.vy - effectScrollDelta) * deltaScale;

        particle.vy += 0.15 * deltaScale;
        particle.vx *= Math.pow(0.98, deltaScale);

        particle.rotation += particle.rotationSpeed * deltaScale;
        particle.life -= particle.decay * deltaScale;
        particle.opacity = Math.max(0, particle.life);

        this.drawParticle(particle);
      }

      effect.scrollOffset = currentScrollY;

      if (activeCount === 0) {
        this.activeEffects.splice(e, 1);
      }
    }

    if (this.activeEffects.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isAnimating = false;
      this.animationId = null;
      this.hideCanvas();
    }
  }

  private drawParticle(particle: Particle): void {
    if (!this.ctx) return;

    const sprite = this.getParticleSprite(particle);

    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.translate(particle.x, particle.y);

    if (particle.type !== "sparkle") {
      this.ctx.rotate(particle.rotation);
    }

    this.ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);

    this.ctx.restore();
  }

  private getParticleSprite(particle: Particle): HTMLCanvasElement {
    const key = `${particle.type}:${Math.round(particle.size * 10)}:${particle.color}:${particle.glowColor}`;
    const cachedSprite = this.spriteCache.get(key);
    if (cachedSprite) {
      return cachedSprite;
    }

    if (this.spriteCache.size > 96) {
      this.spriteCache.clear();
    }

    const sprite = document.createElement("canvas");
    const spriteSize = Math.max(20, Math.ceil(particle.size * 10));
    sprite.width = spriteSize;
    sprite.height = spriteSize;

    const ctx = sprite.getContext("2d");
    if (!ctx) {
      this.spriteCache.set(key, sprite);
      return sprite;
    }

    const center = spriteSize / 2;

    if (particle.type === "sparkle") {
      const glowRadius = particle.size * 3;
      const gradient = ctx.createRadialGradient(
        center,
        center,
        0,
        center,
        center,
        glowRadius
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.3, `${particle.color}80`);
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center, center, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(center - particle.size * 2, center);
      ctx.lineTo(center + particle.size * 2, center);
      ctx.moveTo(center, center - particle.size * 2);
      ctx.lineTo(center, center + particle.size * 2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(center, center, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (particle.type === "confetti") {
      const confettiWidth = particle.size;
      const confettiHeight = particle.size / 2;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();

      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(
          center - confettiWidth / 2,
          center - confettiHeight / 2,
          confettiWidth,
          confettiHeight,
          2
        );
      } else {
        ctx.rect(
          center - confettiWidth / 2,
          center - confettiHeight / 2,
          confettiWidth,
          confettiHeight
        );
      }

      ctx.fill();
    }

    if (particle.type === "star") {
      const outerRadius = particle.size;
      const innerRadius = particle.size * 0.4;
      const gradient = ctx.createRadialGradient(
        center,
        center,
        0,
        center,
        center,
        particle.size * 2
      );
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.3, particle.color);
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.beginPath();

      const spikes = 5;
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const pointX = center + Math.cos(angle) * radius;
        const pointY = center + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(pointX, pointY);
        } else {
          ctx.lineTo(pointX, pointY);
        }
      }

      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = particle.glowColor;
      ctx.shadowBlur = 15;
      ctx.fill();
    }

    this.spriteCache.set(key, sprite);
    return sprite;
  }

  createVictoryCelebration(): void {
    if (document.hidden) return;
    this.showCanvas();

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const taskEl = document.createElement("div");
    taskEl.getBoundingClientRect = () =>
      ({
        left: centerX - 50,
        top: centerY - 25,
        width: 100,
        height: 50,
        right: centerX + 50,
        bottom: centerY + 25,
        x: centerX - 50,
        y: centerY - 25,
        toJSON: () => ({}),
      }) as DOMRect;

    this.createTaskCompleteEffect(taskEl);

    const waves = DEFAULT_VICTORY_WAVES;

    for (let i = 0; i < waves; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * 400;
        const offsetY = (Math.random() - 0.5) * 300;
        const el = document.createElement("div");
        el.getBoundingClientRect = () =>
          ({
            left: centerX + offsetX - 25,
            top: centerY + offsetY - 12,
            width: 50,
            height: 25,
            right: centerX + offsetX + 25,
            bottom: centerY + offsetY + 12,
            x: centerX + offsetX - 25,
            y: centerY + offsetY - 12,
            toJSON: () => ({}),
          }) as DOMRect;
        this.createTaskCompleteEffect(el);
      }, i * 150);
    }
  }

  createDivineBlessing(element: HTMLElement): void {
    if (!element) return;
    this.createTaskCompleteEffect(element);
  }

  createAIEditFeedback(
    element: HTMLElement,
    _type: "active" | "success" | "loading" = "active"
  ): void {
    if (!element) return;
    this.createTaskCompleteEffect(element);
  }

  showVignette(): void {
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

    setTimeout(() => {
      vignette.style.opacity = "1";
    }, 10);

    setTimeout(() => {
      vignette.style.opacity = "0";
      setTimeout(() => vignette.remove(), 500);
    }, 1500);
  }

  toggleAnimations(enabled: boolean): void {
    if (!this.canvas) return;
    this.canvas.style.display = enabled ? "block" : "none";
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas) {
      this.canvas.remove();
    }
    this.spriteCache.clear();
    this.activeEffects = [];
    this.isAnimating = false;
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }
}

export const animationManager = new AnimationManager();

export function spawnParticles(
  element: HTMLElement,
  _options?: ParticleOptions
): void {
  animationManager.createTaskCompleteEffect(element);
}

export function spawnCelebration(element: HTMLElement): void {
  animationManager.createDivineBlessing(element);
}

export function initAnimations(): void {
  animationManager.init();
}
