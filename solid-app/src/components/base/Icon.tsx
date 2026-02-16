import { splitProps } from 'solid-js'
import * as LucideIcons from 'lucide-solid'

interface IconProps {
  name: string
  size?: number
  class?: string
}

function Icon(props: IconProps) {
  const [local] = splitProps(props, ['name', 'size', 'class'])

  const iconName = () => local.name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as keyof typeof LucideIcons

  const LucideIcon = LucideIcons[iconName()] as typeof LucideIcons.Icon

  if (!LucideIcon) {
    console.warn(`Icon "${local.name}" not found in lucide-solid`)
    return null
  }

  return (
    <LucideIcon
      size={local.size ?? 24}
      class={local.class}
      iconNode={[]}
    />
  )
}

export default Icon
