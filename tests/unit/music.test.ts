import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

class MockAudio {
  src = "";
  volume = 0.5;
  paused = true;
  private listeners: Map<string, EventListener[]> = new Map();

  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();

  addEventListener(type: string, listener: EventListener) {
    const existing = this.listeners.get(type) || [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  removeEventListener(type: string, listener: EventListener) {
    const existing = this.listeners.get(type) || [];
    const filtered = existing.filter((l) => l !== listener);
    this.listeners.set(type, filtered);
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type) || [];
    listeners.forEach((l) => l(event));
    return true;
  }
}

const originalAudio = global.Audio;

describe("MusicService", () => {
  let musicService: import("@/services/music").MusicService;

  beforeEach(async () => {
    vi.resetModules();
    mockLocalStorage.clear();

    global.Audio = MockAudio as unknown as typeof Audio;

    const module = await import("@/services/music");
    musicService = module.musicService;
  });

  afterEach(() => {
    global.Audio = originalAudio;
  });

  describe("play/pause", () => {
    it("starts playing when play() is called", () => {
      musicService.play();
      expect(musicService.isPlaying()).toBe(true);
    });

    it("stops playing when pause() is called", () => {
      musicService.play();
      musicService.pause();
      expect(musicService.isPlaying()).toBe(false);
    });

    it("toggles between play and pause", () => {
      musicService.toggle();
      expect(musicService.isPlaying()).toBe(true);
      musicService.toggle();
      expect(musicService.isPlaying()).toBe(false);
    });

    it("toggle from paused state starts playing", () => {
      musicService.pause();
      musicService.toggle();
      expect(musicService.isPlaying()).toBe(true);
    });
  });

  describe("next/prev", () => {
    it("advances to next track", () => {
      const first = musicService.getCurrentTrack();
      musicService.next();
      const second = musicService.getCurrentTrack();
      expect(first.id).not.toBe(second.id);
    });

    it("wraps around to first track after last", () => {
      const tracks = musicService.getAllTracks();
      for (let i = 0; i < tracks.length - 1; i++) {
        musicService.next();
      }
      musicService.next();
      const current = musicService.getCurrentTrack();
      const firstTrack = tracks[0];
      expect(current.id).toBe(firstTrack.id);
    });

    it("goes to previous track", () => {
      musicService.next();
      const second = musicService.getCurrentTrack();
      musicService.previous();
      const first = musicService.getCurrentTrack();
      expect(second.id).not.toBe(first.id);
    });

    it("wraps around to last track from first", () => {
      const tracks = musicService.getAllTracks();
      musicService.previous();
      const current = musicService.getCurrentTrack();
      const lastTrack = tracks[tracks.length - 1];
      expect(current.id).toBe(lastTrack.id);
    });
  });

  describe("volume", () => {
    it("sets volume to valid value", () => {
      musicService.setVolume(0.5);
      expect(musicService.getVolume()).toBe(0.5);
    });

    it("clamps volume to minimum 0", () => {
      musicService.setVolume(-0.5);
      expect(musicService.getVolume()).toBe(0);
    });

    it("clamps volume to maximum 1", () => {
      musicService.setVolume(1.5);
      expect(musicService.getVolume()).toBe(1);
    });

    it("handles volume 0", () => {
      musicService.setVolume(0);
      expect(musicService.getVolume()).toBe(0);
    });

    it("handles volume 1", () => {
      musicService.setVolume(1);
      expect(musicService.getVolume()).toBe(1);
    });

    it("tracks global mute state", () => {
      musicService.setGlobalMute(true);
      expect(musicService.isGloballyMuted()).toBe(true);
      musicService.setGlobalMute(false);
      expect(musicService.isGloballyMuted()).toBe(false);
    });
  });

  describe("subscriptions", () => {
    it("emits state updates to subscribers", () => {
      const listener = vi.fn();
      const unsubscribe = musicService.subscribe(listener);

      musicService.play();

      expect(listener).toHaveBeenCalled();
      const latestCall =
        listener.mock.calls[listener.mock.calls.length - 1]?.[0];
      expect(latestCall?.isPlaying).toBe(true);

      unsubscribe();
    });
  });

  describe("persistence", () => {
    it("saves volume to localStorage", () => {
      musicService.setVolume(0.75);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "music-volume",
        "0.75"
      );
    });

    it("saves playing state to localStorage", () => {
      musicService.play();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "music-playing",
        "true"
      );
    });

    it("saves paused state to localStorage", () => {
      musicService.pause();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "music-playing",
        "false"
      );
    });

    it("saves current track index to localStorage", () => {
      musicService.next();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "music-current-track",
        "1"
      );
    });
  });

  describe("track selection", () => {
    it("selects track by index", () => {
      musicService.selectTrack(1);
      expect(musicService.getCurrentTrack().id).toBe("chill_0");
    });

    it("ignores invalid negative index", () => {
      const current = musicService.getCurrentTrack();
      musicService.selectTrack(-1);
      expect(musicService.getCurrentTrack().id).toBe(current.id);
    });

    it("ignores invalid out of bounds index", () => {
      const current = musicService.getCurrentTrack();
      musicService.selectTrack(999);
      expect(musicService.getCurrentTrack().id).toBe(current.id);
    });

    it("continues playing when selecting new track", () => {
      musicService.play();
      musicService.selectTrack(1);
      expect(musicService.isPlaying()).toBe(true);
    });
  });

  describe("getAllTracks", () => {
    it("returns all available tracks", () => {
      const tracks = musicService.getAllTracks();
      expect(tracks.length).toBe(3);
    });

    it("returns tracks with id, name, and src", () => {
      const tracks = musicService.getAllTracks();
      tracks.forEach((track) => {
        expect(track).toHaveProperty("id");
        expect(track).toHaveProperty("name");
        expect(track).toHaveProperty("src");
      });
    });
  });
});
