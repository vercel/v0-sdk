import React, { createContext, useContext } from 'react'

// Context for providing custom icon implementation
const IconContext = createContext<React.ComponentType<IconProps> | null>(null)

export interface IconProps {
  name:
    | 'chevron-right'
    | 'chevron-down'
    | 'search'
    | 'folder'
    | 'settings'
    | 'file-text'
    | 'brain'
    | 'wrench'
  className?: string
}

/**
 * Generic icon component that can be customized by consumers.
 * By default, renders a simple fallback. Consumers should provide
 * their own icon implementation via context or props.
 */
export function Icon(props: IconProps) {
  const CustomIcon = useContext(IconContext)

  // Use custom icon implementation if provided via context
  if (CustomIcon) {
    return <CustomIcon {...props} />
  }

  // Fallback implementation - consumers should override this
  return (
    <span
      className={props.className}
      data-icon={props.name}
      suppressHydrationWarning
      aria-label={props.name.replace('-', ' ')}
    >
      {getIconFallback(props.name)}
    </span>
  )
}

/**
 * Provider for custom icon implementation
 */
export function IconProvider({
  children,
  component,
}: {
  children: React.ReactNode
  component: React.ComponentType<IconProps>
}) {
  return (
    <IconContext.Provider value={component}>{children}</IconContext.Provider>
  )
}

function getIconFallback(name: string): string {
  const iconMap: Record<string, string> = {
    'chevron-right': '▶',
    'chevron-down': '▼',
    search: '🔍',
    folder: '📁',
    settings: '⚙️',
    'file-text': '📄',
    brain: '🧠',
    wrench: '🔧',
  }
  return iconMap[name] || '•'
}
