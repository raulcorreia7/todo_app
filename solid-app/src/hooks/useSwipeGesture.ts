import { createSignal } from "solid-js";

interface SwipeGestureOptions {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  threshold?: number;
  showFeedback?: boolean;
}

interface SwipeGestureReturn {
  binders: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: () => void;
  };
  swipeOffset: () => number;
  isSwiping: () => boolean;
  swipeDirection: () => "left" | "right" | null;
  feedbackText: () => string;
}

export function useSwipeGesture(
  options: SwipeGestureOptions
): SwipeGestureReturn {
  const {
    onSwipeRight,
    onSwipeLeft,
    threshold = 80,
    showFeedback = true,
  } = options;

  const [swipeOffset, setSwipeOffset] = createSignal(0);
  const [isSwiping, setIsSwiping] = createSignal(false);
  const [swipeDirection, setSwipeDirection] = createSignal<
    "left" | "right" | null
  >(null);
  const [feedbackText, setFeedbackText] = createSignal("");

  let touchStartX = 0;
  let touchStartY = 0;
  let swiping = false;
  let currentElement: HTMLElement | null = null;
  let feedbackElement: HTMLDivElement | null = null;

  function createFeedbackElement(): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "swipe-feedback";
    el.style.cssText = `
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      padding: 8px 12px;
      background: var(--accent-color);
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 10;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
    `;
    return el;
  }

  function showSwipeFeedback(deltaX: number): void {
    if (!showFeedback || !currentElement) return;

    const percentage = Math.min(Math.abs(deltaX) / 100, 1);
    const direction = deltaX > 0 ? "right" : "left";

    if (!feedbackElement) {
      feedbackElement = createFeedbackElement();
      currentElement.style.position = "relative";
      currentElement.appendChild(feedbackElement);
    }

    if (direction === "right") {
      feedbackElement.style.right = "10px";
      feedbackElement.style.left = "auto";
      feedbackElement.style.background = "var(--accent-color)";
      setFeedbackText("Complete");
    } else {
      feedbackElement.style.left = "10px";
      feedbackElement.style.right = "auto";
      feedbackElement.style.background = "var(--danger-text)";
      setFeedbackText("Delete");
    }

    feedbackElement.textContent = feedbackText();
    feedbackElement.style.opacity = String(percentage);
  }

  function hideSwipeFeedback(): void {
    if (feedbackElement) {
      feedbackElement.remove();
      feedbackElement = null;
    }
    setFeedbackText("");
  }

  function showSwipeSuccess(message: string): void {
    const notification = document.createElement("div");
    notification.className = "swipe-success-toast";
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border: 1px solid var(--glass-border-color);
      border-radius: 15px;
      padding: 15px 25px;
      color: var(--color-text);
      font-weight: 600;
      z-index: 10000;
      animation: swipeSuccessIn 0.5s ease;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "swipeSuccessOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 1500);
  }

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;

    const target = e.target as HTMLElement;
    currentElement = target.closest
      ? (target.closest(".task-item") as HTMLElement)
      : null;

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    swiping = false;
    setSwipeOffset(0);
    setSwipeDirection(null);
  }

  function onTouchMove(e: TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const angle =
      (Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * 180) / Math.PI;

    if (angle < 45 && Math.abs(deltaX) > 20) {
      if (Math.abs(deltaX) > Math.abs(deltaY) * 2) {
        e.preventDefault();
        swiping = true;
        setIsSwiping(true);
        setSwipeOffset(deltaX);
        setSwipeDirection(deltaX > 0 ? "right" : "left");
        showSwipeFeedback(deltaX);
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
      resetSwipe();
    }
  }

  function onTouchEnd() {
    if (!swiping) {
      resetSwipe();
      return;
    }

    const offset = swipeOffset();
    const absOffset = Math.abs(offset);

    if (absOffset >= threshold) {
      if (offset > 0) {
        onSwipeRight?.();
        showSwipeSuccess("Task completed!");
      } else {
        onSwipeLeft?.();
      }
    }

    resetSwipe();
  }

  function resetSwipe() {
    swiping = false;
    setIsSwiping(false);
    setSwipeOffset(0);
    setSwipeDirection(null);
    hideSwipeFeedback();
    currentElement = null;
  }

  return {
    binders: { onTouchStart, onTouchMove, onTouchEnd },
    swipeOffset,
    isSwiping,
    swipeDirection,
    feedbackText,
  };
}
