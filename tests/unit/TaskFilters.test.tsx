import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";
import TaskFilters from "@/components/tasks/TaskFilters";

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

describe("TaskFilters", () => {
  let taskActions: typeof import("@/stores/taskStore").taskActions;
  let taskStore: typeof import("@/stores/taskStore").taskStore;

  beforeEach(async () => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    const module = await import("@/stores/taskStore");
    taskActions = module.taskActions;
    taskStore = module.taskStore;
    while (taskStore.tasks.length > 0) {
      taskActions.deleteTask(taskStore.tasks[0].id);
    }
    taskActions.setFilter("all");
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe("renders all three filter buttons", () => {
    it("renders All filter button", () => {
      const { getByText } = render(() => <TaskFilters />);
      expect(getByText("All")).toBeInTheDocument();
    });

    it("renders Active filter button", () => {
      const { getByText } = render(() => <TaskFilters />);
      expect(getByText("Active")).toBeInTheDocument();
    });

    it("renders Completed filter button", () => {
      const { getByText } = render(() => <TaskFilters />);
      expect(getByText("Completed")).toBeInTheDocument();
    });

    it("renders three filter buttons total", () => {
      const { getAllByRole } = render(() => <TaskFilters />);
      const buttons = getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("active filter is highlighted", () => {
    it("highlights All filter by default", () => {
      const { getByText } = render(() => <TaskFilters />);
      const allButton = getByText("All");
      expect(allButton).toHaveClass("task-filters__btn--active");
    });

    it("highlights Active filter when selected", async () => {
      const { getByText } = render(() => <TaskFilters />);
      const activeButton = getByText("Active");
      await fireEvent.click(activeButton);
      expect(activeButton).toHaveClass("task-filters__btn--active");
      expect(getByText("All")).not.toHaveClass("task-filters__btn--active");
    });

    it("highlights Completed filter when selected", async () => {
      const { getByText } = render(() => <TaskFilters />);
      const completedButton = getByText("Completed");
      await fireEvent.click(completedButton);
      expect(completedButton).toHaveClass("task-filters__btn--active");
      expect(getByText("All")).not.toHaveClass("task-filters__btn--active");
    });
  });

  describe("clicking filter changes active filter", () => {
    it("changes filter to active when Active button is clicked", async () => {
      const { getByText } = render(() => <TaskFilters />);
      const activeButton = getByText("Active");
      await fireEvent.click(activeButton);
      expect(taskStore.currentFilter).toBe("active");
    });

    it("changes filter to completed when Completed button is clicked", async () => {
      const { getByText } = render(() => <TaskFilters />);
      const completedButton = getByText("Completed");
      await fireEvent.click(completedButton);
      expect(taskStore.currentFilter).toBe("completed");
    });

    it("changes filter to all when All button is clicked", async () => {
      taskActions.setFilter("active");
      const { getByText } = render(() => <TaskFilters />);
      const allButton = getByText("All");
      await fireEvent.click(allButton);
      expect(taskStore.currentFilter).toBe("all");
    });
  });
});
