import { Show, createEffect, onCleanup } from "solid-js";
import {
  Settings,
  Music,
  Volume2,
  VolumeX,
  FlaskConical,
  Trash2,
} from "lucide-solid";
import { settingsStore, settingsActions } from "@/stores";
import { audioService } from "@/services/audio";
import { musicService } from "@/services/music";
import { BroomIcon } from "@/components/icons";
import { useCenterBarVisibility } from "@/hooks/useCenterBarVisibility";

export type CenterActionBarEvent =
  | "settings"
  | "music"
  | "sound"
  | "test"
  | "clear"
  | "delete";

export interface CenterActionBarProps {
  onAction?: (action: CenterActionBarEvent) => void;
  isMusicPlaying?: boolean;
  isMusicBuffering?: boolean;
  musicHintPulse?: number;
}

export default function CenterActionBar(props: CenterActionBarProps) {
  const { isHidden } = useCenterBarVisibility({
    hideDelay: 2000,
    scrollThreshold: 80,
  });

  createEffect(() => {
    const pulse = props.musicHintPulse ?? 0;
    if (pulse <= 0) return;

    const btn = document.getElementById("cabMusic");
    if (!btn) return;

    btn.classList.remove("hint");
    void btn.offsetWidth;
    btn.classList.add("hint");

    const timeoutId = window.setTimeout(() => {
      btn.classList.remove("hint");
    }, 3000);

    onCleanup(() => {
      window.clearTimeout(timeoutId);
    });
  });

  const handleSettings = () => {
    const btn = document.getElementById("cabSettings");
    if (btn) {
      btn.classList.remove("open-pulse");
      void btn.offsetWidth;
      btn.classList.add("open-pulse");
      setTimeout(() => btn.classList.remove("open-pulse"), 600);
    }
    props.onAction?.("settings");
  };

  const handleMusic = () => {
    const btn = document.getElementById("cabMusic");
    if (btn) {
      createZenBurst(btn);
    }
    props.onAction?.("music");
  };

  const handleSound = () => {
    const btn = document.getElementById("cabSound");
    if (btn) {
      btn.classList.remove("sound-enabled", "sound-disabled");
      void btn.offsetWidth;
      btn.classList.add(
        settingsStore.soundEnabled ? "sound-disabled" : "sound-enabled"
      );
      setTimeout(
        () => btn.classList.remove("sound-enabled", "sound-disabled"),
        600
      );
    }
    const newEnabled = !settingsStore.soundEnabled;
    settingsActions.setSoundEnabled(newEnabled);
    audioService.setEnabled(newEnabled);
    musicService.setGlobalMute(!newEnabled);
    props.onAction?.("sound");
  };

  const handleTest = () => {
    const btn = document.getElementById("cabTest");
    if (btn) {
      btn.classList.remove("sparkle-hit");
      void btn.offsetWidth;
      btn.classList.add("sparkle-hit");
      setTimeout(() => btn.classList.remove("sparkle-hit"), 600);
    }
    props.onAction?.("test");
  };

  const handleClear = () => {
    const btn = document.getElementById("cabClear");
    if (btn) {
      btn.classList.remove("micro-sweep");
      void btn.offsetWidth;
      btn.classList.add("micro-sweep");
      setTimeout(() => btn.classList.remove("micro-sweep"), 600);
    }
    props.onAction?.("clear");
  };

  const handleDelete = () => {
    const btn = document.getElementById("cabDelete");
    if (btn) {
      btn.classList.remove("danger-shake");
      void btn.offsetWidth;
      btn.classList.add("danger-shake");
      setTimeout(() => btn.classList.remove("danger-shake"), 500);
    }
    props.onAction?.("delete");
  };

  return (
    <div
      id="centerActionBar"
      class="center-action-bar floating-actions"
      classList={{ "is-hidden": isHidden() }}
      role="toolbar"
      aria-label="Main actions"
    >
      <div class="cab-group action-group">
        <div class="action-subgroup">
          <button
            id="cabSettings"
            class="btn btn--floating-action"
            aria-label="Settings"
            title="Settings"
            data-action="settings"
            onClick={handleSettings}
          >
            <Settings size={20} class="lucide-icon" />
          </button>

          <button
            id="cabMusic"
            class="btn btn--floating-action"
            classList={{
              "is-playing": props.isMusicPlaying,
              "is-paused": !props.isMusicPlaying,
              buffering: props.isMusicBuffering ?? false,
            }}
            aria-label="Music"
            title="Music"
            data-action="music"
            onClick={handleMusic}
          >
            <Music size={20} class="lucide-icon" />
          </button>

          <button
            id="cabSound"
            class="btn btn--floating-action"
            aria-label={
              settingsStore.soundEnabled ? "Mute sound" : "Enable sound"
            }
            title={settingsStore.soundEnabled ? "Mute sound" : "Enable sound"}
            data-action="sound"
            onClick={handleSound}
          >
            <Show
              when={settingsStore.soundEnabled}
              fallback={<VolumeX size={20} class="lucide-icon" />}
            >
              <Volume2 size={20} class="lucide-icon" />
            </Show>
          </button>
        </div>

        <div class="vertical-separator" aria-hidden="true" />

        <div class="action-subgroup">
          <button
            id="cabTest"
            class="btn btn--floating-action btn--test"
            aria-label="Run Tests"
            title="Run Tests"
            data-action="test"
            onClick={handleTest}
          >
            <FlaskConical size={20} class="lucide-icon" />
            <span class="particle-field" aria-hidden="true" />
          </button>

          <button
            id="cabClear"
            class="btn btn--floating-action btn--clear"
            aria-label="Clear Completed"
            title="Clear Completed"
            data-action="clear"
            onClick={handleClear}
          >
            <BroomIcon size={20} class="lucide-icon" />
          </button>

          <button
            id="cabDelete"
            class="btn btn--floating-action btn--delete"
            aria-label="Delete All"
            title="Delete All"
            data-action="delete"
            onClick={handleDelete}
          >
            <Trash2 size={20} class="lucide-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

function createZenBurst(btn: HTMLElement) {
  const prefersReduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReduced) return;

  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2 + window.scrollX;
  const cy = rect.top + rect.height / 2 + window.scrollY;

  const container = document.createElement("div");
  container.style.cssText =
    "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1000;";
  document.body.appendChild(container);

  const ring = document.createElement("div");
  const tint = "rgba(99,102,241,0.65)";
  ring.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:0;height:0;transform:translate(-50%,-50%);border-radius:9999px;box-shadow:0 0 0 0 ${tint};opacity:0.75;animation:cabZenRipple 650ms ease-out forwards;`;
  container.appendChild(ring);

  const palette = [
    "rgba(99,102,241,0.85)",
    "rgba(139,92,246,0.85)",
    "rgba(16,185,129,0.85)",
    "rgba(56,189,248,0.85)",
    "rgba(236,72,153,0.85)",
  ];

  for (let i = 0; i < 6; i++) {
    const p = document.createElement("div");
    const size = 3 + Math.random() * 3;
    p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:9999px;background:${palette[Math.floor(Math.random() * palette.length)]};box-shadow:0 0 12px rgba(255,255,255,0.20);transform:translate(-50%,-50%);`;
    container.appendChild(p);

    const dx = (Math.random() - 0.5) * 36;
    const dy = -(14 + Math.random() * 26);
    const dur = 550 + Math.random() * 250;
    p.style.transition = `transform ${dur}ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity ${dur}ms ease-out, filter ${dur}ms ease-out`;
    p.style.opacity = "0.95";

    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${0.85 + Math.random() * 0.25})`;
      p.style.opacity = "0";
      p.style.filter = "blur(0.2px)";
    });
  }

  setTimeout(() => container.remove(), 800);
}
