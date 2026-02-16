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

class AnimationManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isAnimating = false;
  private activeEffects: CompletionEffectState[] = [];
  private animationId: number | null = null;

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
    `;

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private setupEventListeners(): void {
    document.addEventListener("taskCompleted", ((e: CustomEvent) => {
      this.createTaskCompleteEffect(e.detail.taskElement);
    }) as EventListener);

    document.addEventListener("allTasksCompleted", () => {
      this.createVictoryCelebration();
    });
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

  private getComputedColor(cssVar: string): string {
    if (typeof window === "undefined") return "#ffffff";
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue(cssVar).trim() || "#ffffff";
  }

  private getThemeColors(): { primary: string; secondary: string; accent: string; glow: string } {
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
    if (!taskElement) return;

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

    const sparkleCount = 16;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + Math.random() * 0.3;
      const velocity = 3 + Math.random() * 4;
      const type = Math.random() > 0.5 ? "sparkle" : "confetti";

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2,
        size: type === "confetti" ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
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

    const starCount = 6;
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
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private startAnimationLoop(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
  }

  private animate(): void {
    if (!this.ctx || !this.canvas) return;

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - (this.activeEffects[0]?.scrollOffset || 0);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let e = this.activeEffects.length - 1; e >= 0; e--) {
      const effect = this.activeEffects[e];
      let activeCount = 0;

      for (const particle of effect.particles) {
        if (particle.life <= 0) continue;
        activeCount++;

        particle.x += particle.vx;
        particle.y += particle.vy - scrollDelta;

        particle.vy += 0.15;
        particle.vx *= 0.98;

        particle.rotation += particle.rotationSpeed;
        particle.life -= particle.decay;
        particle.opacity = Math.max(0, particle.life);

        this.drawParticle(particle, scrollDelta);
      }

      effect.scrollOffset = currentScrollY;

      if (activeCount === 0) {
        this.activeEffects.splice(e, 1);
      }
    }

    if (this.activeEffects.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.isAnimating = false;
      this.hideCanvas();
    }
  }

  private drawParticle(particle: Particle, _scrollDelta: number): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;

    switch (particle.type) {
      case "sparkle":
        this.drawSparkle(particle);
        break;
      case "confetti":
        this.drawConfetti(particle);
        break;
      case "star":
        this.drawStar(particle);
        break;
    }

    this.ctx.restore();
  }

  private drawSparkle(particle: Particle): void {
    if (!this.ctx) return;

    const gradient = this.ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 3
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.3, particle.color + "80");
    gradient.addColorStop(1, "transparent");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(particle.x - particle.size * 2, particle.y);
    this.ctx.lineTo(particle.x + particle.size * 2, particle.y);
    this.ctx.moveTo(particle.x, particle.y - particle.size * 2);
    this.ctx.lineTo(particle.x, particle.y + particle.size * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawConfetti(particle: Particle): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation);

    this.ctx.fillStyle = particle.color;
    this.ctx.shadowColor = particle.color;
    this.ctx.shadowBlur = 8;

    this.ctx.beginPath();
    this.ctx.roundRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2, 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawStar(particle: Particle): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation);

    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.3, particle.color);
    gradient.addColorStop(1, "transparent");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();

    const spikes = 5;
    const outerRadius = particle.size;
    const innerRadius = particle.size * 0.4;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }

    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.shadowColor = particle.glowColor;
    this.ctx.shadowBlur = 15;
    this.ctx.fill();

    this.ctx.restore();
  }

  createVictoryCelebration(): void {
    this.showCanvas();

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const taskEl = document.createElement("div");
    taskEl.getBoundingClientRect = () => ({
      left: centerX - 50,
      top: centerY - 25,
      width: 100,
      height: 50,
      right: centerX + 50,
      bottom: centerY + 25,
      x: centerX - 50,
      y: centerY - 25,
      toJSON: () => ({}),
    } as DOMRect);

    this.createTaskCompleteEffect(taskEl);

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * 400;
        const offsetY = (Math.random() - 0.5) * 300;
        const el = document.createElement("div");
        el.getBoundingClientRect = () => ({
          left: centerX + offsetX - 25,
          top: centerY + offsetY - 12,
          width: 50,
          height: 25,
          right: centerX + offsetX + 25,
          bottom: centerY + offsetY + 12,
          x: centerX + offsetX - 25,
          y: centerY + offsetY - 12,
          toJSON: () => ({}),
        } as DOMRect);
        this.createTaskCompleteEffect(el);
      }, i * 150);
    }
  }

  createDivineBlessing(element: HTMLElement): void {
    if (!element) return;
    this.createTaskCompleteEffect(element);
  }

  createAIEditFeedback(element: HTMLElement, _type: "active" | "success" | "loading" = "active"): void {
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
    }
    if (this.canvas) {
      this.canvas.remove();
    }
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
