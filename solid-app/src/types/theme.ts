export type ThemeTag = "dark" | "light" | "warm" | "cool";

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  glow: string;
  glowPrimary: string;
  glowSecondary: string;
  dangerGlow: string;
  dangerShadow: string;
  particleColor: string;
  particleCount: number;
  particleSize: number;
  shadow: string;
  glass: string;
  border: string;
  tags: ThemeTag[];
  animationDuration: string;
  animationEasing: string;
}

export type ThemeId = import("@/config/themes").ThemeId;
