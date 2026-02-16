import { Show, Portal } from "solid-js/web";
import { uiStore, uiActions } from "@/stores/uiStore";
import { taskStore } from "@/stores/taskStore";
import { gamificationState } from "@/stores/gamificationStore";
import { getMotivationalMessage } from "@/services/dailySummary";

export default function DailySummary() {
  const getStats = () => {
    const today = new Date().toDateString();
    const tasks = taskStore.tasks;
    const todayTasks = tasks.filter(
      (task) => new Date(task.createdAt).toDateString() === today
    );

    const completed = todayTasks.filter((task) => task.completed).length;
    const added = todayTasks.length;
    const karma =
      gamificationState.dailyStats.completed +
      gamificationState.dailyStats.edited * 2;
    const score = added > 0 ? Math.round((completed / added) * 100) : 0;

    return { completed, added, karma, score };
  };

  const handleClose = () => {
    uiActions.hideDailySummary();
  };

  return (
    <Portal>
      <Show when={uiStore.dailySummaryOpen}>
        <div class="daily-summary-overlay" onClick={handleClose}>
          <div class="daily-summary" onClick={(e) => e.stopPropagation()}>
            <div class="daily-summary-header">
              <h2 class="daily-summary-title">Daily Summary</h2>
              <p class="daily-summary-subtitle">Your achievements for today</p>
            </div>

            <div class="daily-summary-stats">
              <div class="daily-summary-stat-row">
                <span class="daily-summary-stat-label">Tasks Completed</span>
                <span class="daily-summary-stat-value daily-summary-stat-value--highlight">
                  {getStats().completed}
                </span>
              </div>
              <div class="daily-summary-stat-row">
                <span class="daily-summary-stat-label">Tasks Added</span>
                <span class="daily-summary-stat-value">{getStats().added}</span>
              </div>
              <div class="daily-summary-stat-row">
                <span class="daily-summary-stat-label">Karma Earned</span>
                <span class="daily-summary-stat-value daily-summary-stat-value--highlight">
                  {getStats().karma}
                </span>
              </div>
              <div class="daily-summary-stat-row">
                <span class="daily-summary-stat-label">Productivity Score</span>
                <span class="daily-summary-stat-value">{getStats().score}%</span>
              </div>
            </div>

            <div class="daily-summary-message">
              <p>{getMotivationalMessage(getStats().score, getStats().completed)}</p>
            </div>

            <button class="daily-summary-close-btn" onClick={handleClose}>
              Close Summary
            </button>
          </div>
        </div>
      </Show>
    </Portal>
  );
}
