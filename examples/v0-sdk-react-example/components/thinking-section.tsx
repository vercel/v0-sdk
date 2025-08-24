import React from 'react'
import { ThinkingSectionProps } from '@v0-sdk/react'
import { Brain, ChevronRight, ChevronDown } from 'lucide-react'

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
    <div className="mb-4" {...props}>
      <button
        onClick={onCollapse}
        className="w-full flex items-center gap-2 text-left group"
      >
        <div className="flex items-center gap-1">
          {collapsed ? (
            <Brain className="w-4 h-4 text-gray-400 group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-foreground transition-colors" />
          )}
        </div>
        <span className="text-gray-400 hover:text-foreground text-sm transition-colors">
          {title || 'Thought'}
          {duration && ` for ${Math.round(duration)}s`}
        </span>
      </button>
      {!collapsed && thought && (
        <div
          className="pl-4 border-l border-gray-600 pt-2"
          style={{ marginLeft: '7px' }}
        >
          <div className="text-gray-400 text-sm space-y-2">
            {thought.split('\n\n').map((paragraph, index) => (
              <div key={index}>{paragraph}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
