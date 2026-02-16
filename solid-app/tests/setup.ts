import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("lucide-solid", () => ({
  Settings: () => null,
  Music: () => null,
  Volume2: () => null,
  VolumeX: () => null,
  FlaskConical: () => null,
  Eraser: () => null,
  Trash2: () => null,
  Plus: () => null,
  X: () => null,
  Sparkles: () => null,
  Icon: () => null,
}));
