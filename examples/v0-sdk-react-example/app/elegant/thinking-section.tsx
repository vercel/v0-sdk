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
        className="w-full flex items-center gap-3 text-left p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              collapsed
                ? 'bg-purple-200 dark:bg-purple-700'
                : 'bg-purple-300 dark:bg-purple-600'
            }`}
          >
            <div
              className={`w-3 h-3 border-2 border-purple-600 dark:border-purple-200 rounded-full transition-transform duration-200 ${
                collapsed ? '' : 'rotate-45'
              }`}
            >
              <div className="w-1 h-1 bg-purple-600 dark:bg-purple-200 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium text-purple-700 dark:text-purple-300">
            {title || 'Thinking Process'}
          </div>
          {duration && (
            <div className="text-sm text-purple-500 dark:text-purple-400">
              Contemplated for {Math.round(duration)}s
            </div>
          )}
        </div>
      </button>

      {!collapsed && thought && (
        <div className="mt-4 ml-4 pl-8 border-l-2 border-purple-200 dark:border-purple-700">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm">
            <div className="text-gray-700 dark:text-gray-200 leading-relaxed space-y-4">
              {thought.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-sm">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
