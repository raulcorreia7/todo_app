import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
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

describe("ThemeSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsActions.setTheme("emerald");
  });

  describe("renders all theme options", () => {
    it("renders theme selector container", () => {
      const { getByRole } = render(() => <ThemeSelector />);
      expect(
        getByRole("listbox", { name: "Select theme" })
      ).toBeInTheDocument();
    });

    it("renders all theme options", () => {
      const { getAllByRole } = render(() => <ThemeSelector />);
      const options = getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
    });

    it("renders theme names", () => {
      const { getByText } = render(() => <ThemeSelector />);
      expect(getByText("Midnight")).toBeInTheDocument();
      expect(getByText("Ivory")).toBeInTheDocument();
      expect(getByText("Emerald")).toBeInTheDocument();
    });

    it("uses consistent swatch label styles", () => {
      const { getAllByRole } = render(() => <ThemeSelector />);
      const options = getAllByRole("option");
      const ivoryOption = options.find((opt) =>
        opt.getAttribute("aria-label")?.includes("Ivory")
      );

      expect(ivoryOption?.getAttribute("style")).not.toContain(
        "--theme-option-text"
      );
    });
  });

  describe("current theme is highlighted", () => {
    it("highlights active theme with active class", () => {
      settingsActions.setTheme("emerald");
      const { getAllByRole } = render(() => <ThemeSelector />);
      const options = getAllByRole("option");
      const emeraldOption = options.find((opt) =>
        opt.getAttribute("aria-label")?.includes("Emerald")
      );
      expect(emeraldOption).toHaveClass("theme-option--active");
    });

    it("sets aria-selected to true for active theme", () => {
      settingsActions.setTheme("emerald");
      const { getAllByRole } = render(() => <ThemeSelector />);
      const options = getAllByRole("option");
      const emeraldOption = options.find((opt) =>
        opt.getAttribute("aria-label")?.includes("Emerald")
      );
      expect(emeraldOption).toHaveAttribute("aria-selected", "true");
    });

    it("sets aria-selected to false for non-active themes", () => {
      settingsActions.setTheme("emerald");
      const { getAllByRole } = render(() => <ThemeSelector />);
      const options = getAllByRole("option");
      const midnightOption = options.find((opt) =>
        opt.getAttribute("aria-label")?.includes("Midnight")
      );
      expect(midnightOption).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("clicking theme changes setting", () => {
    it("changes theme when option is clicked", async () => {
      settingsActions.setTheme("emerald");
      const { getAllByRole } = render(() => <ThemeSelector />);
      const options = getAllByRole("option");
      const ivoryOption = options.find((opt) =>
        opt.getAttribute("aria-label")?.includes("Ivory")
      );
      if (ivoryOption) {
        await fireEvent.click(ivoryOption);
      }
      expect(settingsStore.theme).toBe("ivory");
    });

    it("calls setTheme when theme is clicked", async () => {
      settingsActions.setTheme("emerald");
      const spy = vi.spyOn(settingsActions, "setTheme");
      const { getAllByRole } = render(() => <ThemeSelector />);
      const options = getAllByRole("option");
      const auroraOption = options.find((opt) =>
        opt.getAttribute("aria-label")?.includes("Aurora")
      );
      if (auroraOption) {
        await fireEvent.click(auroraOption);
      }
      expect(spy).toHaveBeenCalledWith("aurora");
    });
  });
});
