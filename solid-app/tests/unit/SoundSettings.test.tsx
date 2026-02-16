import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@solidjs/testing-library";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { settingsStore, settingsActions } from "@/stores/settingsStore";

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

describe("SoundSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsActions.setSoundEnabled(true);
    settingsActions.setVolume(50);
  });

  describe("toggle changes soundEnabled", () => {
    it("renders sound toggle checkbox", () => {
      const { getByLabelText } = render(() => <SoundSettings />);
      expect(getByLabelText("Sound Enabled")).toBeInTheDocument();
    });

    it("reflects current soundEnabled state", () => {
      settingsActions.setSoundEnabled(true);
      const { getByLabelText } = render(() => <SoundSettings />);
      const checkbox = getByLabelText("Sound Enabled") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("toggles soundEnabled when checkbox is changed", async () => {
      settingsActions.setSoundEnabled(true);
      const { getByLabelText } = render(() => <SoundSettings />);
      const checkbox = getByLabelText("Sound Enabled") as HTMLInputElement;
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      expect(settingsStore.soundEnabled).toBe(false);
    });

    it("calls setSoundEnabled when checkbox changes", async () => {
      settingsActions.setSoundEnabled(false);
      const spy = vi.spyOn(settingsActions, "setSoundEnabled");
      const { getByLabelText } = render(() => <SoundSettings />);
      const checkbox = getByLabelText("Sound Enabled") as HTMLInputElement;
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      expect(spy).toHaveBeenCalledWith(true);
    });
  });

  describe("volume slider changes volume", () => {
    it("renders volume slider", () => {
      const { container } = render(() => <SoundSettings />);
      const slider = container.querySelector('input[type="range"]');
      expect(slider).toBeInTheDocument();
    });

    it("displays current volume value", () => {
      settingsActions.setVolume(50);
      const { container } = render(() => <SoundSettings />);
      const label = container.querySelector(".sound-settings__volume-label");
      expect(label?.textContent).toContain("50");
    });

    it("changes volume when slider is moved", async () => {
      settingsActions.setVolume(50);
      const { container } = render(() => <SoundSettings />);
      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
      slider.value = "80";
      slider.dispatchEvent(new Event("input", { bubbles: true }));
      expect(settingsStore.volume).toBe(80);
    });

    it("calls setVolume with new value on input", async () => {
      const spy = vi.spyOn(settingsActions, "setVolume");
      const { container } = render(() => <SoundSettings />);
      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
      slider.value = "30";
      slider.dispatchEvent(new Event("input", { bubbles: true }));
      expect(spy).toHaveBeenCalledWith(30);
    });

    it("updates slider min and max attributes", () => {
      const { container } = render(() => <SoundSettings />);
      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(slider.min).toBe("0");
      expect(slider.max).toBe("100");
    });
  });
});
