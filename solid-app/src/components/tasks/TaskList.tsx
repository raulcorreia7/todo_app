import { Show, For } from "solid-js";
import { taskStore } from "@/stores/taskStore";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const tasks = () => taskStore.filteredTasks();

  return (
    <main class="task-list-container">
      <div class="task-list">
        <Show
          when={tasks().length > 0}
          fallback={
            <div class="empty-state">
              <div class="empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4 2 2 0 0 0 16.24 4H7.76a2 2 0 0 0-1.79 1.11z" />
                </svg>
              </div>
              <h3>No tasks yet</h3>
              <p>Add your first task to get started</p>
            </div>
          }
        >
          <For each={tasks()}>{(task) => <TaskItem task={task} />}</For>
        </Show>
      </div>
    </main>
  );
}
