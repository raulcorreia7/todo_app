import { For } from "solid-js";
import { settingsStore, settingsActions } from "@/stores";
import type { FontId } from "@/types";

const fontOptions: { id: FontId; name: string }[] = [
  { id: "inter", name: "Inter" },
  { id: "playfair", name: "Playfair Display" },
  { id: "sf", name: "SF Pro Display" },
];

export function FontSelector() {
  function applyFont(font: FontId) {
    document.body.className = document.body.className.replace(/font-\w+/g, "");
    document.body.classList.add(`font-${font}`);
    settingsActions.setFont(font);
  }

  return (
    <div class="font-selector" role="radiogroup" aria-label="Select font">
      <For each={fontOptions}>
        {(font) => {
          const isActive = () => settingsStore.font === font.id;
          return (
            <button
              class={`font-selector__option ${isActive() ? "font-selector__option--active" : ""}`}
              onClick={() => applyFont(font.id)}
              role="radio"
              aria-checked={isActive()}
            >
              {font.name}
            </button>
          );
        }}
      </For>
    </div>
  );
}
