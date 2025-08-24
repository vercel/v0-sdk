import React from 'react'
import { TaskSectionProps } from '@v0-sdk/react'
import {
  ChevronRight,
  ChevronDown,
  Search,
  Folder,
  Settings,
  Wrench,
} from 'lucide-react'

function renderTaskPart(part: any): React.ReactNode {
  if (!part || typeof part !== 'object') {
    return null
  }

  switch (part.type) {
    case 'starting-repo-search':
      return <div className="text-gray-400">Searching "{part.query}"</div>

    case 'select-files':
      return (
        <div className="space-y-2">
          <div className="text-gray-400">Reading files</div>
          <div className="flex flex-wrap gap-2">
            {part.filePaths?.map((path: string, idx: number) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded text-xs"
              >
                <Settings className="w-3 h-3 text-blue-400" />
                <span className="text-gray-300">{path.split('/').pop()}</span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'starting-web-search':
      return <div className="text-gray-400">Searching "{part.query}"</div>

    case 'got-results':
      return <div className="text-gray-400">Found {part.count} results</div>

    case 'finished-web-search':
      return (
        <div className="space-y-2">
          {part.answer && (
            <div className="text-gray-300 text-sm leading-relaxed">
              {part.answer}
            </div>
          )}
        </div>
      )

    case 'fetching-diagnostics':
      return null

    case 'diagnostics-passed':
      return (
        <div className="flex items-center gap-2 text-gray-400">
          <Wrench className="w-4 h-4" />
          <span>No issues found</span>
        </div>
      )

    case 'launch-tasks':
      return null

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
  const getTaskIcon = (type: string | undefined, title: string | undefined) => {
    const iconClass =
      'w-4 h-4 text-gray-400 group-hover:text-foreground transition-colors'
    if (title?.includes('No issues found'))
      return <Wrench className={iconClass} />
    if (title?.includes('Analyzed codebase'))
      return <Search className={iconClass} />
    switch (type) {
      case 'task-search-web-v1':
        return <Search className={iconClass} />
      case 'task-search-repo-v1':
        return <Folder className={iconClass} />
      case 'task-diagnostics-v1':
        return <Settings className={iconClass} />
      default:
        return <Wrench className={iconClass} />
    }
  }

  // Count meaningful parts (parts that actually render content)
  const meaningfulParts = parts.filter((part) => {
    const rendered = renderTaskPart(part)
    return rendered !== null
  })

  // If there's only one meaningful part, show just the content without heading or line
  if (meaningfulParts.length === 1) {
    return (
      <div className="mb-4" {...props}>
        <div className="text-gray-400 text-sm">
          {renderTaskPart(meaningfulParts[0])}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4" {...props}>
      <button
        onClick={onCollapse}
        className="w-full flex items-center gap-2 text-left group"
      >
        <div className="flex items-center gap-1">
          {collapsed ? (
            getTaskIcon(type, title)
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-foreground transition-colors" />
          )}
        </div>
        <span className="text-gray-400 hover:text-foreground text-sm transition-colors">
          {title || 'Task'}
        </span>
      </button>
      {!collapsed && (
        <div
          className="pl-4 border-l border-gray-600 pt-2"
          style={{ marginLeft: '7px' }}
        >
          <div className="text-gray-400 text-sm space-y-2">
            {parts.map((part, index) => (
              <div key={index}>{renderTaskPart(part)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
