import { createStore } from "solid-js/store";
import type { Settings, FontId } from "@/types";
import type { ThemeId } from "@/types";
import {
  DEFAULT_THEME_ID,
  THEMES,
  getThemeAICanvasFilter,
  getThemeAIGlowShadows,
  getThemeGlassBlur,
  getThemeStatIconColor,
  getThemeTone,
} from "@/config/themes";
import { settingsStorage } from "@/services/storage";

const defaultSettings: Settings = {
  theme: DEFAULT_THEME_ID,
  darkMode: true,
  soundEnabled: true,
  volume: 50,
  animations: true,
  font: "inter",
};

function loadSettings(): Settings {
  const stored = settingsStorage.get();
  return stored ? { ...defaultSettings, ...stored } : defaultSettings;
}

function hexToRgba(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyTheme(theme: ThemeId): void {
  const selectedTheme = THEMES[theme];
  const root = document.documentElement;
  const tone = getThemeTone(theme);
  const aiGlowShadows = getThemeAIGlowShadows(theme);
  const dangerGlow = selectedTheme.dangerGlow;

  root.style.setProperty("--primary-color", selectedTheme.primary);
  root.style.setProperty("--secondary-color", selectedTheme.secondary);
  root.style.setProperty("--accent-color", selectedTheme.accent);
  root.style.setProperty("--glow-color", selectedTheme.glow);
  root.style.setProperty("--glow-primary", selectedTheme.glowPrimary);
  root.style.setProperty("--glow-secondary", selectedTheme.glowSecondary);
  root.style.setProperty("--shadow-color", selectedTheme.shadow);

  root.style.setProperty("--color-primary", selectedTheme.primary);
  root.style.setProperty("--color-secondary", selectedTheme.secondary);
  root.style.setProperty("--color-accent", selectedTheme.accent);
  root.style.setProperty("--color-text", selectedTheme.text);
  root.style.setProperty("--color-glow", selectedTheme.glow);
  root.style.setProperty("--color-shadow", selectedTheme.shadow);
  root.style.setProperty("--color-glass", selectedTheme.glass);
  root.style.setProperty("--color-border", selectedTheme.border);
  root.style.setProperty(
    "--color-border-soft",
    "color-mix(in oklab, var(--color-border) 50%, transparent)",
  );

  root.style.setProperty("--danger-glow-color", selectedTheme.dangerGlow);
  root.style.setProperty("--danger-glow-shadow", selectedTheme.dangerShadow);
  root.style.setProperty("--danger-text", dangerGlow);
  root.style.setProperty("--danger-shadow", selectedTheme.dangerShadow);
  root.style.setProperty("--danger-glass", hexToRgba(dangerGlow, 0.12));
  root.style.setProperty("--danger-glass-hover", hexToRgba(dangerGlow, 0.2));
  root.style.setProperty("--danger-glass-ghost", hexToRgba(dangerGlow, 0.08));
  root.style.setProperty("--danger-glass-ghost-hover", hexToRgba(dangerGlow, 0.15));
  root.style.setProperty("--danger-border", hexToRgba(dangerGlow, 0.3));
  root.style.setProperty("--danger-border-hover", hexToRgba(dangerGlow, 0.5));
  root.style.setProperty("--danger-border-ghost", hexToRgba(dangerGlow, 0.25));
  root.style.setProperty("--danger-border-ghost-hover", hexToRgba(dangerGlow, 0.4));
  root.style.setProperty("--danger-shadow-hover", hexToRgba(dangerGlow, 0.3));
  root.style.setProperty("--danger-shadow-ghost", hexToRgba(dangerGlow, 0.15));
  root.style.setProperty("--danger-shadow-ghost-hover", hexToRgba(dangerGlow, 0.25));
  root.style.setProperty("--danger-highlight", hexToRgba(dangerGlow, 0.4));

  root.style.setProperty("--stat-icon-color", getThemeStatIconColor(theme));
  root.style.setProperty("--glass-blur", getThemeGlassBlur(theme));

  root.style.setProperty("--ai-glow-before-start", selectedTheme.glowPrimary);
  root.style.setProperty("--ai-glow-before-mid", selectedTheme.glowSecondary);
  root.style.setProperty("--ai-glow-after-start", selectedTheme.glowSecondary);
  root.style.setProperty("--ai-glow-after-mid", selectedTheme.glowPrimary);
  root.style.setProperty("--ai-glow-before-shadow", aiGlowShadows.before);
  root.style.setProperty("--ai-glow-after-shadow", aiGlowShadows.after);
  root.style.setProperty("--ai-canvas-filter", getThemeAICanvasFilter(theme));

  root.style.setProperty("--particle-color", selectedTheme.particleColor);
  root.style.setProperty("--particle-count", String(selectedTheme.particleCount));
  root.style.setProperty("--particle-size", String(selectedTheme.particleSize));

  root.style.setProperty("--animation-duration", selectedTheme.animationDuration);
  root.style.setProperty("--animation-easing", selectedTheme.animationEasing);

  root.style.setProperty("--glass-bg", selectedTheme.glass);
  root.style.setProperty("--glass-border-color", selectedTheme.border);
  root.style.setProperty("--glass-border", `1px solid ${selectedTheme.border}`);

  root.setAttribute("data-theme-tone", tone);
  document.documentElement.setAttribute("data-theme", theme);
}

function applyFont(font: FontId): void {
  document.body.className = document.body.className.replace(/font-\w+/g, "");
  document.body.classList.add(`font-${font}`);
}

const [state, setState] = createStore<Settings>(loadSettings());

applyTheme(state.theme);
applyFont(state.font);

function persistSettings() {
  settingsStorage.set(state);
}

function setTheme(theme: ThemeId): void {
  setState("theme", theme);
  applyTheme(theme);
  persistSettings();
}

function setDarkMode(enabled: boolean): void {
  setState("darkMode", enabled);
  persistSettings();
}

function setSoundEnabled(enabled: boolean): void {
  setState("soundEnabled", enabled);
  persistSettings();
}

function setVolume(volume: number): void {
  setState("volume", volume);
  persistSettings();
}

function setAnimations(enabled: boolean): void {
  setState("animations", enabled);
  persistSettings();
}

function setFont(font: FontId): void {
  setState("font", font);
  persistSettings();
}

function resetToDefaults(): void {
  setState(defaultSettings);
  applyTheme(defaultSettings.theme);
  persistSettings();
}

export const settingsStore = {
  get theme() {
    return state.theme;
  },
  get darkMode() {
    return state.darkMode;
  },
  get soundEnabled() {
    return state.soundEnabled;
  },
  get volume() {
    return state.volume;
  },
  get animations() {
    return state.animations;
  },
  get font() {
    return state.font;
  },
};

export const settingsActions = {
  setTheme,
  setDarkMode,
  setSoundEnabled,
  setVolume,
  setAnimations,
  setFont,
  resetToDefaults,
};
