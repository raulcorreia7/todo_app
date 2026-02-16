import { createSignal } from "solid-js";

const [settingsPanelOpen, setSettingsPanelOpen] = createSignal(false);
const [achievementsListOpen, setAchievementsListOpen] = createSignal(false);
const [musicPlayerOpen, setMusicPlayerOpen] = createSignal(false);
const [dailySummaryOpen, setDailySummaryOpen] = createSignal(false);

export const uiStore = {
  get settingsPanelOpen() {
    return settingsPanelOpen();
  },
  get achievementsListOpen() {
    return achievementsListOpen();
  },
  get musicPlayerOpen() {
    return musicPlayerOpen();
  },
  get dailySummaryOpen() {
    return dailySummaryOpen();
  },
};

export const uiActions = {
  openSettingsPanel: () => setSettingsPanelOpen(true),
  closeSettingsPanel: () => setSettingsPanelOpen(false),
  toggleSettingsPanel: () => setSettingsPanelOpen((prev) => !prev),
  openAchievementsList: () => setAchievementsListOpen(true),
  closeAchievementsList: () => setAchievementsListOpen(false),
  toggleAchievementsList: () => setAchievementsListOpen((prev) => !prev),
  openMusicPlayer: () => setMusicPlayerOpen(true),
  closeMusicPlayer: () => setMusicPlayerOpen(false),
  toggleMusicPlayer: () => setMusicPlayerOpen((prev) => !prev),
  showDailySummary: () => setDailySummaryOpen(true),
  hideDailySummary: () => setDailySummaryOpen(false),
};
