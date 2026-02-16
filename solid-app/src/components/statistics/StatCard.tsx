import Icon from '@/components/base/Icon'

interface StatCardProps {
  label: string
  value: string | number
  icon: string
}

function StatCard(props: StatCardProps) {
  return (
    <div class="stat-card">
      <div class="stat-card__icon">
        <Icon name={props.icon} size={20} />
      </div>
      <div class="stat-card__content">
        <span class="stat-card__value">{props.value}</span>
        <span class="stat-card__label">{props.label}</span>
      </div>
    </div>
  )
}

export default StatCard
