import { createSignal, onCleanup, onMount } from "solid-js";

const APP_VERSION = "1.0.0-solid";

export default function Footer() {
  const [visible, setVisible] = createSignal(false);

  onMount(() => {
    const SHOW_DISTANCE = 220;
    const HIDE_DISTANCE = 280;
    let isVisible = false;
    let rafId: number | null = null;

    const updateVisibility = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const distanceFromBottom = document.body.scrollHeight - scrollBottom;

      if (!isVisible && distanceFromBottom <= SHOW_DISTANCE) {
        isVisible = true;
        setVisible(true);
        return;
      }

      if (isVisible && distanceFromBottom > HIDE_DISTANCE) {
        isVisible = false;
        setVisible(false);
      }
    };

    const handleScroll = () => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateVisibility();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    updateVisibility();

    onCleanup(() => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    });
  });

  return (
    <div
      classList={{
        "app-footer": true,
        visible: visible(),
        hidden: !visible(),
      }}
    >
      <p class="footer-text">
        Vibe Coded by Raúl Correia
        <span class="heart-emoji">❤️</span>
        <span class="app-version">{APP_VERSION}</span>
      </p>
    </div>
  );
}
