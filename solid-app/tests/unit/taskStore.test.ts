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

Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid-" + Math.random().toString(36).slice(2)),
  },
  writable: true,
});

describe("taskStore", () => {
  let taskStore: typeof import("@/stores/taskStore").taskStore;
  let taskActions: typeof import("@/stores/taskStore").taskActions;

  beforeEach(async () => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    vi.resetModules();
    const module = await import("@/stores/taskStore");
    taskStore = module.taskStore;
    taskActions = module.taskActions;
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe("initial state", () => {
    it("has empty tasks array", () => {
      expect(taskStore.tasks).toEqual([]);
    });

    it("has default filter set to all", () => {
      expect(taskStore.currentFilter).toBe("all");
    });
  });

  describe("addTask", () => {
    it("creates task with id and timestamps", () => {
      const beforeAdd = new Date().toISOString();
      taskActions.addTask({ title: "Test Task", description: "Test description" });
      const afterAdd = new Date().toISOString();

      expect(taskStore.tasks).toHaveLength(1);
      const task = taskStore.tasks[0];
      expect(task.id).toBeDefined();
      expect(task.title).toBe("Test Task");
      expect(task.description).toBe("Test description");
      expect(task.completed).toBe(false);
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
      expect(task.createdAt >= beforeAdd).toBe(true);
      expect(task.createdAt <= afterAdd).toBe(true);
    });

    it("creates task without description", () => {
      taskActions.addTask({ title: "Simple Task" });
      expect(taskStore.tasks[0].description).toBe("");
    });

    it("adds multiple tasks", () => {
      taskActions.addTask({ title: "Task 1" });
      taskActions.addTask({ title: "Task 2" });
      taskActions.addTask({ title: "Task 3" });
      expect(taskStore.tasks).toHaveLength(3);
    });
  });

  describe("updateTask", () => {
    it("modifies existing task", () => {
      taskActions.addTask({ title: "Original Title" });
      const taskId = taskStore.tasks[0].id;
      taskActions.updateTask(taskId, { title: "Updated Title" });
      expect(taskStore.tasks[0].title).toBe("Updated Title");
    });

    it("updates completed status", () => {
      taskActions.addTask({ title: "Task" });
      const taskId = taskStore.tasks[0].id;
      taskActions.updateTask(taskId, { completed: true });
      expect(taskStore.tasks[0].completed).toBe(true);
    });

    it("updates updatedAt timestamp", async () => {
      taskActions.addTask({ title: "Task" });
      const taskId = taskStore.tasks[0].id;
      const originalUpdatedAt = taskStore.tasks[0].updatedAt;
      await new Promise((r) => setTimeout(r, 10));
      taskActions.updateTask(taskId, { title: "Updated" });
      expect(taskStore.tasks[0].updatedAt).not.toBe(originalUpdatedAt);
    });

    it("does not modify other tasks", () => {
      taskActions.addTask({ title: "Task 1" });
      taskActions.addTask({ title: "Task 2" });
      const taskId1 = taskStore.tasks[0].id;
      taskActions.updateTask(taskId1, { title: "Updated Task 1" });
      expect(taskStore.tasks[1].title).toBe("Task 2");
    });
  });

  describe("deleteTask", () => {
    it("removes task", () => {
      taskActions.addTask({ title: "Task to delete" });
      const taskId = taskStore.tasks[0].id;
      taskActions.deleteTask(taskId);
      expect(taskStore.tasks).toHaveLength(0);
    });

    it("removes only the specified task", () => {
      taskActions.addTask({ title: "Task 1" });
      taskActions.addTask({ title: "Task 2" });
      taskActions.addTask({ title: "Task 3" });
      const taskId2 = taskStore.tasks[1].id;
      taskActions.deleteTask(taskId2);
      expect(taskStore.tasks).toHaveLength(2);
      expect(taskStore.tasks.map((t) => t.title)).toEqual(["Task 1", "Task 3"]);
    });

    it("does nothing if task not found", () => {
      taskActions.addTask({ title: "Task" });
      taskActions.deleteTask("nonexistent-id");
      expect(taskStore.tasks).toHaveLength(1);
    });
  });

  describe("toggleTask", () => {
    it("flips completed state from false to true", () => {
      taskActions.addTask({ title: "Task" });
      const taskId = taskStore.tasks[0].id;
      taskActions.toggleTask(taskId);
      expect(taskStore.tasks[0].completed).toBe(true);
    });

    it("flips completed state from true to false", () => {
      taskActions.addTask({ title: "Task" });
      const taskId = taskStore.tasks[0].id;
      taskActions.toggleTask(taskId);
      taskActions.toggleTask(taskId);
      expect(taskStore.tasks[0].completed).toBe(false);
    });

    it("updates updatedAt timestamp", async () => {
      taskActions.addTask({ title: "Task" });
      const taskId = taskStore.tasks[0].id;
      const originalUpdatedAt = taskStore.tasks[0].updatedAt;
      await new Promise((r) => setTimeout(r, 10));
      taskActions.toggleTask(taskId);
      expect(taskStore.tasks[0].updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe("setFilter", () => {
    it("changes filter to active", () => {
      taskActions.setFilter("active");
      expect(taskStore.currentFilter).toBe("active");
    });

    it("changes filter to completed", () => {
      taskActions.setFilter("completed");
      expect(taskStore.currentFilter).toBe("completed");
    });

    it("changes filter to all", () => {
      taskActions.setFilter("active");
      taskActions.setFilter("all");
      expect(taskStore.currentFilter).toBe("all");
    });
  });

  describe("clearCompleted", () => {
    it("removes only completed tasks", () => {
      taskActions.addTask({ title: "Active 1" });
      taskActions.addTask({ title: "Completed 1" });
      taskActions.addTask({ title: "Active 2" });
      taskActions.addTask({ title: "Completed 2" });
      taskActions.toggleTask(taskStore.tasks[1].id);
      taskActions.toggleTask(taskStore.tasks[3].id);
      taskActions.clearCompleted();
      expect(taskStore.tasks).toHaveLength(2);
      expect(taskStore.tasks.every((t) => !t.completed)).toBe(true);
    });

    it("does nothing if no completed tasks", () => {
      taskActions.addTask({ title: "Active 1" });
      taskActions.addTask({ title: "Active 2" });
      taskActions.clearCompleted();
      expect(taskStore.tasks).toHaveLength(2);
    });

    it("removes all tasks if all are completed", () => {
      taskActions.addTask({ title: "Task 1" });
      taskActions.addTask({ title: "Task 2" });
      taskActions.toggleTask(taskStore.tasks[0].id);
      taskActions.toggleTask(taskStore.tasks[1].id);
      taskActions.clearCompleted();
      expect(taskStore.tasks).toHaveLength(0);
    });
  });

  describe("filteredTasks", () => {
    beforeEach(() => {
      taskActions.addTask({ title: "Active 1" });
      taskActions.addTask({ title: "Completed 1" });
      taskActions.addTask({ title: "Active 2" });
      taskActions.addTask({ title: "Completed 2" });
      taskActions.toggleTask(taskStore.tasks[1].id);
      taskActions.toggleTask(taskStore.tasks[3].id);
    });

    it("returns all tasks when filter is all", () => {
      taskActions.setFilter("all");
      expect(taskStore.filteredTasks()).toHaveLength(4);
    });

    it("returns only active tasks when filter is active", () => {
      taskActions.setFilter("active");
      const filtered = taskStore.filteredTasks();
      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => !t.completed)).toBe(true);
    });

    it("returns only completed tasks when filter is completed", () => {
      taskActions.setFilter("completed");
      const filtered = taskStore.filteredTasks();
      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.completed)).toBe(true);
    });
  });

  describe("taskCounts", () => {
    it("returns correct totals with mixed tasks", () => {
      taskActions.addTask({ title: "Active 1" });
      taskActions.addTask({ title: "Completed 1" });
      taskActions.addTask({ title: "Active 2" });
      taskActions.toggleTask(taskStore.tasks[1].id);
      const counts = taskStore.taskCounts();
      expect(counts).toEqual({ total: 3, active: 2, completed: 1 });
    });

    it("returns zeros when no tasks", () => {
      const counts = taskStore.taskCounts();
      expect(counts).toEqual({ total: 0, active: 0, completed: 0 });
    });

    it("returns correct counts when all completed", () => {
      taskActions.addTask({ title: "Task 1" });
      taskActions.addTask({ title: "Task 2" });
      taskActions.toggleTask(taskStore.tasks[0].id);
      taskActions.toggleTask(taskStore.tasks[1].id);
      const counts = taskStore.taskCounts();
      expect(counts).toEqual({ total: 2, active: 0, completed: 2 });
    });

    it("returns correct counts when all active", () => {
      taskActions.addTask({ title: "Task 1" });
      taskActions.addTask({ title: "Task 2" });
      taskActions.addTask({ title: "Task 3" });
      const counts = taskStore.taskCounts();
      expect(counts).toEqual({ total: 3, active: 3, completed: 0 });
    });
  });
});
