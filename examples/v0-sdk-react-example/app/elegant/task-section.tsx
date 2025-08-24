import React from 'react'
import { TaskSectionProps } from '@v0-sdk/react'

function renderTaskPart(part: any): React.ReactNode {
  if (!part || typeof part !== 'object') {
    return null
  }

  switch (part.type) {
    case 'starting-repo-search':
      return (
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span>Searching for "{part.query}"</span>
        </div>
      )
    case 'select-files':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Found {part.filePaths?.length || 0} files</span>
          </div>
          <div className="ml-5 space-y-2">
            {part.filePaths?.map((path: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded bg-purple-400"></div>
                </div>
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  {path.split('/').pop()}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {path}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'starting-web-search':
      return (
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span>Searching web for "{part.query}"</span>
        </div>
      )
    case 'got-results':
      return (
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Discovered {part.count} results</span>
        </div>
      )
    case 'finished-web-search':
      return part.answer ? (
        <div className="mt-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4">
          <div className="text-sm text-cyan-600 dark:text-cyan-400 mb-2 font-medium">
            Search Result
          </div>
          <div className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
            {part.answer}
          </div>
        </div>
      ) : null
    case 'diagnostics-passed':
      return (
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>All diagnostics passed successfully</span>
        </div>
      )
    default:
      return null
  }
}

export function TaskSection({
  title,
  type,
  parts = [],
  collapsed,
  onCollapse,
  className,
  taskIcon,
  chevronRightIcon,
  chevronDownIcon,
  iconRenderer,
  children,
  ...props
}: TaskSectionProps) {
  // Count meaningful parts
  const meaningfulParts = parts.filter((part) => {
    const rendered = renderTaskPart(part)
    return rendered !== null
  })

  // If there's only one meaningful part, show just the content
  if (meaningfulParts.length === 1) {
    return (
      <div
        className="my-4 bg-white/30 dark:bg-gray-800/30 rounded-xl p-4"
        {...props}
      >
        <div className="text-gray-700 dark:text-gray-200 text-sm">
          {renderTaskPart(meaningfulParts[0])}
        </div>
      </div>
    )
  }

  const getTaskColor = (type?: string) => {
    switch (type) {
      case 'task-search-web-v1':
        return 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20'
      case 'task-search-repo-v1':
        return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
      case 'task-diagnostics-v1':
        return 'from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20'
      default:
        return 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    }
  }

  const getIconColor = (type?: string) => {
    switch (type) {
      case 'task-search-web-v1':
        return 'bg-cyan-200 dark:bg-cyan-700'
      case 'task-search-repo-v1':
        return 'bg-green-200 dark:bg-green-700'
      case 'task-diagnostics-v1':
        return 'bg-orange-200 dark:bg-orange-700'
      default:
        return 'bg-purple-200 dark:bg-purple-700'
    }
  }

  return (
    <div className="my-6" {...props}>
      <button
        onClick={onCollapse}
        className={`w-full flex items-center gap-3 text-left p-4 rounded-xl bg-gradient-to-r ${getTaskColor(type)} hover:shadow-md transition-all duration-200 shadow-sm`}
      >
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${getIconColor(type)}`}
          >
            <div
              className={`w-3 h-3 border-2 border-gray-600 dark:border-gray-200 rounded-full transition-transform duration-200 ${
                collapsed ? '' : 'rotate-45'
              }`}
            >
              <div className="w-1 h-1 bg-gray-600 dark:bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-700 dark:text-gray-200">
            {title || 'Task Process'}
          </div>
        </div>
      </button>

      {!collapsed && (
        <div className="mt-4 ml-4 pl-8 border-l-2 border-gray-200 dark:border-gray-700">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm">
            <div className="space-y-4 text-gray-700 dark:text-gray-200 text-sm">
              {parts.map((part, index) => (
                <div key={index}>{renderTaskPart(part)}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
