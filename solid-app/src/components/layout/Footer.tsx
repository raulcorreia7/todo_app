import { createSignal, onMount } from "solid-js";

const APP_VERSION = "1.0.0-solid";

export default function Footer() {
  const [visible, setVisible] = createSignal(false);

  onMount(() => {
    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
      setVisible(scrolledToBottom);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
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
