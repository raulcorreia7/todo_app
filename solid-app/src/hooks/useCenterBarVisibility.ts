import { createSignal, onMount, onCleanup } from "solid-js";

interface CenterBarVisibilityOptions {
  hideDelay?: number;
  scrollThreshold?: number;
}

export function useCenterBarVisibility(options: CenterBarVisibilityOptions = {}) {
  const { hideDelay = 2000, scrollThreshold = 80 } = options;

  const [isVisible, setIsVisible] = createSignal(true);
  const [isHidden, setIsHidden] = createSignal(false);

  let hideTimeout: number | null = null;
  let lastScrollY = 0;
  let ticking = false;

  function showBar() {
    setIsVisible(true);
    setIsHidden(false);
    resetHideTimer();
  }

  function hideBar() {
    setIsVisible(false);
    setIsHidden(true);
    clearHideTimer();
  }

  function resetHideTimer() {
    clearHideTimer();
    hideTimeout = window.setTimeout(() => {
      if (!isMouseOverBar()) {
        hideBar();
      }
    }, hideDelay);
  }

  function clearHideTimer() {
    if (hideTimeout) {
      window.clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function isMobile(): boolean {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function isMouseOverBar(): boolean {
    const bar = document.getElementById("centerActionBar");
    if (!bar) return false;
    return bar.matches(":hover");
  }

  function handleScroll() {
    if (isMobile()) {
      showBar();
      return;
    }

    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
      hideBar();
    } else {
      showBar();
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    if (isMobile()) {
      showBar();
      return;
    }
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }

  function onMouseMove() {
    if (isMobile()) return;
    showBar();
  }

  function onMouseLeave() {
    if (isMobile()) return;
    resetHideTimer();
  }

  function handleResize() {
    if (isMobile()) {
      showBar();
    }
  }

  onMount(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    const bar = document.getElementById("centerActionBar");
    if (bar) {
      bar.addEventListener("mouseenter", showBar);
      bar.addEventListener("mouseleave", onMouseLeave);
    }

    if (!isMobile()) {
      resetHideTimer();
    }
  });

  onCleanup(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("resize", handleResize);
    clearHideTimer();

    const bar = document.getElementById("centerActionBar");
    if (bar) {
      bar.removeEventListener("mouseenter", showBar);
      bar.removeEventListener("mouseleave", onMouseLeave);
    }
  });

  return {
    isVisible,
    isHidden,
    showBar,
    hideBar,
  };
}
