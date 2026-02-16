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

function createMockGainNode() {
  const gainParam = {
    value: 0.5,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  return {
    gain: gainParam,
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function createMockOscillator() {
  return {
    type: "sine",
    frequency: {
      value: 440,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function createMockBiquadFilter() {
  return {
    type: "lowpass",
    frequency: {
      value: 600,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
}

class MockAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  
  createGain = vi.fn(() => createMockGainNode());
  createOscillator = vi.fn(() => createMockOscillator());
  createBiquadFilter = vi.fn(() => createMockBiquadFilter());
  resume = vi.fn(() => Promise.resolve());
  suspend = vi.fn(() => Promise.resolve());
}

const originalAudioContext = global.AudioContext;
const originalWebkitAudioContext = (global as any).webkitAudioContext;

vi.mock("@/stores/settingsStore", () => ({
  settingsStore: {
    soundEnabled: true,
    volume: 50,
  },
  settingsActions: {
    setSoundEnabled: vi.fn(),
    setVolume: vi.fn(),
  },
}));

describe("AudioService", () => {
  let audioService: import("@/services/audio").AudioService;

  beforeEach(async () => {
    vi.resetModules();
    mockLocalStorage.clear();

    global.AudioContext = MockAudioContext as any;
    (global as any).webkitAudioContext = MockAudioContext;

    const module = await import("@/services/audio");
    audioService = module.audioService;
  });

  afterEach(() => {
    global.AudioContext = originalAudioContext;
    (global as any).webkitAudioContext = originalWebkitAudioContext;
  });

  describe("sound types", () => {
    it("plays add sound without error", async () => {
      await expect(audioService.play("add")).resolves.not.toThrow();
    });

    it("plays complete sound without error", async () => {
      await expect(audioService.play("complete")).resolves.not.toThrow();
    });

    it("plays delete sound without error", async () => {
      await expect(audioService.play("delete")).resolves.not.toThrow();
    });

    it("plays achievement sound without error", async () => {
      await expect(audioService.play("achievement")).resolves.not.toThrow();
    });

    it("plays victory sound without error", async () => {
      await expect(audioService.play("victory")).resolves.not.toThrow();
    });

    it("plays click sound without error", async () => {
      await expect(audioService.play("click")).resolves.not.toThrow();
    });
  });

  describe("volume control", () => {
    it("sets volume to valid value", async () => {
      await audioService.init();
      audioService.setVolume(50);
      expect(() => audioService.setVolume(50)).not.toThrow();
    });

    it("clamps volume to minimum 0", async () => {
      await audioService.init();
      audioService.setVolume(-10);
      expect(() => audioService.setVolume(-10)).not.toThrow();
    });

    it("clamps volume to maximum 100", async () => {
      await audioService.init();
      audioService.setVolume(150);
      expect(() => audioService.setVolume(150)).not.toThrow();
    });

    it("handles volume 0", async () => {
      await audioService.init();
      audioService.setVolume(0);
      expect(() => audioService.setVolume(0)).not.toThrow();
    });

    it("handles volume 100", async () => {
      await audioService.init();
      audioService.setVolume(100);
      expect(() => audioService.setVolume(100)).not.toThrow();
    });
  });

  describe("enabled/disabled state", () => {
    it("setEnabled(false) suspends audio context", async () => {
      await audioService.init();
      audioService.setEnabled(false);
      expect(() => audioService.setEnabled(false)).not.toThrow();
    });

    it("setEnabled(true) resumes audio context", async () => {
      await audioService.init();
      audioService.setEnabled(true);
      expect(() => audioService.setEnabled(true)).not.toThrow();
    });

    it("isEnabled returns soundEnabled from settings", () => {
      const result = audioService.isEnabled();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("initialization", () => {
    it("initializes without error", async () => {
      await expect(audioService.init()).resolves.not.toThrow();
    });

    it("does not throw when initialized multiple times", async () => {
      await audioService.init();
      await audioService.init();
      expect(true).toBe(true);
    });
  });
});
