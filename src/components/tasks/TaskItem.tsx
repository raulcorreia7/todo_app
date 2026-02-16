import { createSignal, Show } from "solid-js";
import type { Task } from "@/types";
import { taskActions, taskStore } from "@/stores/taskStore";
import {
  recordTaskEdit,
  recordTaskDelete,
  recordTaskCompletion,
} from "@/stores/gamificationStore";
import { AIRefactorButton } from "@/components/ai";
import { showConfirmModal } from "@/components/base";
import type { RefactorResult } from "@/services/ai";
import { audioService } from "@/services/audio";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { spawnParticles, spawnCelebration } from "@/utils/particles";
import { vibrate } from "@/utils/haptics";

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 500;

interface TaskItemProps {
  task: Task;
}

function charCounterClass(current: number, max: number): string {
  const remaining = max - current;
  if (remaining <= 0) return "char-counter char-counter--error";
  if (remaining <= 10) return "char-counter char-counter--warning";
  return "char-counter";
}

export default function TaskItem(props: TaskItemProps) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editTitle, setEditTitle] = createSignal("");
  const [editDescription, setEditDescription] = createSignal("");

  const { binders, swipeOffset, isSwiping, swipeDirection } = useSwipeGesture({
    onSwipeRight: handleToggle,
    onSwipeLeft: handleDelete,
    threshold: 80,
  });

  function handleToggle(event?: Event) {
    const taskElement = (event?.target as HTMLElement)?.closest(
      ".task-item"
    ) as HTMLElement | null;
    const wasCompleted = props.task.completed;
    const previousCounts = taskStore.taskCounts();

    taskActions.toggleTask(props.task.id);

    if (!wasCompleted) {
      recordTaskCompletion();
      audioService.play("complete");
      vibrate("complete");

      if (taskElement) {
        spawnParticles(taskElement);
        document.dispatchEvent(
          new CustomEvent("taskCompleted", {
            detail: { taskElement, taskId: props.task.id },
          })
        );
      }

      const updatedCounts = taskStore.taskCounts();
      const reachedVictory =
        updatedCounts.total > 0 &&
        updatedCounts.completed === updatedCounts.total &&
        previousCounts.completed !== previousCounts.total;

      if (reachedVictory) {
        audioService.play("victory");
        vibrate("victory");
        if (taskElement) {
          spawnCelebration(taskElement);
        }
        document.dispatchEvent(new CustomEvent("allTasksCompleted"));
      }
    }
  }

  function handleEdit() {
    setEditTitle(props.task.title);
    setEditDescription(props.task.description);
    setIsEditing(true);
  }

  function handleSave() {
    const title = editTitle().trim().slice(0, TITLE_MAX);
    if (title) {
      taskActions.updateTask(props.task.id, {
        title,
        description: editDescription().trim().slice(0, DESCRIPTION_MAX),
      });
      recordTaskEdit();
      vibrate("subtle");
    }
    setIsEditing(false);
  }

  function handleCancel() {
    vibrate("subtle");
    setIsEditing(false);
  }

  async function handleDelete() {
    const confirmed = await showConfirmModal({
      title: "Delete Task",
      message: `Are you sure you want to delete "${props.task.title}"? This cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmStyle: "danger",
    });
    if (confirmed) {
      taskActions.deleteTask(props.task.id);
      recordTaskDelete();
      audioService.play("delete");
      vibrate("delete");
    }
  }

  function handleAIRefactor(result: RefactorResult) {
    taskActions.updateTask(props.task.id, {
      title: result.title,
      description: result.description,
    });
    recordTaskEdit();
  }

  return (
    <Show
      when={!isEditing()}
      fallback={
        <div class="task-item task-item--editing">
          <div class="task-form__field">
            <input
              type="text"
              class="task-title-input"
              value={editTitle()}
              onInput={(e) => setEditTitle(e.currentTarget.value)}
              placeholder="Task title"
              maxlength={TITLE_MAX}
            />
            <span class={charCounterClass(editTitle().length, TITLE_MAX)}>
              {editTitle().length}/{TITLE_MAX}
            </span>
          </div>
          <div class="task-form__field">
            <textarea
              class="task-description-input"
              value={editDescription()}
              onInput={(e) => setEditDescription(e.currentTarget.value)}
              placeholder="Task description"
              maxlength={DESCRIPTION_MAX}
            />
            <span
              class={charCounterClass(
                editDescription().length,
                DESCRIPTION_MAX
              )}
            >
              {editDescription().length}/{DESCRIPTION_MAX}
            </span>
          </div>
          <div class="task-edit-actions">
            <button class="task-edit-save-btn" onClick={handleSave}>
              Save
            </button>
            <button class="task-edit-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      }
    >
      <div
        class={`task-item ${taskStore.isTaskNew(props.task.id) ? "new" : ""} ${taskStore.isTaskJustCompleted(props.task.id) ? "completing" : ""} ${props.task.completed ? "task-item--completed" : ""} ${isSwiping() ? "task-item--swiping" : ""} ${swipeDirection() === "right" ? "task-item--swipe-right" : ""} ${swipeDirection() === "left" ? "task-item--swipe-left" : ""}`}
        data-task-id={props.task.id}
        onTouchStart={binders.onTouchStart}
        onTouchMove={binders.onTouchMove}
        onTouchEnd={binders.onTouchEnd}
        style={
          isSwiping()
            ? { transform: `translateX(${swipeOffset() * 0.3}px)` }
            : undefined
        }
      >
        <label class="task-checkbox luxury-checkbox">
          <input
            type="checkbox"
            checked={props.task.completed}
            onChange={handleToggle}
          />
          <span class="checkmark"></span>
        </label>
        <div class="task-text-content">
          <h3 class="task-title">{props.task.title}</h3>
          <Show when={props.task.description}>
            <p class="task-description">{props.task.description}</p>
          </Show>
        </div>
        <div class="task-actions">
          <button class="task-edit-btn" onClick={handleEdit} title="Edit task">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <AIRefactorButton task={props.task} onRefactor={handleAIRefactor} />
          <button
            class="task-delete-btn"
            onClick={handleDelete}
            title="Delete task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </Show>
  );
}
