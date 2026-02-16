import { createSignal, onMount, onCleanup } from "solid-js";
import { quoteService } from "@/services/quotes";

export default function Header() {
  const [quote, setQuote] = createSignal<string>(quoteService.getQuote());
  const [changing, setChanging] = createSignal(false);
  let rotationInterval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    setQuote(quoteService.getQuote());

    rotationInterval = setInterval(() => {
      if (!changing()) {
        setChanging(true);
        setTimeout(() => {
          setQuote(quoteService.rotateQuote());
          setChanging(false);
        }, 200);
      }
    }, 15000);
  });

  onCleanup(() => {
    if (rotationInterval) {
      clearInterval(rotationInterval);
    }
  });

  function handleClickQuote() {
    if (changing()) return;
    setChanging(true);
    setTimeout(() => {
      setQuote(quoteService.rotateQuote());
      setChanging(false);
    }, 200);
  }

  return (
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">Luxury Todo</h1>
        <p
          class={`daily-quote ${changing() ? "changing" : ""}`}
          onClick={handleClickQuote}
          title="Click to change quote"
        >
          "{quote()}"
        </p>
      </div>
    </header>
  );
}
