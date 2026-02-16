export type HapticPattern =
  | "subtle"
  | "add"
  | "complete"
  | "delete"
  | "victory";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  subtle: [15],
  add: [50],
  complete: [30, 50, 30],
  delete: [100],
  victory: [25, 40, 25, 40, 40],
};

export function vibrate(pattern: HapticPattern = "subtle"): void {
  try {
    if (!("vibrate" in navigator)) return;
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // no-op
  }
}
