export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilter = "all" | "active" | "completed";

export interface TaskInput {
  title: string;
  description?: string;
}
