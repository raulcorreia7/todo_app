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

  constructor() {
    this.audio = new Audio();
    this.currentTrackIndex = this.loadCurrentTrackIndex();
    this.volumeValue = this.loadVolume();
    this.playing = this.loadPlaying();

    this.audio.volume = this.volumeValue;
    const track = TRACKS[this.currentTrackIndex];
    if (track) {
      this.audio.src = track.src;
    }

    this.audio.addEventListener("ended", this.handleTrackEnd.bind(this));
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
    } catch { // ignore
    }
  }

  private loadPlaying(): boolean {
    return false;
  }

  private savePlaying(playing: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYING, playing.toString());
    } catch { // ignore
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
    } catch { // ignore
    }
    return 0;
  }

  private saveCurrentTrackIndex(index: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, index.toString());
    } catch { // ignore
    }
  }

  private handleTrackEnd(): void {
    this.next();
  }

  play(): void {
    this.audio.play().catch(() => {});
    this.playing = true;
    this.savePlaying(true);
  }

  pause(): void {
    this.audio.pause();
    this.playing = false;
    this.savePlaying(false);
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
      this.audio.play().catch(() => {});
    }
  }

  previous(): void {
    this.currentTrackIndex = this.currentTrackIndex === 0 
      ? TRACKS.length - 1 
      : this.currentTrackIndex - 1;
    const track = TRACKS[this.currentTrackIndex];
    if (track) {
      this.audio.src = track.src;
    }
    this.saveCurrentTrackIndex(this.currentTrackIndex);
    if (this.playing) {
      this.audio.play().catch(() => {});
    }
  }

  setVolume(volume: number): void {
    this.volumeValue = Math.max(0, Math.min(1, volume));
    this.audio.volume = this.volumeValue;
    this.saveVolume(this.volumeValue);
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
        this.audio.play().catch(() => {});
      }
    }
  }

  destroy(): void {
    this.audio.removeEventListener("ended", this.handleTrackEnd.bind(this));
    this.audio.pause();
    this.audio.src = "";
  }
}

export const musicService = new MusicService();
