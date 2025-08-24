import React, { useState } from 'react'
import { cn } from '../utils/cn'
import { Icon } from './Icon'

interface ThinkingSectionProps {
  title?: string
  duration?: number
  thought?: string
  collapsed?: boolean
  className?: string
}

export function ThinkingSection({
  title,
  duration,
  thought,
  collapsed: initialCollapsed = true,
  className,
}: ThinkingSectionProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  return (
    <div className={cn('mb-2', className)}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full py-2 text-left flex items-center gap-2 group"
      >
        <div className="relative w-3 h-3 flex-shrink-0">
          {collapsed ? (
            <>
              <Icon
                name="brain"
                className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:opacity-0 transition-opacity"
              />
              <Icon
                name="chevron-right"
                className="w-3 h-3 text-gray-400 group-hover:text-white absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </>
          ) : (
            <Icon
              name="chevron-down"
              className="w-3 h-3 text-gray-400 group-hover:text-white"
            />
          )}
        </div>
        <span className="text-sm text-gray-400 group-hover:text-white">
          {title || 'Thinking'}
          {duration && ` for ${Math.round(duration)}s`}
        </span>
      </button>
      {!collapsed && thought && (
        <div className="ml-1 mt-1 animate-in fade-in duration-200">
          <div className="pl-3 border-l-2 border-gray-700 text-sm text-gray-400 space-y-3">
            {thought.split('\n\n').map((paragraph, index) => (
              <div
                key={index}
                className="ml-0.5 whitespace-pre-wrap leading-relaxed"
              >
                {paragraph}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
