import { settingsStore } from "@/stores/settingsStore";

export type SoundType =
  | "add"
  | "complete"
  | "delete"
  | "achievement"
  | "victory"
  | "click";

const AUDIO_VOLUME_MIN = 0;
const AUDIO_VOLUME_MAX = 100;
const AUDIO_MASTER_GAIN_SCALE = 0.5;
const AUDIO_QUEUE_GAP_SECONDS = 0.02;

type QueueBehavior = "immediate" | "anchor" | "queued";
type SoundPriority = "low" | "medium" | "high";

const SOUND_PRIORITY_WEIGHT: Record<SoundPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

type SoundPlaybackConfig = {
  duration: number;
  queueBehavior: QueueBehavior;
  priority: SoundPriority;
};

const SOUND_PLAYBACK_CONFIG: Record<SoundType, SoundPlaybackConfig> = {
  add: { duration: 0.2, queueBehavior: "immediate", priority: "low" },
  complete: { duration: 0.56, queueBehavior: "anchor", priority: "medium" },
  delete: { duration: 0.2, queueBehavior: "immediate", priority: "low" },
  achievement: { duration: 0.8, queueBehavior: "queued", priority: "high" },
  victory: { duration: 0.95, queueBehavior: "queued", priority: "high" },
  click: { duration: 0.05, queueBehavior: "immediate", priority: "low" },
};

class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private soundStep = 0;
  private queuedUntil = 0;
  private queuedPriorityWeight = 0;
  private readonly queueGap = AUDIO_QUEUE_GAP_SECONDS;
  private pentatonicFreqs = [
    261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33,
  ];

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value =
        (settingsStore.volume / AUDIO_VOLUME_MAX) * AUDIO_MASTER_GAIN_SCALE;

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.queuedUntil = this.audioContext.currentTime;
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

    const playbackConfig = SOUND_PLAYBACK_CONFIG[sound];
    const soundPriorityWeight = SOUND_PRIORITY_WEIGHT[playbackConfig.priority];
    const now = ctx.currentTime;

    if (now >= this.queuedUntil) {
      this.queuedPriorityWeight = 0;
    }

    const hasQueuedWindow = this.queuedUntil > now;

    let startTime = now;
    if (playbackConfig.queueBehavior === "queued") {
      startTime = Math.max(now, this.queuedUntil);
    } else if (
      playbackConfig.queueBehavior === "anchor" &&
      hasQueuedWindow &&
      this.queuedPriorityWeight > soundPriorityWeight
    ) {
      startTime = this.queuedUntil;
    } else if (
      playbackConfig.queueBehavior === "immediate" &&
      hasQueuedWindow &&
      this.queuedPriorityWeight > soundPriorityWeight
    ) {
      return;
    }

    let duration = SOUND_PLAYBACK_CONFIG.click.duration;

    switch (sound) {
      case "add":
        duration = this.playAdd(ctx, startTime);
        break;
      case "complete":
        duration = this.playComplete(ctx, startTime);
        break;
      case "delete":
        duration = this.playDelete(ctx, startTime);
        break;
      case "achievement":
        duration = this.playAchievement(ctx, startTime);
        break;
      case "victory":
        duration = this.playVictory(ctx, startTime);
        break;
      case "click":
        duration = this.playClick(ctx, startTime);
        break;
    }

    if (
      playbackConfig.queueBehavior === "anchor" ||
      playbackConfig.queueBehavior === "queued"
    ) {
      this.queuedUntil = startTime + duration + this.queueGap;
      this.queuedPriorityWeight = Math.max(
        this.queuedPriorityWeight,
        soundPriorityWeight
      );
    }
  }

  private playAdd(ctx: AudioContext, startTime: number): number {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(350, startTime);
    osc.frequency.exponentialRampToValueAtTime(525, startTime + 0.1);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + SOUND_PLAYBACK_CONFIG.add.duration);

    return SOUND_PLAYBACK_CONFIG.add.duration;
  }

  private playComplete(ctx: AudioContext, startTime: number): number {
    const baseFreq =
      this.pentatonicFreqs[this.soundStep % this.pentatonicFreqs.length] ??
      523.25;
    this.soundStep++;
    const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const noteStart = startTime + i * 0.08;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteStart);
      osc.stop(noteStart + 0.4);
    });

    return SOUND_PLAYBACK_CONFIG.complete.duration;
  }

  private playDelete(ctx: AudioContext, startTime: number): number {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, startTime);
    osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.2);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, startTime);
    filter.frequency.exponentialRampToValueAtTime(150, startTime + 0.2);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + SOUND_PLAYBACK_CONFIG.delete.duration);

    return SOUND_PLAYBACK_CONFIG.delete.duration;
  }

  private playAchievement(ctx: AudioContext, startTime: number): number {
    const notes = [523, 659, 784, 1047];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const noteStart = startTime + i * 0.1;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteStart);
      osc.stop(noteStart + 0.5);
    });

    return SOUND_PLAYBACK_CONFIG.achievement.duration;
  }

  private playVictory(ctx: AudioContext, startTime: number): number {
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

      const noteStart = startTime + time;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteStart);
      osc.stop(noteStart + 0.35);
    });

    return SOUND_PLAYBACK_CONFIG.victory.duration;
  }

  private playClick(ctx: AudioContext, startTime: number): number {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, startTime);
    osc.frequency.exponentialRampToValueAtTime(600, startTime + 0.03);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + SOUND_PLAYBACK_CONFIG.click.duration);

    return SOUND_PLAYBACK_CONFIG.click.duration;
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value =
        (Math.max(AUDIO_VOLUME_MIN, Math.min(AUDIO_VOLUME_MAX, volume)) /
          AUDIO_VOLUME_MAX) *
        AUDIO_MASTER_GAIN_SCALE;
    }
  }

  setEnabled(enabled: boolean): void {
    if (!this.audioContext) return;

    if (!enabled) {
      this.audioContext.suspend().catch(() => {});
      this.queuedUntil = this.audioContext.currentTime;
      this.queuedPriorityWeight = 0;
    } else {
      this.audioContext.resume().catch(() => {});
      this.queuedUntil = this.audioContext.currentTime;
      this.queuedPriorityWeight = 0;
    }
  }

  isEnabled(): boolean {
    return settingsStore.soundEnabled;
  }
}

export const audioService = new AudioService();
