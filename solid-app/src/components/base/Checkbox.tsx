import { splitProps } from 'solid-js'

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  'aria-label'?: string
  class?: string
}

function Checkbox(props: CheckboxProps) {
  const [local] = splitProps(props, ['checked', 'onChange', 'disabled', 'id', 'aria-label', 'class'])

  const handleClick = () => {
    if (!local.disabled) {
      local.onChange?.(!local.checked)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !local.disabled) {
      e.preventDefault()
      local.onChange?.(!local.checked)
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={local.checked}
      aria-label={local['aria-label']}
      id={local.id}
      tabindex={local.disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      classList={{
        [local.class ?? '']: !!local.class,
        'checkbox': true,
        'checkbox--checked': local.checked,
        'checkbox--disabled': local.disabled,
      }}
    >
      <div class="checkbox__indicator">
        {local.checked && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </div>
  )
}

export default Checkbox
