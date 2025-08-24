import React from 'react'
import { TaskSectionProps } from '@v0-sdk/react'

function renderTaskPart(part: any): React.ReactNode {
  if (!part || typeof part !== 'object') {
    return null
  }

  switch (part.type) {
    case 'starting-repo-search':
      return (
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 animate-spin">⟳</span>
          <span>SCANNING: "{part.query}"</span>
        </div>
      )
    case 'select-files':
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">✓</span>
            <span>FILES_LOADED: {part.filePaths?.length || 0}</span>
          </div>
          <div className="ml-4 space-y-1">
            {part.filePaths?.map((path: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-cyan-400">→</span>
                <code className="bg-gray-900 text-green-300 px-2 py-1 rounded border border-gray-700">
                  {path.split('/').pop()}
                </code>
                <span className="text-gray-500">{path}</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'starting-web-search':
      return (
        <div className="flex items-center gap-2">
          <span className="text-blue-400 animate-pulse">◉</span>
          <span>WEB_QUERY: "{part.query}"</span>
        </div>
      )
    case 'got-results':
      return (
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span>RESULTS_FOUND: {part.count}</span>
        </div>
      )
    case 'finished-web-search':
      return part.answer ? (
        <div className="mt-2 bg-gray-900 border border-gray-700 rounded p-3">
          <div className="text-xs text-gray-400 mb-1 font-mono">
            [OUTPUT] Web search result:
          </div>
          <div className="text-green-200 text-sm">{part.answer}</div>
        </div>
      ) : null
    case 'diagnostics-passed':
      return (
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span>DIAGNOSTICS: ALL_CLEAR</span>
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
      <div className="my-3 ml-4 font-mono text-sm text-green-200" {...props}>
        {renderTaskPart(meaningfulParts[0])}
      </div>
    )
  }

  const getTaskTypeIcon = (type?: string) => {
    switch (type) {
      case 'task-search-web-v1':
        return '🌐'
      case 'task-search-repo-v1':
        return '📁'
      case 'task-diagnostics-v1':
        return '🔧'
      default:
        return '⚙️'
    }
  }

  return (
    <div className="my-4" {...props}>
      <button
        onClick={onCollapse}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm"
      >
        <span className="text-green-400">[TASK]</span>
        <span className="text-yellow-400">{collapsed ? '►' : '▼'}</span>
        <span>{getTaskTypeIcon(type)}</span>
        <span>{title || 'PROCESS_TASK'}</span>
        <span className="text-green-400 animate-pulse">●</span>
      </button>

      {!collapsed && (
        <div className="mt-3 ml-6 border-l-2 border-cyan-400 pl-4">
          <div className="space-y-3 font-mono text-sm text-green-200">
            {parts.map((part, index) => (
              <div key={index}>{renderTaskPart(part)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
