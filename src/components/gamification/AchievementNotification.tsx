import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import type { Achievement } from "@/types";
import Icon from "@/components/base/Icon";
import { spawnCelebration } from "@/utils/particles";

const [notification, setNotification] = createSignal<Achievement | null>(null);
const [isVisible, setIsVisible] = createSignal(false);
let dismissTimeout: number | undefined;

export function showAchievementNotification(achievement: Achievement) {
  if (dismissTimeout) {
    clearTimeout(dismissTimeout);
  }

  setNotification(achievement);
  setIsVisible(true);

  dismissTimeout = window.setTimeout(() => {
    setIsVisible(false);
    setTimeout(() => setNotification(null), 300);
  }, 3000);
}

function AchievementNotification() {
  let notificationRef: HTMLDivElement | undefined;

  onCleanup(() => {
    if (dismissTimeout) {
      clearTimeout(dismissTimeout);
    }
  });

  createEffect(() => {
    if (isVisible() && notificationRef) {
      setTimeout(() => {
        if (notificationRef) spawnCelebration(notificationRef);
      }, 50);
    }
  });

  const current = notification;

  return (
    <Show when={current()}>
      {(ach) => (
        <div
          ref={notificationRef}
          classList={{
            "achievement-notification": true,
            "achievement-notification--visible": isVisible(),
          }}
          role="alert"
          aria-live="polite"
        >
          <div class="achievement-notification__icon">
            <Icon name={ach().icon} size={24} />
          </div>
          <div class="achievement-notification__content">
            <div class="achievement-notification__title">{ach().title}</div>
            <div class="achievement-notification__description">
              {ach().description}
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}

export default AchievementNotification;
