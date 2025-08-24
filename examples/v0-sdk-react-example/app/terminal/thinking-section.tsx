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
    <div className="my-4" {...props}>
      <button
        onClick={onCollapse}
        className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors font-mono text-sm"
      >
        <span className="text-green-400">[PROC]</span>
        <span className="text-cyan-400">{collapsed ? '►' : '▼'}</span>
        <span>
          {title || 'THINKING_MODULE'}
          {duration && ` (${Math.round(duration * 1000)}ms)`}
        </span>
        <span className="text-green-400 animate-pulse">●</span>
      </button>

      {!collapsed && thought && (
        <div className="mt-3 ml-6 border-l-2 border-yellow-400 pl-4">
          <div className="bg-gray-900 border border-gray-700 rounded p-3">
            <div className="text-xs text-gray-400 mb-2 font-mono">
              [DEBUG] Neural network output:
            </div>
            <div className="text-green-200 text-sm leading-relaxed space-y-2 font-mono">
              {thought.split('\n\n').map((paragraph, index) => (
                <div key={index} className="flex">
                  <span className="text-gray-500 mr-2 select-none">
                    {String(index + 1).padStart(2, '0')}|
                  </span>
                  <span>{paragraph}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
