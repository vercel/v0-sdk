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

// Headless icon data
export interface IconData {
  name: IconProps['name']
  fallback: string
  ariaLabel: string
}

// Headless hook for icon data
export function useIcon(props: IconProps): IconData {
  return {
    name: props.name,
    fallback: getIconFallback(props.name),
    ariaLabel: props.name.replace('-', ' '),
  }
}

/**
 * Generic icon component that can be customized by consumers.
 * By default, renders a simple fallback. Consumers should provide
 * their own icon implementation via context or props.
 *
 * For headless usage, use the useIcon hook instead.
 */
export function Icon(props: IconProps) {
  const CustomIcon = useContext(IconContext)

  // Use custom icon implementation if provided via context
  if (CustomIcon) {
    return React.createElement(CustomIcon, props)
  }

  const iconData = useIcon(props)

  // Fallback implementation - consumers should override this
  // This uses minimal DOM-specific attributes for maximum compatibility
  return React.createElement(
    'span',
    {
      className: props.className,
      'data-icon': iconData.name,
      'aria-label': iconData.ariaLabel,
      // Note: suppressHydrationWarning removed for React Native compatibility
    },
    iconData.fallback,
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
  return React.createElement(
    IconContext.Provider,
    { value: component },
    children,
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
