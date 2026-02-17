import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";
import CenterActionBar from "@/components/center-bar/CenterActionBar";
import { settingsStore, settingsActions } from "@/stores/settingsStore";
import { musicService } from "@/services/music";

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

describe("CenterActionBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsActions.setSoundEnabled(true);
  });

  describe("renders all buttons", () => {
    it("renders the toolbar", () => {
      const { container, unmount } = render(() => <CenterActionBar />);
      expect(container.querySelector("#centerActionBar")).toBeInTheDocument();
      expect(container.querySelector('[role="toolbar"]')).toBeInTheDocument();
      unmount();
    });

    it("renders Settings button", () => {
      const { getByLabelText, unmount } = render(() => <CenterActionBar />);
      expect(getByLabelText("Settings")).toBeInTheDocument();
      unmount();
    });

    it("renders Music button", () => {
      const { getByLabelText, unmount } = render(() => <CenterActionBar />);
      expect(getByLabelText("Music")).toBeInTheDocument();
      unmount();
    });

    it("renders Sound button", () => {
      const { getByLabelText, unmount } = render(() => <CenterActionBar />);
      expect(getByLabelText("Mute sound")).toBeInTheDocument();
      unmount();
    });

    it("renders Test button", () => {
      const { getByLabelText, unmount } = render(() => <CenterActionBar />);
      expect(getByLabelText("Run Tests")).toBeInTheDocument();
      unmount();
    });

    it("renders Clear button", () => {
      const { getByLabelText, unmount } = render(() => <CenterActionBar />);
      expect(getByLabelText("Clear Completed")).toBeInTheDocument();
      unmount();
    });

    it("renders Delete button", () => {
      const { getByLabelText, unmount } = render(() => <CenterActionBar />);
      expect(getByLabelText("Delete All")).toBeInTheDocument();
      unmount();
    });

    it("has all 6 data-action attributes", () => {
      const { container, unmount } = render(() => <CenterActionBar />);
      const actions = ["settings", "music", "sound", "test", "clear", "delete"];
      actions.forEach((action) => {
        expect(
          container.querySelector(`[data-action="${action}"]`)
        ).toBeInTheDocument();
      });
      unmount();
    });

    it("applies music playing class when playing", () => {
      const { container, unmount } = render(() => (
        <CenterActionBar isMusicPlaying={true} isMusicBuffering={false} />
      ));
      const musicBtn = container.querySelector("#cabMusic");
      expect(musicBtn).toHaveClass("is-playing");
      expect(musicBtn).not.toHaveClass("is-paused");
      unmount();
    });

    it("applies music buffering class when buffering", () => {
      const { container, unmount } = render(() => (
        <CenterActionBar isMusicPlaying={true} isMusicBuffering={true} />
      ));
      const musicBtn = container.querySelector("#cabMusic");
      expect(musicBtn).toHaveClass("buffering");
      unmount();
    });
  });

  describe("action buttons emit correct actions", () => {
    it("emits settings action when Settings button is clicked", async () => {
      const onAction = vi.fn();
      const { container, unmount } = render(() => (
        <CenterActionBar onAction={onAction} />
      ));
      const settingsBtn = container.querySelector('[data-action="settings"]');
      if (settingsBtn) {
        await fireEvent.click(settingsBtn);
      }
      expect(onAction).toHaveBeenCalledWith("settings");
      unmount();
    });

    it("emits music action when Music button is clicked", async () => {
      const onAction = vi.fn();
      const { container, unmount } = render(() => (
        <CenterActionBar onAction={onAction} />
      ));
      const musicBtn = container.querySelector('[data-action="music"]');
      if (musicBtn) {
        await fireEvent.click(musicBtn);
      }
      expect(onAction).toHaveBeenCalledWith("music");
      unmount();
    });

    it("emits sound action when Sound button is clicked", async () => {
      const onAction = vi.fn();
      const { container, unmount } = render(() => (
        <CenterActionBar onAction={onAction} />
      ));
      const soundBtn = container.querySelector('[data-action="sound"]');
      if (soundBtn) {
        await fireEvent.click(soundBtn);
      }
      expect(onAction).toHaveBeenCalledWith("sound");
      unmount();
    });

    it("emits test action when Test button is clicked", async () => {
      const onAction = vi.fn();
      const { container, unmount } = render(() => (
        <CenterActionBar onAction={onAction} />
      ));
      const testBtn = container.querySelector('[data-action="test"]');
      if (testBtn) {
        await fireEvent.click(testBtn);
      }
      expect(onAction).toHaveBeenCalledWith("test");
      unmount();
    });

    it("emits clear action when Clear button is clicked", async () => {
      const onAction = vi.fn();
      const { container, unmount } = render(() => (
        <CenterActionBar onAction={onAction} />
      ));
      const clearBtn = container.querySelector('[data-action="clear"]');
      if (clearBtn) {
        await fireEvent.click(clearBtn);
      }
      expect(onAction).toHaveBeenCalledWith("clear");
      unmount();
    });

    it("emits delete action when Delete button is clicked", async () => {
      const onAction = vi.fn();
      const { container, unmount } = render(() => (
        <CenterActionBar onAction={onAction} />
      ));
      const deleteBtn = container.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        await fireEvent.click(deleteBtn);
      }
      expect(onAction).toHaveBeenCalledWith("delete");
      unmount();
    });
  });

  describe("sound toggle functionality", () => {
    it("toggles sound from enabled to disabled when clicked", async () => {
      const muteSpy = vi.spyOn(musicService, "setGlobalMute");
      settingsActions.setSoundEnabled(true);
      const { container, unmount } = render(() => <CenterActionBar />);
      const soundBtn = container.querySelector('[data-action="sound"]');
      if (soundBtn) {
        await fireEvent.click(soundBtn);
      }
      expect(settingsStore.soundEnabled).toBe(false);
      expect(muteSpy).toHaveBeenCalledWith(true);
      unmount();
    });

    it("toggles sound from disabled to enabled when clicked", async () => {
      const muteSpy = vi.spyOn(musicService, "setGlobalMute");
      settingsActions.setSoundEnabled(false);
      const { container, unmount } = render(() => <CenterActionBar />);
      const soundBtn = container.querySelector('[data-action="sound"]');
      if (soundBtn) {
        await fireEvent.click(soundBtn);
      }
      expect(settingsStore.soundEnabled).toBe(true);
      expect(muteSpy).toHaveBeenCalledWith(false);
      unmount();
    });

    it("shows Mute sound aria-label when sound is enabled", () => {
      settingsActions.setSoundEnabled(true);
      const { getByLabelText, unmount } = render(() => <CenterActionBar />);
      expect(getByLabelText("Mute sound")).toBeInTheDocument();
      unmount();
    });

    it("shows Enable sound aria-label when sound is disabled", () => {
      settingsActions.setSoundEnabled(false);
      const { getByLabelText, unmount } = render(() => <CenterActionBar />);
      expect(getByLabelText("Enable sound")).toBeInTheDocument();
      unmount();
    });
  });

  describe("delete button styling", () => {
    it("has btn--delete class on Delete button", () => {
      const { container, unmount } = render(() => <CenterActionBar />);
      const deleteBtn = container.querySelector('[data-action="delete"]');
      expect(deleteBtn).toHaveClass("btn--delete");
      unmount();
    });
  });
});
