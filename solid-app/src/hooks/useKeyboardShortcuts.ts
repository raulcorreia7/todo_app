import { onMount, onCleanup } from "solid-js";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as HTMLElement;
  return (
    el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable
  );
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  function handleKeydown(e: KeyboardEvent) {
    const isEditable = isEditableElement(e.target);

    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : true;
      const metaMatch = shortcut.meta ? e.metaKey : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

      if (shortcut.ctrl || shortcut.meta) {
        if (!(e.ctrlKey || e.metaKey)) continue;
      }

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
        if (isEditable && shortcut.key.toLowerCase() === "a") {
          continue;
        }
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
}

export const SHORTCUT_EVENTS = {
  SAVE_EDIT: "keyboard-shortcut:save-edit",
  CANCEL_EDIT: "keyboard-shortcut:cancel-edit",
} as const;

export function dispatchSaveEdit(): void {
  document.dispatchEvent(new CustomEvent(SHORTCUT_EVENTS.SAVE_EDIT));
}

export function dispatchCancelEdit(): void {
  document.dispatchEvent(new CustomEvent(SHORTCUT_EVENTS.CANCEL_EDIT));
}
