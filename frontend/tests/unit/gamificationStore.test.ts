import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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

describe("gamificationStore", () => {
  let gamificationState: typeof import("@/stores/gamificationStore").gamificationState;
  let addKarma: typeof import("@/stores/gamificationStore").addKarma;
  let unlockAchievement: typeof import("@/stores/gamificationStore").unlockAchievement;
  let hasAchievement: typeof import("@/stores/gamificationStore").hasAchievement;
  let recordTaskCompletion: typeof import("@/stores/gamificationStore").recordTaskCompletion;
  let resetStats: typeof import("@/stores/gamificationStore").resetStats;

  beforeEach(async () => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    vi.resetModules();
    vi.useFakeTimers();
    const module = await import("@/stores/gamificationStore");
    gamificationState = module.gamificationState;
    addKarma = module.addKarma;
    unlockAchievement = module.unlockAchievement;
    hasAchievement = module.hasAchievement;
    recordTaskCompletion = module.recordTaskCompletion;
    resetStats = module.resetStats;
  });

  afterEach(() => {
    mockLocalStorage.clear();
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("has zero karmaPoints", () => {
      expect(gamificationState.karmaPoints).toBe(0);
    });

    it("has empty achievements array", () => {
      expect(gamificationState.achievements).toEqual([]);
    });

    it("has default dailyStats", () => {
      expect(gamificationState.dailyStats.completed).toBe(0);
      expect(gamificationState.dailyStats.edited).toBe(0);
      expect(gamificationState.dailyStats.deleted).toBe(0);
      expect(gamificationState.dailyStats.focusTime).toBe(0);
    });

    it("has default firstTask flags", () => {
      expect(gamificationState.firstTaskCreated).toBe(false);
      expect(gamificationState.firstTaskDeleted).toBe(false);
      expect(gamificationState.firstTaskEdited).toBe(false);
    });

    it("has zero aiEditCount", () => {
      expect(gamificationState.aiEditCount).toBe(0);
    });

    it("has zero aiWordsEdited", () => {
      expect(gamificationState.aiWordsEdited).toBe(0);
    });
  });

  describe("addKarma", () => {
    it("increases points by positive amount", () => {
      addKarma(10);
      expect(gamificationState.karmaPoints).toBe(10);
    });

    it("accumulates points with multiple calls", () => {
      addKarma(10);
      addKarma(25);
      addKarma(5);
      expect(gamificationState.karmaPoints).toBe(40);
    });

    it("can decrease points with negative amount", () => {
      addKarma(50);
      addKarma(-20);
      expect(gamificationState.karmaPoints).toBe(30);
    });

    it("persists changes", () => {
      addKarma(100);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("unlockAchievement", () => {
    it("adds achievement", () => {
      const achievement = {
        id: "first-task",
        title: "First Task",
        description: "Create your first task",
        icon: "star",
      };
      unlockAchievement(achievement);
      expect(gamificationState.achievements).toHaveLength(1);
      expect(gamificationState.achievements[0].id).toBe("first-task");
      expect(gamificationState.achievements[0].unlockedAt).toBeDefined();
    });

    it("does not add duplicate achievement", () => {
      const achievement = {
        id: "first-task",
        title: "First Task",
        description: "Create your first task",
        icon: "star",
      };
      unlockAchievement(achievement);
      unlockAchievement(achievement);
      expect(gamificationState.achievements).toHaveLength(1);
    });

    it("adds multiple different achievements", () => {
      unlockAchievement({
        id: "first-task",
        title: "First Task",
        description: "Desc",
        icon: "star",
      });
      unlockAchievement({
        id: "ten-tasks",
        title: "Ten Tasks",
        description: "Desc",
        icon: "trophy",
      });
      unlockAchievement({
        id: "streak-7",
        title: "7 Day Streak",
        description: "Desc",
        icon: "fire",
      });
      expect(gamificationState.achievements).toHaveLength(3);
    });

    it("persists changes", () => {
      unlockAchievement({
        id: "test",
        title: "Test",
        description: "Test",
        icon: "test",
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("hasAchievement", () => {
    it("returns false when no achievements", () => {
      expect(hasAchievement("first-task")).toBe(false);
    });

    it("returns true when achievement exists", () => {
      unlockAchievement({
        id: "first-task",
        title: "First Task",
        description: "Desc",
        icon: "star",
      });
      expect(hasAchievement("first-task")).toBe(true);
    });

    it("returns false when achievement does not exist", () => {
      unlockAchievement({
        id: "first-task",
        title: "First Task",
        description: "Desc",
        icon: "star",
      });
      expect(hasAchievement("other-achievement")).toBe(false);
    });
  });

  describe("recordTaskCompletion", () => {
    it("increments completed count", () => {
      recordTaskCompletion();
      expect(gamificationState.dailyStats.completed).toBe(1);
    });

    it("accumulates completions", () => {
      recordTaskCompletion();
      recordTaskCompletion();
      recordTaskCompletion();
      expect(gamificationState.dailyStats.completed).toBe(3);
    });

    it("updates lastUpdate to today", () => {
      const today = new Date().toISOString().split("T")[0];
      recordTaskCompletion();
      expect(gamificationState.dailyStats.lastUpdate).toBe(today);
    });

    it("persists changes", () => {
      recordTaskCompletion();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("daily reset logic", () => {
    it("resets dailyStats when day changes", async () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00"));
      vi.resetModules();
      const module1 = await import("@/stores/gamificationStore");
      module1.recordTaskCompletion();
      module1.recordTaskCompletion();
      expect(module1.gamificationState.dailyStats.completed).toBe(2);

      vi.setSystemTime(new Date("2024-01-16T12:00:00"));
      mockLocalStorage.clear();
      vi.resetModules();
      const module2 = await import("@/stores/gamificationStore");
      expect(module2.gamificationState.dailyStats.completed).toBe(0);
    });

    it("preserves karmaPoints across day change", async () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00"));
      vi.resetModules();
      const module1 = await import("@/stores/gamificationStore");
      module1.addKarma(100);
      expect(module1.gamificationState.karmaPoints).toBe(100);

      vi.setSystemTime(new Date("2024-01-16T12:00:00"));
      vi.resetModules();
      const module2 = await import("@/stores/gamificationStore");
      expect(module2.gamificationState.karmaPoints).toBe(100);
    });

    it("preserves achievements across day change", async () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00"));
      vi.resetModules();
      const module1 = await import("@/stores/gamificationStore");
      module1.unlockAchievement({
        id: "test",
        title: "Test",
        description: "Test",
        icon: "star",
      });
      expect(module1.gamificationState.achievements).toHaveLength(1);

      vi.setSystemTime(new Date("2024-01-16T12:00:00"));
      vi.resetModules();
      const module2 = await import("@/stores/gamificationStore");
      expect(module2.gamificationState.achievements).toHaveLength(1);
    });
  });

  describe("resetStats", () => {
    it("resets all state to defaults", async () => {
      addKarma(100);
      unlockAchievement({
        id: "test",
        title: "Test",
        description: "Test",
        icon: "star",
      });
      recordTaskCompletion();
      resetStats();
      mockLocalStorage.clear();
      vi.resetModules();
      const module = await import("@/stores/gamificationStore");
      expect(module.gamificationState.karmaPoints).toBe(0);
      expect(module.gamificationState.achievements).toEqual([]);
      expect(module.gamificationState.dailyStats.completed).toBe(0);
    });

    it("persists reset", () => {
      addKarma(50);
      resetStats();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });
});
