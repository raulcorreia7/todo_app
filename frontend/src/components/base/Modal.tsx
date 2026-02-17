import type { JSX } from "solid-js";
import { createEffect, onCleanup, splitProps, Show } from "solid-js";
import { render } from "solid-js/web";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: JSX.Element;
  size?: ModalSize;
}

function ModalContent(props: ModalProps) {
  const [local] = splitProps(props, [
    "isOpen",
    "onClose",
    "title",
    "children",
    "size",
  ]);

  let modalRef: HTMLDivElement | undefined;

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      local.onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      local.onClose();
    }
  };

  createEffect(() => {
    if (local.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    });
  });

  createEffect(() => {
    if (local.isOpen && modalRef) {
      modalRef.focus();
    }
  });

  return (
    <Show when={local.isOpen}>
      <div
        class="modal-backdrop"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={local.title ? "modal-title" : undefined}
      >
        <div
          ref={modalRef}
          tabindex={-1}
          classList={{
            modal: true,
            "modal--sm": local.size === "sm",
            "modal--md": local.size === "md" || !local.size,
            "modal--lg": local.size === "lg",
          }}
        >
          <Show when={local.title}>
            <div class="modal-header">
              <h2 id="modal-title" class="modal-title">
                {local.title}
              </h2>
              <button
                class="modal-close"
                onClick={() => local.onClose()}
                aria-label="Close modal"
              >
                <svg
                  class="modal-close__icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </Show>
          <div class="modal-body">{local.children}</div>
        </div>
      </div>
    </Show>
  );
}

function Modal(props: ModalProps) {
  const [local] = splitProps(props, [
    "isOpen",
    "onClose",
    "title",
    "children",
    "size",
  ]);

  let container: HTMLDivElement | undefined;

  createEffect(() => {
    if (!container) {
      container = document.createElement("div");
      container.id = "modal-container";
      document.body.appendChild(container);
    }
  });

  createEffect(() => {
    if (container) {
      render(() => <ModalContent {...local} />, container);
    }
  });

  onCleanup(() => {
    if (container) {
      container.remove();
    }
  });

  return null;
}

export default Modal;
