import type { ThemeId } from "./theme";

export type FontId = "inter" | "playfair" | "sf";

export interface Settings {
  theme: ThemeId;
  darkMode: boolean;
  soundEnabled: boolean;
  volume: number;
  animations: boolean;
  font: FontId;
}
