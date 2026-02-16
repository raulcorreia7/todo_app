const STORAGE_KEYS = {
  VOLUME: "music-volume",
  PLAYING: "music-playing",
  CURRENT_TRACK: "music-current-track",
};

export interface Track {
  id: string;
  name: string;
  src: string;
}

export interface MusicStateSnapshot {
  isPlaying: boolean;
  isBuffering: boolean;
  isGloballyMuted: boolean;
  volume: number;
  currentTrack: Track;
}

type MusicListener = (state: MusicStateSnapshot) => void;
type MusicHintListener = () => void;

const TRACKS: Track[] = [
  { id: "house_0", name: "House Vibes", src: "/sounds/song_house_0.mp3" },
  { id: "chill_0", name: "Chill Beats", src: "/sounds/song_chill_0.mp3" },
  { id: "capybara", name: "Capybara", src: "/sounds/song_capybara.mp3" },
];

class MusicService {
  private audio: HTMLAudioElement;
  private currentTrackIndex: number;
  private volumeValue: number;
  private playing: boolean;
  private globallyMuted: boolean;
  private buffering: boolean;
  private listeners: Set<MusicListener>;
  private hintListeners: Set<MusicHintListener>;
  private onTrackEnded: () => void;
  private onAudioWaiting: () => void;
  private onAudioCanPlay: () => void;
  private onAudioPlaying: () => void;

  constructor() {
    this.audio = new Audio();
    this.currentTrackIndex = this.loadCurrentTrackIndex();
    this.volumeValue = this.loadVolume();
    this.playing = this.loadPlaying();
    this.globallyMuted = false;
    this.buffering = false;
    this.listeners = new Set();
    this.hintListeners = new Set();
    this.onTrackEnded = this.handleTrackEnd.bind(this);
    this.onAudioWaiting = () => this.setBuffering(true);
    this.onAudioCanPlay = () => this.setBuffering(false);
    this.onAudioPlaying = () => this.setBuffering(false);

    this.applyVolume();
    const track = TRACKS[this.currentTrackIndex];
    if (track) {
      this.audio.src = track.src;
    }

    this.audio.addEventListener("ended", this.onTrackEnded);
    this.audio.addEventListener("waiting", this.onAudioWaiting);
    this.audio.addEventListener("canplay", this.onAudioCanPlay);
    this.audio.addEventListener("playing", this.onAudioPlaying);
  }

  private loadVolume(): number {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);
      return saved !== null ? parseFloat(saved) : 0.5;
    } catch {
      return 0.5;
    }
  }

  private saveVolume(volume: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    } catch {
      // ignore
    }
  }

  private loadPlaying(): boolean {
    return false;
  }

  private savePlaying(playing: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYING, playing.toString());
    } catch {
      // ignore
    }
  }

  private loadCurrentTrackIndex(): number {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TRACK);
      if (saved !== null) {
        const index = parseInt(saved, 10);
        if (index >= 0 && index < TRACKS.length) {
          return index;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  }

  private saveCurrentTrackIndex(index: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, index.toString());
    } catch {
      // ignore
    }
  }

  private handleTrackEnd(): void {
    this.next();
  }

  private applyVolume(): void {
    this.audio.volume = this.globallyMuted ? 0 : this.volumeValue;
  }

  private getSnapshot(): MusicStateSnapshot {
    return {
      isPlaying: this.playing,
      isBuffering: this.buffering,
      isGloballyMuted: this.globallyMuted,
      volume: this.volumeValue,
      currentTrack: this.getCurrentTrack(),
    };
  }

  private emitChange(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private emitHint(): void {
    this.hintListeners.forEach((listener) => listener());
  }

  private setBuffering(buffering: boolean): void {
    if (this.buffering === buffering) return;
    this.buffering = buffering;
    this.emitChange();
  }

  subscribe(listener: MusicListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeHint(listener: MusicHintListener): () => void {
    this.hintListeners.add(listener);
    return () => {
      this.hintListeners.delete(listener);
    };
  }

  isBuffering(): boolean {
    return this.buffering;
  }

  play(): void {
    this.playing = true;
    this.savePlaying(true);
    if ("readyState" in this.audio && this.audio.readyState < 3) {
      this.setBuffering(true);
    }
    this.emitChange();

    this.audio.play().catch(() => {
      this.playing = false;
      this.savePlaying(false);
      this.setBuffering(false);
      this.emitChange();
      this.emitHint();
    });
  }

  pause(): void {
    this.audio.pause();
    this.playing = false;
    this.savePlaying(false);
    this.setBuffering(false);
    this.emitChange();
  }

  toggle(): void {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  next(): void {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % TRACKS.length;
    const track = TRACKS[this.currentTrackIndex];
    if (track) {
      this.audio.src = track.src;
    }
    this.saveCurrentTrackIndex(this.currentTrackIndex);
    if (this.playing) {
      if ("readyState" in this.audio && this.audio.readyState < 3) {
        this.setBuffering(true);
      }
      this.audio.play().catch(() => {});
    }
    this.emitChange();
  }

  previous(): void {
    this.currentTrackIndex =
      this.currentTrackIndex === 0
        ? TRACKS.length - 1
        : this.currentTrackIndex - 1;
    const track = TRACKS[this.currentTrackIndex];
    if (track) {
      this.audio.src = track.src;
    }
    this.saveCurrentTrackIndex(this.currentTrackIndex);
    if (this.playing) {
      if ("readyState" in this.audio && this.audio.readyState < 3) {
        this.setBuffering(true);
      }
      this.audio.play().catch(() => {});
    }
    this.emitChange();
  }

  setVolume(volume: number): void {
    this.volumeValue = Math.max(0, Math.min(1, volume));
    this.applyVolume();
    this.saveVolume(this.volumeValue);
    this.emitChange();
  }

  setGlobalMute(muted: boolean): void {
    this.globallyMuted = muted;
    this.applyVolume();
    this.emitChange();
  }

  isGloballyMuted(): boolean {
    return this.globallyMuted;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  getCurrentTrack(): Track {
    return TRACKS[this.currentTrackIndex]!;
  }

  getAllTracks(): Track[] {
    return TRACKS;
  }

  getVolume(): number {
    return this.volumeValue;
  }

  selectTrack(index: number): void {
    if (index >= 0 && index < TRACKS.length) {
      this.currentTrackIndex = index;
      const track = TRACKS[this.currentTrackIndex];
      if (track) {
        this.audio.src = track.src;
      }
      this.saveCurrentTrackIndex(this.currentTrackIndex);
      if (this.playing) {
        if ("readyState" in this.audio && this.audio.readyState < 3) {
          this.setBuffering(true);
        }
        this.audio.play().catch(() => {});
      }
      this.emitChange();
    }
  }

  destroy(): void {
    this.audio.removeEventListener("ended", this.onTrackEnded);
    this.audio.removeEventListener("waiting", this.onAudioWaiting);
    this.audio.removeEventListener("canplay", this.onAudioCanPlay);
    this.audio.removeEventListener("playing", this.onAudioPlaying);
    this.audio.pause();
    this.audio.src = "";
  }
}

export const musicService = new MusicService();
