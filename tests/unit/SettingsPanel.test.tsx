import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";
import SettingsPanel from "@/components/settings/SettingsPanel";

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

describe("SettingsPanel", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe("renders when open", () => {
    it("renders when isOpen is true", () => {
      const onClose = vi.fn();
      const { getByText, getByLabelText } = render(() => (
        <SettingsPanel isOpen={true} onClose={onClose} />
      ));
      expect(getByText("Settings")).toBeInTheDocument();
      expect(getByLabelText("Close settings")).toBeInTheDocument();
    });

    it("renders settings sections when open", () => {
      const onClose = vi.fn();
      const { getByText } = render(() => (
        <SettingsPanel isOpen={true} onClose={onClose} />
      ));
      expect(getByText("Theme")).toBeInTheDocument();
      expect(getByText("Font")).toBeInTheDocument();
      expect(getByText("Sound")).toBeInTheDocument();
    });
  });

  describe("does not render when closed", () => {
    it("does not render when isOpen is false", () => {
      const onClose = vi.fn();
      const { queryByText } = render(() => (
        <SettingsPanel isOpen={false} onClose={onClose} />
      ));
      expect(queryByText("Settings")).not.toBeInTheDocument();
    });

    it("does not render backdrop when closed", () => {
      const onClose = vi.fn();
      const { container } = render(() => (
        <SettingsPanel isOpen={false} onClose={onClose} />
      ));
      const backdrop = container.querySelector(".settings-backdrop");
      expect(backdrop).not.toBeInTheDocument();
    });
  });

  describe("close button triggers onClose", () => {
    it("calls onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      const { getByLabelText } = render(() => (
        <SettingsPanel isOpen={true} onClose={onClose} />
      ));
      const closeButton = getByLabelText("Close settings");
      await fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when backdrop is clicked", async () => {
      const onClose = vi.fn();
      const { container } = render(() => (
        <SettingsPanel isOpen={true} onClose={onClose} />
      ));
      const backdrop = container.querySelector(".settings-backdrop");
      await fireEvent.click(backdrop!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape key is pressed", async () => {
      const onClose = vi.fn();
      render(() => <SettingsPanel isOpen={true} onClose={onClose} />);
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
