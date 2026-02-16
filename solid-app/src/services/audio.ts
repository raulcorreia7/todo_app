import { settingsStore } from "@/stores/settingsStore";

export type SoundType = "add" | "complete" | "delete" | "achievement" | "victory" | "click";

class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private soundStep = 0;
  private pentatonicFreqs = [
    261.63,
    293.66,
    329.63,
    392.00,
    440.00,
    523.25,
    587.33,
  ];

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = (settingsStore.volume / 100) * 0.5;

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.initialized = true;
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioContext || !this.masterGain) return null;
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  async play(sound: SoundType): Promise<void> {
    if (!settingsStore.soundEnabled) return;

    if (!this.initialized) {
      await this.init();
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    switch (sound) {
      case "add":
        this.playAdd(ctx);
        break;
      case "complete":
        this.playComplete(ctx);
        break;
      case "delete":
        this.playDelete(ctx);
        break;
      case "achievement":
        this.playAchievement(ctx);
        break;
      case "victory":
        this.playVictory(ctx);
        break;
      case "click":
        this.playClick(ctx);
        break;
    }
  }

  private playAdd(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(525, now + 0.1);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playComplete(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const baseFreq = this.pentatonicFreqs[this.soundStep % this.pentatonicFreqs.length] ?? 523.25;
    this.soundStep++;
    const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  private playDelete(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playAchievement(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  private playVictory(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const melody = [
      { freq: 392, time: 0 },
      { freq: 523, time: 0.15 },
      { freq: 659, time: 0.3 },
      { freq: 784, time: 0.45 },
      { freq: 1047, time: 0.6 },
    ];

    melody.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = now + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  private playClick(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = (Math.max(0, Math.min(100, volume)) / 100) * 0.5;
    }
  }

  setEnabled(enabled: boolean): void {
    if (!this.audioContext) return;

    if (!enabled) {
      this.audioContext.suspend().catch(() => {});
    } else {
      this.audioContext.resume().catch(() => {});
    }
  }

  isEnabled(): boolean {
    return settingsStore.soundEnabled;
  }
}

export const audioService = new AudioService();
