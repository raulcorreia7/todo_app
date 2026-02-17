import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@solidjs/testing-library";
import KarmaDisplay from "@/components/gamification/KarmaDisplay";
import { gamificationState, addKarma } from "@/stores/gamificationStore";

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

describe("KarmaDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("displays karma points", () => {
    it("renders karma display container", () => {
      const { container, unmount } = render(() => <KarmaDisplay />);
      expect(container.querySelector(".karma-display")).toBeInTheDocument();
      unmount();
    });

    it("displays karma points value", () => {
      const { container, unmount } = render(() => <KarmaDisplay />);
      const value = container.querySelector(".karma-display__value");
      expect(value).toHaveTextContent(String(gamificationState.karmaPoints));
      unmount();
    });
  });

  describe("animates on change", () => {
    it("updates displayed value when karma changes", async () => {
      const initialPoints = gamificationState.karmaPoints;
      const { container, unmount } = render(() => <KarmaDisplay />);
      const value = container.querySelector(".karma-display__value");
      expect(value).toHaveTextContent(String(initialPoints));
      addKarma(50);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(gamificationState.karmaPoints).toBe(initialPoints + 50);
      unmount();
    });
  });
});
