import React from 'react'
import { ThinkingSectionProps } from '@v0-sdk/react'

export function ThinkingSection({
  title,
  duration,
  thought,
  collapsed,
  onCollapse,
  className,
  brainIcon,
  chevronRightIcon,
  chevronDownIcon,
  iconRenderer,
  children,
  ...props
}: ThinkingSectionProps) {
  return (
    <div className="my-6" {...props}>
      <button
        onClick={onCollapse}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <span className="mr-2">{collapsed ? '▶' : '▼'}</span>
        {title || 'Thinking'}
        {duration && ` (${Math.round(duration)}s)`}
      </button>
      {!collapsed && thought && (
        <div className="mt-3 pl-6 border-l border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
            {thought.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
