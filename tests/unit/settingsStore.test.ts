import { describe, it, expect, beforeEach, vi } from "vitest";

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

describe("settingsStore", () => {
  let settingsStore: typeof import("@/stores/settingsStore").settingsStore;
  let settingsActions: typeof import("@/stores/settingsStore").settingsActions;

  beforeEach(async () => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-theme");
    vi.resetModules();
    const module = await import("@/stores/settingsStore");
    settingsStore = module.settingsStore;
    settingsActions = module.settingsActions;
  });

  describe("default settings", () => {
    it("has default theme", () => {
      expect(settingsStore.theme).toBe("emerald");
    });

    it("has default darkMode", () => {
      expect(settingsStore.darkMode).toBe(true);
    });

    it("has default soundEnabled", () => {
      expect(settingsStore.soundEnabled).toBe(true);
    });

    it("has default volume", () => {
      expect(settingsStore.volume).toBe(50);
    });

    it("has default animations", () => {
      expect(settingsStore.animations).toBe(true);
    });

    it("has default font", () => {
      expect(settingsStore.font).toBe("inter");
    });
  });

  describe("setTheme", () => {
    it("updates theme", () => {
      settingsActions.setTheme("graphite");
      expect(settingsStore.theme).toBe("graphite");
    });

    it("applies theme to document", () => {
      settingsActions.setTheme("aurora");
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "aurora"
      );
    });

    it("persists theme change", () => {
      settingsActions.setTheme("champagne");
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it("updates muted text color for dark themes", () => {
      settingsActions.setTheme("midnight");
      expect(
        document.documentElement.style.getPropertyValue("--color-text-muted")
      ).toBe("rgba(241, 245, 249, 0.64)");
    });

    it("updates muted text color for light themes", () => {
      settingsActions.setTheme("ivory");
      expect(
        document.documentElement.style.getPropertyValue("--color-text-muted")
      ).toBe("rgba(73, 80, 87, 0.72)");
    });

    it("uses improved accent color for midnight theme", () => {
      settingsActions.setTheme("midnight");
      expect(
        document.documentElement.style.getPropertyValue("--accent-color")
      ).toBe("#38bdf8");
    });

    it("uses readable accent color for low-contrast light themes", () => {
      settingsActions.setTheme("ivory");
      expect(
        document.documentElement.style.getPropertyValue("--accent-color")
      ).toBe("#6c757d");
    });

    it("preserves original accent when contrast is already strong", () => {
      settingsActions.setTheme("champagne");
      expect(
        document.documentElement.style.getPropertyValue("--accent-color")
      ).toBe("#daa520");
    });
  });

  describe("setDarkMode", () => {
    it("updates darkMode to true", () => {
      settingsActions.setDarkMode(true);
      expect(settingsStore.darkMode).toBe(true);
    });

    it("updates darkMode to false", () => {
      settingsActions.setDarkMode(false);
      expect(settingsStore.darkMode).toBe(false);
    });

    it("persists darkMode change", () => {
      settingsActions.setDarkMode(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("setSoundEnabled", () => {
    it("updates soundEnabled to true", () => {
      settingsActions.setSoundEnabled(true);
      expect(settingsStore.soundEnabled).toBe(true);
    });

    it("updates soundEnabled to false", () => {
      settingsActions.setSoundEnabled(false);
      expect(settingsStore.soundEnabled).toBe(false);
    });

    it("persists soundEnabled change", () => {
      settingsActions.setSoundEnabled(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("setVolume", () => {
    it("updates volume", () => {
      settingsActions.setVolume(75);
      expect(settingsStore.volume).toBe(75);
    });

    it("updates volume to 0", () => {
      settingsActions.setVolume(0);
      expect(settingsStore.volume).toBe(0);
    });

    it("updates volume to 100", () => {
      settingsActions.setVolume(100);
      expect(settingsStore.volume).toBe(100);
    });

    it("persists volume change", () => {
      settingsActions.setVolume(30);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("resetToDefaults", () => {
    it("restores default theme", async () => {
      settingsActions.setTheme("aurora");
      settingsActions.resetToDefaults();
      mockLocalStorage.clear();
      vi.resetModules();
      const module = await import("@/stores/settingsStore");
      expect(module.settingsStore.theme).toBe("emerald");
    });

    it("restores default darkMode", async () => {
      settingsActions.setDarkMode(false);
      settingsActions.resetToDefaults();
      mockLocalStorage.clear();
      vi.resetModules();
      const module = await import("@/stores/settingsStore");
      expect(module.settingsStore.darkMode).toBe(true);
    });

    it("restores default soundEnabled", async () => {
      settingsActions.setSoundEnabled(false);
      settingsActions.resetToDefaults();
      mockLocalStorage.clear();
      vi.resetModules();
      const module = await import("@/stores/settingsStore");
      expect(module.settingsStore.soundEnabled).toBe(true);
    });

    it("restores default volume", async () => {
      settingsActions.setVolume(0);
      settingsActions.resetToDefaults();
      mockLocalStorage.clear();
      vi.resetModules();
      const module = await import("@/stores/settingsStore");
      expect(module.settingsStore.volume).toBe(50);
    });

    it("restores default animations", async () => {
      settingsActions.setAnimations(false);
      settingsActions.resetToDefaults();
      mockLocalStorage.clear();
      vi.resetModules();
      const module = await import("@/stores/settingsStore");
      expect(module.settingsStore.animations).toBe(true);
    });

    it("restores default font", async () => {
      settingsActions.setFont("playfair");
      settingsActions.resetToDefaults();
      mockLocalStorage.clear();
      vi.resetModules();
      const module = await import("@/stores/settingsStore");
      expect(module.settingsStore.font).toBe("inter");
    });

    it("applies default theme to document", async () => {
      settingsActions.setTheme("graphite");
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "graphite"
      );
      settingsActions.resetToDefaults();
      mockLocalStorage.clear();
      vi.resetModules();
      await import("@/stores/settingsStore");
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        "emerald"
      );
    });
  });
});
