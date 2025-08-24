import React from 'react'
import { TaskSectionProps } from '@v0-sdk/react'

function renderTaskPart(part: any): React.ReactNode {
  if (!part || typeof part !== 'object') {
    return null
  }

  switch (part.type) {
    case 'starting-repo-search':
      return <span>Searching "{part.query}"</span>
    case 'select-files':
      return (
        <div>
          <span>Reading files: </span>
          {part.filePaths?.map((path: string, idx: number) => (
            <code
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs mr-1"
            >
              {path.split('/').pop()}
            </code>
          ))}
        </div>
      )
    case 'starting-web-search':
      return <span>Searching "{part.query}"</span>
    case 'got-results':
      return <span>Found {part.count} results</span>
    case 'finished-web-search':
      return part.answer ? <p className="mt-2">{part.answer}</p> : null
    case 'diagnostics-passed':
      return <span>✓ No issues found</span>
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
      <div className="my-4 text-sm text-gray-600 dark:text-gray-400" {...props}>
        {renderTaskPart(meaningfulParts[0])}
      </div>
    )
  }

  return (
    <div className="my-6" {...props}>
      <button
        onClick={onCollapse}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <span className="mr-2">{collapsed ? '▶' : '▼'}</span>
        {title || 'Task'}
      </button>
      {!collapsed && (
        <div className="mt-3 pl-6 border-l border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            {parts.map((part, index) => (
              <div key={index}>{renderTaskPart(part)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
