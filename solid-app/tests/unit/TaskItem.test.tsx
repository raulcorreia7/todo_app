import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";
import TaskItem from "@/components/tasks/TaskItem";
import type { Task } from "@/types";
import * as confirmModal from "@/components/base/ConfirmModal";

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

describe("TaskItem", () => {
  let taskActions: typeof import("@/stores/taskStore").taskActions;
  let taskStore: typeof import("@/stores/taskStore").taskStore;

  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: "test-id-1",
    title: "Test Task",
    description: "Test description",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(async () => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    const taskModule = await import("@/stores/taskStore");
    taskActions = taskModule.taskActions;
    taskStore = taskModule.taskStore;
    while (taskStore.tasks.length > 0) {
      taskActions.deleteTask(taskStore.tasks[0].id);
    }
    taskActions.setFilter("all");
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe("renders task title and description", () => {
    it("renders task title", () => {
      const task = createTask();
      const { getByText } = render(() => <TaskItem task={task} />);
      expect(getByText("Test Task")).toBeInTheDocument();
    });

    it("renders task description", () => {
      const task = createTask();
      const { getByText } = render(() => <TaskItem task={task} />);
      expect(getByText("Test description")).toBeInTheDocument();
    });

    it("renders without description when not provided", () => {
      const task = createTask({ description: "" });
      const { queryByText } = render(() => <TaskItem task={task} />);
      expect(queryByText("Test description")).not.toBeInTheDocument();
    });
  });

  describe("toggle checkbox changes completed state", () => {
    it("toggles task completion when checkbox is clicked", async () => {
      const task = createTask();
      taskActions.addTask({ title: task.title, description: task.description });
      const addedTask = taskStore.tasks[0];
      const { getByRole } = render(() => <TaskItem task={{ ...task, id: addedTask.id }} />);
      const checkbox = getByRole("checkbox");
      await fireEvent.click(checkbox);
      expect(taskStore.tasks[0].completed).toBe(true);
    });
  });

  describe("delete button removes task", () => {
    it("removes task when delete button is clicked and confirmed", async () => {
      vi.spyOn(confirmModal, "showConfirmModal").mockResolvedValue(true);
      const task = createTask();
      taskActions.addTask({ title: task.title, description: task.description });
      const addedTask = taskStore.tasks[0];
      const { container } = render(() => <TaskItem task={{ ...task, id: addedTask.id }} />);
      expect(taskStore.tasks).toHaveLength(1);
      const deleteButton = container.querySelector(".task-delete-btn");
      if (deleteButton) {
        await fireEvent.click(deleteButton);
      }
      expect(taskStore.tasks).toHaveLength(0);
    });

    it("does not remove task when delete is cancelled", async () => {
      vi.spyOn(confirmModal, "showConfirmModal").mockResolvedValue(false);
      const task = createTask();
      taskActions.addTask({ title: task.title, description: task.description });
      const addedTask = taskStore.tasks[0];
      const { container } = render(() => <TaskItem task={{ ...task, id: addedTask.id }} />);
      expect(taskStore.tasks).toHaveLength(1);
      const deleteButton = container.querySelector(".task-delete-btn");
      if (deleteButton) {
        await fireEvent.click(deleteButton);
      }
      expect(taskStore.tasks).toHaveLength(1);
    });
  });

  describe("edit mode shows form", () => {
    it("shows edit form when edit button is clicked", async () => {
      const task = createTask();
      const { container, getByPlaceholderText, getByText } = render(() => <TaskItem task={task} />);
      const editButton = container.querySelector(".task-edit-btn");
      if (editButton) {
        await fireEvent.click(editButton);
      }
      expect(getByPlaceholderText("Task title")).toBeInTheDocument();
      expect(getByPlaceholderText("Task description")).toBeInTheDocument();
      expect(getByText("Save")).toBeInTheDocument();
      expect(getByText("Cancel")).toBeInTheDocument();
    });

    it("hides task content when in edit mode", async () => {
      const task = createTask();
      const { container, queryByRole } = render(() => <TaskItem task={task} />);
      const editButton = container.querySelector(".task-edit-btn");
      if (editButton) {
        await fireEvent.click(editButton);
      }
      expect(queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("returns to view mode when cancel is clicked", async () => {
      const task = createTask();
      const { container, getByText, getByRole } = render(() => <TaskItem task={task} />);
      const editButton = container.querySelector(".task-edit-btn");
      if (editButton) {
        await fireEvent.click(editButton);
      }
      const cancelButton = getByText("Cancel");
      await fireEvent.click(cancelButton);
      expect(getByRole("checkbox")).toBeInTheDocument();
    });
  });

  describe("completing task triggers gamification", () => {
    it("calls recordTaskCompletion when task is completed", async () => {
      const gamificationModule = await import("@/stores/gamificationStore");
      const spy = vi.spyOn(gamificationModule, "recordTaskCompletion");
      const task = createTask();
      taskActions.addTask({ title: task.title, description: task.description });
      const addedTask = taskStore.tasks[0];
      const { getByRole } = render(() => <TaskItem task={{ ...task, id: addedTask.id }} />);
      const checkbox = getByRole("checkbox");
      await fireEvent.click(checkbox);
      expect(spy).toHaveBeenCalled();
    });

    it("does not call recordTaskCompletion when uncompleting task", async () => {
      const gamificationModule = await import("@/stores/gamificationStore");
      const spy = vi.spyOn(gamificationModule, "recordTaskCompletion");
      const task = createTask({ completed: true });
      taskActions.addTask({ title: task.title, description: task.description, completed: true });
      const addedTask = taskStore.tasks[0];
      const { getByRole } = render(() => <TaskItem task={{ ...task, id: addedTask.id }} />);
      const checkbox = getByRole("checkbox");
      await fireEvent.click(checkbox);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
