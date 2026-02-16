import { For } from "solid-js";
import { settingsStore, settingsActions } from "@/stores";
import { THEMES, getColorBrightness, getSortedThemeIds } from "@/config/themes";

const THEME_OPTION_BRIGHTNESS_THRESHOLD = 152;
const THEME_OPTION_LIGHT_TEXT = "#f8fafc";
const THEME_OPTION_DARK_TEXT = "#0f172a";
const THEME_OPTION_LIGHT_LABEL_BG = "rgba(15, 23, 42, 0.34)";
const THEME_OPTION_DARK_LABEL_BG = "rgba(255, 255, 255, 0.28)";
const THEME_OPTION_LIGHT_SHADOW = "0 1px 2px rgba(0, 0, 0, 0.48)";
const THEME_OPTION_DARK_SHADOW = "0 1px 2px rgba(255, 255, 255, 0.42)";

function getThemeLabelTone(themeId: keyof typeof THEMES): "light" | "dark" {
  const theme = THEMES[themeId];
  const weightedBrightness =
    getColorBrightness(theme.accent) * 0.7 +
    getColorBrightness(theme.primary) * 0.3;
  return weightedBrightness > THEME_OPTION_BRIGHTNESS_THRESHOLD
    ? "dark"
    : "light";
}

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
          const labelTone = () => getThemeLabelTone(themeId);

          return (
            <button
              class={`theme-option ${isActive() ? "theme-option--active" : ""}`}
              style={{
                background: `linear-gradient(135deg, ${theme().primary}, ${theme().accent})`,
                "--theme-option-text":
                  labelTone() === "light"
                    ? THEME_OPTION_LIGHT_TEXT
                    : THEME_OPTION_DARK_TEXT,
                "--theme-option-label-bg":
                  labelTone() === "light"
                    ? THEME_OPTION_LIGHT_LABEL_BG
                    : THEME_OPTION_DARK_LABEL_BG,
                "--theme-option-shadow":
                  labelTone() === "light"
                    ? THEME_OPTION_LIGHT_SHADOW
                    : THEME_OPTION_DARK_SHADOW,
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
