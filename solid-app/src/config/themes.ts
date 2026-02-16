export const THEME_IDS = [
  "midnight",
  "ivory",
  "champagne",
  "graphite",
  "aurora",
  "emerald",
  "sakura",
  "arcticSky",
  "pearl",
  "mint",
  "coral",
  "frost",
  "lavender",
  "amethyst",
  "burgundy",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME_ID: ThemeId = "emerald";

export const THEMES = {
  midnight: {
    name: "Midnight",
    primary: "#1a1a2e",
    secondary: "#16213e",
    accent: "#0f3460",
    text: "#e94560",
    glow: "#e94560",
    glowPrimary: "#ff6b6b",
    glowSecondary: "#ffd93d",
    dangerGlow: "#e94560",
    dangerShadow: "rgba(233, 69, 96, 0.5)",
    particleColor: "#ffffff",
    particleCount: 60,
    particleSize: 4,
    shadow: "rgba(233, 69, 96, 0.3)",
    glass: "rgba(26, 26, 46, 0.8)",
    border: "rgba(233, 69, 96, 0.2)",
    tags: ["dark", "cool"],
    animationDuration: "2.5s",
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  ivory: {
    name: "Ivory",
    primary: "#f8f9fa",
    secondary: "#e9ecef",
    accent: "#dee2e6",
    text: "#495057",
    glow: "#6c757d",
    glowPrimary: "#ffd700",
    glowSecondary: "#ff8c00",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#8b4513",
    particleCount: 35,
    particleSize: 2,
    shadow: "rgba(108, 117, 125, 0.2)",
    glass: "rgba(248, 249, 250, 0.8)",
    border: "rgba(108, 117, 125, 0.1)",
    tags: ["light"],
    animationDuration: "2.0s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  champagne: {
    name: "Champagne",
    primary: "#fff8e7",
    secondary: "#f3e5ab",
    accent: "#daa520",
    text: "#8b4513",
    glow: "#daa520",
    glowPrimary: "#ffd700",
    glowSecondary: "#ff8c00",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#8b4513",
    particleCount: 40,
    particleSize: 3,
    shadow: "rgba(218, 165, 32, 0.3)",
    glass: "rgba(255, 248, 231, 0.8)",
    border: "rgba(218, 165, 32, 0.2)",
    tags: ["light", "warm"],
    animationDuration: "2.2s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  graphite: {
    name: "Graphite",
    primary: "#2c2c2c",
    secondary: "#404040",
    accent: "#666666",
    text: "#cccccc",
    glow: "#999999",
    glowPrimary: "#c0c0c0",
    glowSecondary: "#ffffff",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.5)",
    particleColor: "#ffffff",
    particleCount: 50,
    particleSize: 3,
    shadow: "rgba(153, 153, 153, 0.3)",
    glass: "rgba(44, 44, 44, 0.8)",
    border: "rgba(153, 153, 153, 0.2)",
    tags: ["dark"],
    animationDuration: "2.3s",
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  aurora: {
    name: "Aurora",
    primary: "#0a0a0a",
    secondary: "#1a1a2e",
    accent: "#16213e",
    text: "#00ff88",
    glow: "#00ff88",
    glowPrimary: "#00ff88",
    glowSecondary: "#ffffff",
    dangerGlow: "#ff4757",
    dangerShadow: "rgba(255, 71, 87, 0.5)",
    particleColor: "#00ff88",
    particleCount: 70,
    particleSize: 5,
    shadow: "rgba(0, 255, 136, 0.3)",
    glass: "rgba(10, 10, 10, 0.8)",
    border: "rgba(0, 255, 136, 0.2)",
    tags: ["dark", "cool"],
    animationDuration: "3.0s",
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  arcticSky: {
    name: "Arctic Sky",
    primary: "#e6f2ff",
    secondary: "#cce5ff",
    accent: "#4da6ff",
    text: "#2c5282",
    glow: "#4da6ff",
    glowPrimary: "#4da6ff",
    glowSecondary: "#ffffff",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#4da6ff",
    particleCount: 45,
    particleSize: 3,
    shadow: "rgba(77, 166, 255, 0.3)",
    glass: "rgba(230, 242, 255, 0.7)",
    border: "rgba(77, 166, 255, 0.2)",
    tags: ["light", "cool"],
    animationDuration: "2.4s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  emerald: {
    name: "Emerald",
    primary: "#0c4a3e",
    secondary: "#134e4a",
    accent: "#2ecc71",
    text: "#e8f8f5",
    glow: "#2ecc71",
    glowPrimary: "#2ecc71",
    glowSecondary: "#ffffff",
    dangerGlow: "#e74c3c",
    dangerShadow: "rgba(231, 76, 60, 0.5)",
    particleColor: "#2ecc71",
    particleCount: 55,
    particleSize: 4,
    shadow: "rgba(46, 204, 113, 0.3)",
    glass: "rgba(12, 74, 62, 0.8)",
    border: "rgba(46, 204, 113, 0.2)",
    tags: ["dark", "cool"],
    animationDuration: "2.6s",
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  sakura: {
    name: "Sakura",
    primary: "#fff5f5",
    secondary: "#ffe0e0",
    accent: "#ffb3ba",
    text: "#8b2635",
    glow: "#ff69b4",
    glowPrimary: "#ff69b4",
    glowSecondary: "#ffffff",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#ff69b4",
    particleCount: 40,
    particleSize: 3,
    shadow: "rgba(255, 105, 180, 0.3)",
    glass: "rgba(255, 245, 245, 0.8)",
    border: "rgba(255, 105, 180, 0.2)",
    tags: ["light", "warm"],
    animationDuration: "2.1s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  pearl: {
    name: "Pearl",
    primary: "#f8f8ff",
    secondary: "#e6e6fa",
    accent: "#d4af37",
    text: "#4b0082",
    glow: "#d4af37",
    glowPrimary: "#ffd700",
    glowSecondary: "#ffffff",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#4b0082",
    particleCount: 38,
    particleSize: 2,
    shadow: "rgba(212, 175, 55, 0.3)",
    glass: "rgba(248, 248, 255, 0.8)",
    border: "rgba(212, 175, 55, 0.2)",
    tags: ["light", "warm"],
    animationDuration: "2.0s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  mint: {
    name: "Mint",
    primary: "#f0fff0",
    secondary: "#e0ffe0",
    accent: "#2dd4bf",
    text: "#006400",
    glow: "#2dd4bf",
    glowPrimary: "#2dd4bf",
    glowSecondary: "#ffffff",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#2dd4bf",
    particleCount: 42,
    particleSize: 3,
    shadow: "rgba(45, 212, 191, 0.3)",
    glass: "rgba(240, 255, 240, 0.8)",
    border: "rgba(45, 212, 191, 0.2)",
    tags: ["light", "cool"],
    animationDuration: "2.2s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  coral: {
    name: "Coral",
    primary: "#fff0f5",
    secondary: "#ffe4e1",
    accent: "#ff7f50",
    text: "#8b0000",
    glow: "#ff7f50",
    glowPrimary: "#ff7f50",
    glowSecondary: "#ffd700",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#ff7f50",
    particleCount: 41,
    particleSize: 3,
    shadow: "rgba(255, 127, 80, 0.3)",
    glass: "rgba(255, 240, 245, 0.8)",
    border: "rgba(255, 127, 80, 0.2)",
    tags: ["light", "warm"],
    animationDuration: "2.1s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  frost: {
    name: "Frost",
    primary: "#f0f8ff",
    secondary: "#e6f2ff",
    accent: "#22d3ee",
    text: "#000080",
    glow: "#22d3ee",
    glowPrimary: "#22d3ee",
    glowSecondary: "#ffffff",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#22d3ee",
    particleCount: 44,
    particleSize: 3,
    shadow: "rgba(34, 211, 238, 0.3)",
    glass: "rgba(240, 248, 255, 0.8)",
    border: "rgba(34, 211, 238, 0.2)",
    tags: ["light", "cool"],
    animationDuration: "2.3s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  lavender: {
    name: "Lavender",
    primary: "#f5f3ff",
    secondary: "#e9d5ff",
    accent: "#a78bfa",
    text: "#4b0082",
    glow: "#a78bfa",
    glowPrimary: "#a78bfa",
    glowSecondary: "#ffffff",
    dangerGlow: "#dc3545",
    dangerShadow: "rgba(220, 53, 69, 0.4)",
    particleColor: "#a78bfa",
    particleCount: 43,
    particleSize: 3,
    shadow: "rgba(167, 139, 250, 0.3)",
    glass: "rgba(245, 243, 255, 0.8)",
    border: "rgba(167, 139, 250, 0.2)",
    tags: ["light", "cool"],
    animationDuration: "2.2s",
    animationEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  amethyst: {
    name: "Amethyst",
    primary: "#4b0082",
    secondary: "#483d8b",
    accent: "#9b59b6",
    text: "#dda0dd",
    glow: "#9b59b6",
    glowPrimary: "#9b59b6",
    glowSecondary: "#ffffff",
    dangerGlow: "#e74c3c",
    dangerShadow: "rgba(231, 76, 60, 0.5)",
    particleColor: "#9b59b6",
    particleCount: 58,
    particleSize: 4,
    shadow: "rgba(155, 89, 182, 0.3)",
    glass: "rgba(75, 0, 130, 0.8)",
    border: "rgba(155, 89, 182, 0.2)",
    tags: ["dark", "cool"],
    animationDuration: "2.7s",
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  burgundy: {
    name: "Burgundy",
    primary: "#800020",
    secondary: "#800000",
    accent: "#dc143c",
    text: "#f8f8ff",
    glow: "#dc143c",
    glowPrimary: "#dc143c",
    glowSecondary: "#ffd700",
    dangerGlow: "#dc143c",
    dangerShadow: "rgba(220, 20, 60, 0.5)",
    particleColor: "#ffffff",
    particleCount: 52,
    particleSize: 4,
    shadow: "rgba(220, 20, 60, 0.3)",
    glass: "rgba(128, 0, 32, 0.8)",
    border: "rgba(220, 20, 60, 0.2)",
    tags: ["dark", "warm"],
    animationDuration: "2.4s",
    animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type ThemeConfig = (typeof THEMES)[ThemeId];

const STAT_ICON_COLORS: Partial<Record<ThemeId, string>> = {
  midnight: "#e94560",
  ivory: "#495057",
  champagne: "#daa520",
  graphite: "#999999",
  aurora: "#00ff88",
  emerald: "#10b981",
  sakura: "#ff69b4",
  arcticSky: "#4da6ff",
};

export function getThemeTone(themeId: ThemeId): "light" | "dark" {
  const themeTags = THEMES[themeId].tags as readonly string[];
  return themeTags.includes("light") ? "light" : "dark";
}

export function getThemeStatIconColor(themeId: ThemeId): string {
  return STAT_ICON_COLORS[themeId] ?? THEMES[themeId].glow;
}

export function getThemeGlassBlur(themeId: ThemeId): string {
  if (themeId === "arcticSky") {
    return "15px";
  }

  return "blur(20px)";
}

export function getThemeAICanvasFilter(themeId: ThemeId): string {
  if (themeId === "arcticSky" || themeId === "aurora" || themeId === "midnight") {
    return `drop-shadow(0 0 10px ${THEMES[themeId].glowPrimary})`;
  }

  return "none";
}

export function getThemeAIGlowShadows(themeId: ThemeId): {
  before: string;
  after: string;
} {
  if (themeId === "arcticSky") {
    return {
      before: `0 0 30px ${THEMES[themeId].glowPrimary}`,
      after: `0 0 20px ${THEMES[themeId].glowSecondary}`,
    };
  }

  return {
    before: "none",
    after: "none",
  };
}

export function getColorBrightness(hexColor: string): number {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function getColorTemperature(hexColor: string): "warm" | "cool" {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const warmth = r * 0.7 - b * 0.3;
  return warmth > 0 ? "warm" : "cool";
}

export function getSortedThemeIds(): ThemeId[] {
  return [...THEME_IDS].sort((a, b) => {
    const themeA = THEMES[a];
    const themeB = THEMES[b];
    const isADark = getColorBrightness(themeA.primary) <= 128;
    const isBDark = getColorBrightness(themeB.primary) <= 128;
    if (isADark !== isBDark) {
      return isADark ? -1 : 1;
    }
    const tempA = getColorTemperature(themeA.accent);
    const tempB = getColorTemperature(themeB.accent);
    if (tempA !== tempB) {
      return tempA === "warm" ? -1 : 1;
    }
    return themeA.name.localeCompare(themeB.name);
  });
}
