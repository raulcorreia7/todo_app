import { Show, For } from "solid-js";
import { gamificationState, hasAchievement } from "@/stores/gamificationStore";
import { getAllAchievements } from "@/utils/achievements";
import Icon from "@/components/base/Icon";
import Modal from "@/components/base/Modal";

interface AchievementsListProps {
  isOpen: boolean;
  onClose: () => void;
}

function AchievementsList(props: AchievementsListProps) {
  const achievements = getAllAchievements();

  const getUnlockDate = (id: string): string | undefined => {
    const unlocked = gamificationState.achievements.find((a) => a.id === id);
    return unlocked?.unlockedAt;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Achievements"
      size="md"
    >
      <div class="achievements-list">
        <For each={achievements}>
          {(achievement) => {
            const unlocked = () => hasAchievement(achievement.id);
            const unlockDate = () => getUnlockDate(achievement.id);

            return (
              <div
                classList={{
                  "achievement-card": true,
                  "achievement-card--locked": !unlocked(),
                  "achievement-card--unlocked": unlocked(),
                }}
              >
                <div class="achievement-card__icon">
                  <Show
                    when={unlocked()}
                    fallback={
                      <span class="achievement-card__icon-locked">?</span>
                    }
                  >
                    <Icon name={achievement.icon} size={28} />
                  </Show>
                </div>
                <div class="achievement-card__content">
                  <div class="achievement-card__title">{achievement.title}</div>
                  <div class="achievement-card__description">
                    {achievement.description}
                  </div>
                  <Show when={unlocked() && unlockDate()}>
                    {(date) => (
                      <div class="achievement-card__date">
                        Unlocked: {formatDate(date())}
                      </div>
                    )}
                  </Show>
                </div>
                <Show when={unlocked()}>
                  <div class="achievement-card__badge">
                    <Icon name="check" size={16} />
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </Modal>
  );
}

export default AchievementsList;
