import { settingsStore, settingsActions } from "@/stores";
import { audioService } from "@/services/audio";
import { musicService } from "@/services/music";

export function SoundSettings() {
  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const volume = parseInt(target.value, 10);
    settingsActions.setVolume(volume);
    audioService.setVolume(volume);
  }

  function handleToggle(e: Event) {
    const target = e.target as HTMLInputElement;
    const enabled = target.checked;
    settingsActions.setSoundEnabled(enabled);
    audioService.setEnabled(enabled);
    musicService.setGlobalMute(!enabled);
  }

  return (
    <div class="sound-settings">
      <label class="sound-settings__toggle">
        <input
          type="checkbox"
          checked={settingsStore.soundEnabled}
          onChange={handleToggle}
        />
        <span class="sound-settings__toggle-label">Sound Enabled</span>
      </label>
      <div class="sound-settings__volume">
        <label class="sound-settings__volume-label">
          Volume: {settingsStore.volume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settingsStore.volume}
          onInput={handleVolumeChange}
          class="sound-settings__slider"
        />
      </div>
    </div>
  );
}
