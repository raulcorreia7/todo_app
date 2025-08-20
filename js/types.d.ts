// Global type stubs to improve editor IntelliSense in JS files

type TaskId = string | number;

interface Task {
  id: TaskId;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt?: number;
}

interface Settings {
  font: string; // 'inter' | 'playfair' | 'sf'
  soundEnabled: boolean;
  volume: number; // 0..1 or 0..100 depending on context
  theme: string; // theme id
}

interface AudioState {
  isMuted: boolean;
  volume: number; // 0..1
  isPlaying: boolean;
  currentTrackIndex?: number;
}

interface Theme {
  id: string;
  name: string;
  vars?: Record<string, string>;
}

// Minimal Bus Event typing
interface BusEventDetailMap {
  "app:ready": {};
  componentReady: { component: string };
  settingsChanged: { key?: string; value?: unknown; settings?: Settings };
  tasksUpdated: { source?: string };
  resetToDefaults: {};
  autoSaved: {};
  "centerbar:ready": {};
  "centerbar:music": {};
  "centerbar:test": {};
  "centerbar:clear": {};
  "centerbar:sound": {};
  "centerbar:delete": {};
  "music:started": {};
  "music:playing": {};
  "music:paused": {};
  "music:buffering": {};
  "music:silenceStart": {};
  "music:silenceEnd": {};
  "music:hintStart": {};
  "music:prev": {};
  "music:next": {};
  "music:toggle": {};
  "music:setVolume": { volume: number };
}

// Helper type to construct CustomEvent payloads
type BusEventName = keyof BusEventDetailMap;
type BusEventDetail<N extends BusEventName> = BusEventDetailMap[N];

