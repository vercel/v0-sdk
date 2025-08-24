import React, { useState } from 'react'
import { Icon, IconProps } from './icon'

export interface ThinkingSectionProps {
  title?: string
  duration?: number
  thought?: string
  collapsed?: boolean
  onCollapse?: () => void
  className?: string
  children?: React.ReactNode
  iconRenderer?: React.ComponentType<IconProps>
  brainIcon?: React.ReactNode
  chevronRightIcon?: React.ReactNode
  chevronDownIcon?: React.ReactNode
}

/**
 * Generic thinking section component
 * Renders a collapsible section with basic structure - consumers provide styling
 */
export function ThinkingSection({
  title,
  duration,
  thought,
  collapsed: initialCollapsed = true,
  onCollapse,
  className,
  children,
  iconRenderer,
  brainIcon,
  chevronRightIcon,
  chevronDownIcon,
}: ThinkingSectionProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed)
  const collapsed = onCollapse ? initialCollapsed : internalCollapsed
  const handleCollapse =
    onCollapse || (() => setInternalCollapsed(!internalCollapsed))

  // If children provided, use that (allows complete customization)
  if (children) {
    return <>{children}</>
  }

  return (
    <div className={className} data-component="thinking-section">
      <button onClick={handleCollapse} data-expanded={!collapsed} data-button>
        <div data-icon-container>
          {collapsed ? (
            <>
              {brainIcon ||
                (iconRenderer ? (
                  React.createElement(iconRenderer, { name: 'brain' })
                ) : (
                  <Icon name="brain" />
                ))}
              {chevronRightIcon ||
                (iconRenderer ? (
                  React.createElement(iconRenderer, { name: 'chevron-right' })
                ) : (
                  <Icon name="chevron-right" />
                ))}
            </>
          ) : (
            chevronDownIcon ||
            (iconRenderer ? (
              React.createElement(iconRenderer, { name: 'chevron-down' })
            ) : (
              <Icon name="chevron-down" />
            ))
          )}
        </div>
        <span data-title>
          {title || 'Thinking'}
          {duration && ` for ${Math.round(duration)}s`}
        </span>
      </button>
      {!collapsed && thought && (
        <div data-content>
          <div data-thought-container>
            {thought.split('\n\n').map((paragraph, index) => (
              <div key={index} data-paragraph>
                {paragraph}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
