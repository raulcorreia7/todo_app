import { createSignal } from "solid-js";
import type { TaskInput } from "@/types";
import { taskActions } from "@/stores/taskStore";
import { audioService } from "@/services/audio";

interface TaskFormProps {
  onSubmit?: (input: TaskInput) => void;
}

const TITLE_MAX = 100;
const DESC_MAX = 500;

export default function TaskForm(props?: TaskFormProps) {
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [confirmAnim, setConfirmAnim] = createSignal(false);

  function getCounterClass(current: number, max: number): string {
    const base = "task-form__char-counter";
    const ratio = current / max;
    if (ratio >= 1) return `${base} ${base}--error`;
    if (ratio >= 0.8) return `${base} ${base}--warning`;
    return base;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const titleValue = title().trim();
    if (!titleValue) return;

    const input: TaskInput = {
      title: titleValue,
      description: description().trim() || undefined,
    };

    setConfirmAnim(true);
    setTimeout(() => setConfirmAnim(false), 600);

    if (props?.onSubmit) {
      props.onSubmit(input);
    } else {
      taskActions.addTask(input);
    }

    audioService.play("add");
    setTitle("");
    setDescription("");
  }

  return (
    <form id="addTaskForm" class="task-form add-task-form" onSubmit={handleSubmit}>
      <div class="task-form__input-container input-container">
        <input
          type="text"
          class="task-form__title-input task-input"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          placeholder="Add a new task..."
          required
          maxlength={TITLE_MAX}
          autocomplete="off"
        />
        <button
          type="submit"
          class={`btn btn--primary task-form__add-btn add-task-btn ${confirmAnim() ? "task-form__add-btn--confirm" : ""}`}
          aria-label="Add task"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <div class="task-form__counter-row">
        <span class={getCounterClass(title().length, TITLE_MAX)}>
          {title().length}/{TITLE_MAX}
        </span>
      </div>
      <textarea
        class="task-form__textarea"
        value={description()}
        onInput={(e) => setDescription(e.currentTarget.value)}
        placeholder="Add description (optional)..."
        rows={3}
        maxlength={DESC_MAX}
      />
      <div class="task-form__counter-row">
        <span class={getCounterClass(description().length, DESC_MAX)}>
          {description().length}/{DESC_MAX}
        </span>
      </div>
    </form>
  );
}
