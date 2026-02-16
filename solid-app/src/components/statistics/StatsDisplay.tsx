import { taskStore } from "@/stores/taskStore";
import { gamificationState } from "@/stores/gamificationStore";
import { uiActions } from "@/stores";

export default function StatsDisplay() {
  const counts = () => taskStore.taskCounts();
  const karma = () => gamificationState.karmaPoints;

  return (
    <div class="stats-display">
      <div class="stat-card stat-total">
        <div class="stat-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total</div>
          <div class="stat-value">{counts().total}</div>
        </div>
      </div>
      <div class="stat-card stat-completed">
        <div class="stat-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">Done</div>
          <div class="stat-value">{counts().completed}</div>
        </div>
      </div>
      <div
        class="stat-card stat-karma"
        onClick={() => uiActions.openAchievementsList()}
      >
        <div class="stat-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">Karma</div>
          <div class="stat-value">{karma()}</div>
        </div>
      </div>
    </div>
  );
}
