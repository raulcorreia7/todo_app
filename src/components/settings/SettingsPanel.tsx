import { Show, onCleanup } from "solid-js";
import { ThemeSelector } from "./ThemeSelector";
import { FontSelector } from "./FontSelector";
import { SoundSettings } from "./SoundSettings";
import { showConfirmModal } from "@/components/base";
import {
  settingsActions,
  taskActions,
  resetStats as resetGamificationStats,
  resetAll as resetStatistics,
} from "@/stores";
import { clearAllStorage } from "@/services/storage";
import { resetAffirmations } from "@/utils/affirmations";

const RESET_ALL_RELOAD_DELAY_MS = 50;
const RESET_ALL_CONFIRM_MESSAGE =
  "This will erase all tasks, achievements, statistics, saved music settings, quotes, and app preferences. The page will reload.";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsPanel(props: SettingsPanelProps) {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && props.isOpen) {
      props.onClose();
    }
  }

  document.addEventListener("keydown", handleKeyDown);
  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  function handleResetDefaults() {
    settingsActions.resetToDefaults();
  }

  async function handleResetAllData() {
    const confirmed = await showConfirmModal({
      title: "Reset All Data",
      message: RESET_ALL_CONFIRM_MESSAGE,
      confirmText: "Reset All Data",
      cancelText: "Cancel",
      confirmStyle: "danger",
    });

    if (!confirmed) return;

    taskActions.clearAll();
    resetGamificationStats();
    resetStatistics();
    settingsActions.resetToDefaults();
    resetAffirmations();
    clearAllStorage();

    props.onClose();
    window.setTimeout(() => {
      window.location.reload();
    }, RESET_ALL_RELOAD_DELAY_MS);
  }

  return (
    <Show when={props.isOpen}>
      <div class="settings-backdrop" onClick={props.onClose} />
      <div class="settings-panel settings-panel--open">
        <div class="settings-panel__header">
          <h2 class="settings-panel__title">Settings</h2>
          <button
            class="settings-panel__close"
            onClick={props.onClose}
            aria-label="Close settings"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="settings-panel__body">
          <div class="settings-section">
            <h3 class="settings-section__title">Theme</h3>
            <ThemeSelector />
          </div>
          <div class="settings-section">
            <h3 class="settings-section__title">Font</h3>
            <FontSelector />
          </div>
          <div class="settings-section">
            <h3 class="settings-section__title">Sound</h3>
            <SoundSettings />
          </div>
          <div class="settings-section">
            <h3 class="settings-section__title">Utilities</h3>
            <div class="settings-section__actions">
              <button
                class="settings-section__reset-btn"
                onClick={handleResetDefaults}
              >
                Reset to Defaults
              </button>
              <button
                class="settings-section__reset-all-btn"
                onClick={handleResetAllData}
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}

export default SettingsPanel;
