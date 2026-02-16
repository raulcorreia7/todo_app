import { taskStore, taskActions } from "@/stores/taskStore";
import type { TaskFilter } from "@/types";

export default function TaskFilters() {
  const currentFilter = () => taskStore.currentFilter;

  const filters: { label: string; value: TaskFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <nav class="task-filters filter-group">
      {filters.map((filter) => (
        <button
          class={`task-filters__btn ${currentFilter() === filter.value ? "task-filters__btn--active" : ""}`}
          data-filter={filter.value}
          onClick={() => taskActions.setFilter(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </nav>
  );
}
