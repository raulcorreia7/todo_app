import { statisticsState, completionRate } from '@/stores/statisticsStore'
import StatCard from './StatCard'

function formatFocusTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function StatsPanel() {
  const stats = () => statisticsState

  return (
    <div class="stats-panel">
      <StatCard
        label="Total Tasks"
        value={stats().totalTasks}
        icon="list-checks"
      />
      <StatCard
        label="Completed Tasks"
        value={stats().completedTasks}
        icon="check-circle"
      />
      <StatCard
        label="Completion Rate"
        value={`${completionRate()}%`}
        icon="percent"
      />
      <StatCard
        label="Current Streak"
        value={stats().currentStreak}
        icon="flame"
      />
      <StatCard
        label="Longest Streak"
        value={stats().longestStreak}
        icon="trophy"
      />
      <StatCard
        label="Total Focus Time"
        value={formatFocusTime(stats().totalFocusTime)}
        icon="clock"
      />
    </div>
  )
}

export default StatsPanel
