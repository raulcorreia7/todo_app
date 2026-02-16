import { For } from "solid-js";
import { settingsStore, settingsActions } from "@/stores";
import { THEMES, getColorBrightness, getSortedThemeIds } from "@/config/themes";

export function ThemeSelector() {
  const sortedThemes = getSortedThemeIds();

  return (
    <div class="theme-selector" role="listbox" aria-label="Select theme">
      <For each={sortedThemes}>
        {(themeId) => {
          const theme = () => THEMES[themeId];
          const isActive = () => settingsStore.theme === themeId;
          const tone = () =>
            getColorBrightness(theme().primary) <= 128 ? "dark" : "light";

          return (
            <button
              class={`theme-option ${isActive() ? "theme-option--active" : ""}`}
              style={{
                background: `linear-gradient(135deg, ${theme().primary}, ${theme().accent})`,
              }}
              onClick={() => settingsActions.setTheme(themeId)}
              role="option"
              aria-selected={isActive()}
              aria-label={`${theme().name} theme (${tone()})`}
              data-tone={tone()}
            >
              <span class="theme-option__name">{theme().name}</span>
            </button>
          );
        }}
      </For>
    </div>
  );
}
