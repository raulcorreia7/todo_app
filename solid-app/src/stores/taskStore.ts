import { createStore, produce } from "solid-js/store";
import { createSignal } from "solid-js";
import type { Task, TaskFilter, TaskInput } from "@/types";
import { tasksStorage } from "@/services/storage";
import { recordTaskCreation } from "./gamificationStore";
import { updateFromTasks } from "./statisticsStore";

interface TaskState {
  tasks: Task[];
  currentFilter: TaskFilter;
}

const [newTaskIds, setNewTaskIds] = createSignal<Set<string>>(new Set());
const [completedTaskIds, setCompletedTaskIds] = createSignal<Set<string>>(
  new Set()
);

const initialState: TaskState = {
  tasks: tasksStorage.get(),
  currentFilter: "all",
};

const [state, setState] = createStore<TaskState>(initialState);

function persistTasks() {
  tasksStorage.set(state.tasks);
  updateFromTasks(state.tasks);
}

function addTask(input: TaskInput): void {
  const now = new Date().toISOString();
  const newTask: Task = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description ?? "",
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  setState("tasks", (tasks) => [...tasks, newTask]);
  setNewTaskIds((prev) => new Set(prev).add(newTask.id));
  setTimeout(() => {
    setNewTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(newTask.id);
      return next;
    });
  }, 700);
  persistTasks();
  recordTaskCreation();
}

function updateTask(
  id: string,
  updates: Partial<Omit<Task, "id" | "createdAt">>
): void {
  setState(
    "tasks",
    (task) => task.id === id,
    produce((task) => {
      Object.assign(task, updates, { updatedAt: new Date().toISOString() });
    })
  );
  persistTasks();
}

function deleteTask(id: string): void {
  setState("tasks", (tasks) => tasks.filter((task) => task.id !== id));
  persistTasks();
}

function toggleTask(id: string): void {
  const task = state.tasks.find((t) => t.id === id);
  const wasCompleted = task?.completed ?? false;
  setState(
    "tasks",
    (task) => task.id === id,
    produce((task) => {
      task.completed = !task.completed;
      task.updatedAt = new Date().toISOString();
    })
  );
  if (!wasCompleted) {
    setCompletedTaskIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setCompletedTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 600);
  }
  persistTasks();
}

function setFilter(filter: TaskFilter): void {
  setState("currentFilter", filter);
}

function clearCompleted(): void {
  setState("tasks", (tasks) => tasks.filter((task) => !task.completed));
  persistTasks();
}

function clearAll(): void {
  setState("tasks", []);
  persistTasks();
}

function filteredTasks(): Task[] {
  const filter = state.currentFilter;
  if (filter === "active") {
    return state.tasks.filter((task) => !task.completed);
  }
  if (filter === "completed") {
    return state.tasks.filter((task) => task.completed);
  }
  return state.tasks;
}

function taskCounts(): { total: number; active: number; completed: number } {
  const tasks = state.tasks;
  const completed = tasks.filter((task) => task.completed).length;
  return {
    total: tasks.length,
    active: tasks.length - completed,
    completed,
  };
}

function isTaskNew(id: string): boolean {
  return newTaskIds().has(id);
}

function isTaskJustCompleted(id: string): boolean {
  return completedTaskIds().has(id);
}

export const taskStore = {
  get tasks() {
    return state.tasks;
  },
  get currentFilter() {
    return state.currentFilter;
  },
  filteredTasks,
  taskCounts,
  isTaskNew,
  isTaskJustCompleted,
};

export const taskActions = {
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  setFilter,
  clearCompleted,
  clearAll,
};
