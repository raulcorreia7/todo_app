import { createSignal, Show } from "solid-js";
import type { Task } from "@/types";
import { isConfigured, refactorTask, type RefactorResult } from "@/services/ai";

interface AIRefactorButtonProps {
  task: Task;
  onRefactor: (result: RefactorResult) => void;
}

export default function AIRefactorButton(props: AIRefactorButtonProps) {
  const [isLoading, setIsLoading] = createSignal(false);

  async function handleClick() {
    if (isLoading()) return;

    setIsLoading(true);
    try {
      const result = await refactorTask(props.task);
      if (result) {
        props.onRefactor(result);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Show when={isConfigured()}>
      <button
        class="task-ai-btn"
        onClick={handleClick}
        disabled={isLoading()}
        title="AI Refactor"
      >
        <Show
          when={isLoading()}
          fallback={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8V4H8"/>
              <rect width="16" height="12" x="4" y="8" rx="2"/>
              <path d="M2 14h2"/>
              <path d="M20 14h2"/>
              <path d="M15 13v2"/>
              <path d="M9 13v2"/>
            </svg>
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </Show>
      </button>
    </Show>
  );
}
