(function (global) {
  // Event name constants
  const EVENTS = Object.freeze({
    APP_READY: "app:ready",
    COMPONENT_READY: "componentReady",
    SETTINGS_CHANGED: "settingsChanged",
    TASKS_UPDATED: "tasksUpdated",
    RESET_TO_DEFAULTS: "resetToDefaults",
    AUTO_SAVED: "autoSaved",
    CENTERBAR: Object.freeze({
      READY: "centerbar:ready",
      MUSIC: "centerbar:music",
      TEST: "centerbar:test",
      CLEAR: "centerbar:clear",
      SOUND: "centerbar:sound",
      DELETE: "centerbar:delete",
    }),
    MUSIC: Object.freeze({
      STARTED: "music:started",
      PLAYING: "music:playing",
      PAUSED: "music:paused",
      BUFFERING: "music:buffering",
      SILENCE_START: "music:silenceStart",
      SILENCE_END: "music:silenceEnd",
      HINT_START: "music:hintStart",
      PREV: "music:prev",
      NEXT: "music:next",
      TOGGLE: "music:toggle",
      SET_VOLUME: "music:setVolume",
    }),
  });

  // Storage/localStorage keys
  const KEYS = Object.freeze({
    SETTINGS: "luxury-todo-settings",
    LAST_SUMMARY: "luxury-todo-last-summary",
    QUOTE: "luxury-todo-quote",
    AFFIRMATIONS: "luxury-todo-affirmations",
    MUSIC: Object.freeze({
      VOLUME: "music.volume",
      MUTED: "music.muted",
      GAP_ENABLED: "music.gapEnabled",
      GAP_MIN: "music.gapMinSeconds",
      GAP_MAX: "music.gapMaxSeconds",
      LAST_TRACK_INDEX: "music.lastTrackIndex",
    }),
    GIT_COMMIT_COUNT: "gitCommitCount",
    AI_CONFIG: "ai_config",
  });

  global.App = global.App || {};
  global.App.EVENTS = EVENTS;
  global.App.KEYS = KEYS;
})(window);

