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
    get store() {
      return store;
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

vi.mock("@/services/storage", async () => {
  const actual = await vi.importActual<typeof import("@/services/storage")>("@/services/storage");
  return {
    ...actual,
  };
});

describe("storage", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe("getItems", () => {
    it("returns default when no data", async () => {
      const { getItems } = await import("@/services/storage");
      const result = getItems<string[]>("nonexistent-key", []);
      expect(result).toEqual([]);
    });

    it("returns parsed data when exists", async () => {
      const { getItems } = await import("@/services/storage");
      mockLocalStorage.setItem("test-key", JSON.stringify([1, 2, 3]));
      const result = getItems<number[]>("test-key", []);
      expect(result).toEqual([1, 2, 3]);
    });

    it("returns default on parse error", async () => {
      const { getItems } = await import("@/services/storage");
      mockLocalStorage.setItem("test-key", "invalid-json");
      const result = getItems<number[]>("test-key", [0]);
      expect(result).toEqual([0]);
    });
  });

  describe("setItem and getItems roundtrip", () => {
    it("stores and retrieves object data", async () => {
      const { setItem, getItems } = await import("@/services/storage");
      const data = { name: "test", value: 42 };
      setItem("test-key", data);
      const result = getItems<{ name: string; value: number }>("test-key", {});
      expect(result).toEqual(data);
    });

    it("stores and retrieves array data", async () => {
      const { setItem, getItems } = await import("@/services/storage");
      const data = [1, 2, 3, 4, 5];
      setItem("test-key", data);
      const result = getItems<number[]>("test-key", []);
      expect(result).toEqual(data);
    });

    it("stores and retrieves primitive data", async () => {
      const { setItem, getItems } = await import("@/services/storage");
      setItem("test-key", "hello world");
      const result = getItems<string>("test-key", "");
      expect(result).toBe("hello world");
    });
  });

  describe("tasksStorage", () => {
    it("get returns empty array by default", async () => {
      const { tasksStorage } = await import("@/services/storage");
      const result = tasksStorage.get();
      expect(result).toEqual([]);
    });

    it("set stores tasks and get retrieves them", async () => {
      const { tasksStorage } = await import("@/services/storage");
      const tasks = [
        { id: "1", title: "Task 1", description: "", completed: false, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
        { id: "2", title: "Task 2", description: "Desc", completed: true, createdAt: "2024-01-02", updatedAt: "2024-01-02" },
      ];
      tasksStorage.set(tasks);
      const result = tasksStorage.get();
      expect(result).toEqual(tasks);
    });

    it("clear removes all tasks", async () => {
      const { tasksStorage } = await import("@/services/storage");
      const tasks = [{ id: "1", title: "Task 1", description: "", completed: false, createdAt: "2024-01-01", updatedAt: "2024-01-01" }];
      tasksStorage.set(tasks);
      tasksStorage.clear();
      const result = tasksStorage.get();
      expect(result).toEqual([]);
    });
  });

  describe("settingsStorage", () => {
    it("get returns null by default", async () => {
      const { settingsStorage } = await import("@/services/storage");
      const result = settingsStorage.get();
      expect(result).toBeNull();
    });

    it("set stores settings and get retrieves them", async () => {
      const { settingsStorage } = await import("@/services/storage");
      const settings = { theme: "emerald" as const, darkMode: true, soundEnabled: false, volume: 75, animations: true, font: "inter" as const };
      settingsStorage.set(settings);
      const result = settingsStorage.get();
      expect(result).toEqual(settings);
    });
  });

  describe("gamificationStorage", () => {
    it("get returns null by default", async () => {
      const { gamificationStorage } = await import("@/services/storage");
      const result = gamificationStorage.get();
      expect(result).toBeNull();
    });

    it("set stores state and get retrieves it", async () => {
      const { gamificationStorage } = await import("@/services/storage");
      const state = {
        karmaPoints: 100,
        achievements: [],
        dailyStats: { completed: 5, edited: 2, deleted: 1, focusTime: 60, lastUpdate: "2024-01-01" },
        firstTaskCreated: true,
        firstTaskDeleted: false,
        firstTaskEdited: true,
        aiEditCount: 3,
        aiWordsEdited: 50,
      };
      gamificationStorage.set(state);
      const result = gamificationStorage.get();
      expect(result).toEqual(state);
    });
  });

  describe("statisticsStorage", () => {
    it("get returns null by default", async () => {
      const { statisticsStorage } = await import("@/services/storage");
      const result = statisticsStorage.get();
      expect(result).toBeNull();
    });

    it("set stores stats and get retrieves them", async () => {
      const { statisticsStorage } = await import("@/services/storage");
      const stats = {
        totalTasks: 10,
        completedTasks: 7,
        currentStreak: 5,
        longestStreak: 12,
        totalFocusTime: 3600,
        lastActivity: "2024-01-01T12:00:00.000Z",
      };
      statisticsStorage.set(stats);
      const result = statisticsStorage.get();
      expect(result).toEqual(stats);
    });
  });
});
