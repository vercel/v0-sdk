import React, { useState } from 'react'
import { Icon, IconProps } from './icon'

export interface TaskSectionProps {
  title?: string
  type?: string
  parts?: any[]
  collapsed?: boolean
  onCollapse?: () => void
  className?: string
  children?: React.ReactNode
  iconRenderer?: React.ComponentType<IconProps>
  taskIcon?: React.ReactNode
  chevronRightIcon?: React.ReactNode
  chevronDownIcon?: React.ReactNode
}

function getTypeIcon(
  type?: string,
  title?: string,
  iconRenderer?: React.ComponentType<IconProps>,
) {
  // Check title content for specific cases
  if (title?.includes('No issues found')) {
    return iconRenderer ? (
      React.createElement(iconRenderer, { name: 'wrench' })
    ) : (
      <Icon name="wrench" />
    )
  }
  if (title?.includes('Analyzed codebase')) {
    return iconRenderer ? (
      React.createElement(iconRenderer, { name: 'search' })
    ) : (
      <Icon name="search" />
    )
  }

  // Fallback to type-based icons
  switch (type) {
    case 'task-search-web-v1':
      return iconRenderer ? (
        React.createElement(iconRenderer, { name: 'search' })
      ) : (
        <Icon name="search" />
      )
    case 'task-search-repo-v1':
      return iconRenderer ? (
        React.createElement(iconRenderer, { name: 'folder' })
      ) : (
        <Icon name="folder" />
      )
    case 'task-diagnostics-v1':
      return iconRenderer ? (
        React.createElement(iconRenderer, { name: 'settings' })
      ) : (
        <Icon name="settings" />
      )
    default:
      return iconRenderer ? (
        React.createElement(iconRenderer, { name: 'wrench' })
      ) : (
        <Icon name="wrench" />
      )
  }
}

function renderTaskPart(
  part: any,
  index: number,
  iconRenderer?: React.ComponentType<IconProps>,
) {
  if (part.type === 'search-web') {
    if (part.status === 'searching') {
      return <div key={index}>{`Searching "${part.query}"`}</div>
    }
    if (part.status === 'analyzing') {
      return <div key={index}>{`Analyzing ${part.count} results...`}</div>
    }
    if (part.status === 'complete' && part.answer) {
      return (
        <div key={index}>
          <p>{part.answer}</p>
          {part.sources && part.sources.length > 0 && (
            <div>
              {part.sources.map((source: any, sourceIndex: number) => (
                <a
                  key={sourceIndex}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )
    }
  }

  if (part.type === 'search-repo') {
    if (part.status === 'searching') {
      return <div key={index}>{`Searching "${part.query}"`}</div>
    }
    if (part.status === 'reading' && part.files) {
      return (
        <div key={index}>
          <span>Reading files</span>
          {part.files.map((file: string, fileIndex: number) => (
            <span key={fileIndex}>
              {iconRenderer ? (
                React.createElement(iconRenderer, { name: 'file-text' })
              ) : (
                <Icon name="file-text" />
              )}{' '}
              {file}
            </span>
          ))}
        </div>
      )
    }
  }

  if (part.type === 'diagnostics') {
    if (part.status === 'checking') {
      return <div key={index}>Checking for issues...</div>
    }
    if (part.status === 'complete' && part.issues === 0) {
      return <div key={index}>✅ No issues found</div>
    }
  }

  return <div key={index}>{JSON.stringify(part)}</div>
}

/**
 * Generic task section component
 * Renders a collapsible task section with basic structure - consumers provide styling
 */
export function TaskSection({
  title,
  type,
  parts = [],
  collapsed: initialCollapsed = true,
  onCollapse,
  className,
  children,
  iconRenderer,
  taskIcon,
  chevronRightIcon,
  chevronDownIcon,
}: TaskSectionProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed)
  const collapsed = onCollapse ? initialCollapsed : internalCollapsed
  const handleCollapse =
    onCollapse || (() => setInternalCollapsed(!internalCollapsed))

  // If children provided, use that (allows complete customization)
  if (children) {
    return <>{children}</>
  }

  // Count meaningful parts (parts that would render something)
  const meaningfulParts = parts.filter((part) => {
    // Check if the part would render meaningful content
    if (part.type === 'search-web') {
      return (
        part.status === 'searching' ||
        part.status === 'analyzing' ||
        (part.status === 'complete' && part.answer)
      )
    }
    if (part.type === 'starting-repo-search' && part.query) return true
    if (part.type === 'select-files' && part.filePaths?.length > 0) return true
    if (part.type === 'starting-web-search' && part.query) return true
    if (part.type === 'got-results' && part.count) return true
    if (part.type === 'finished-web-search' && part.answer) return true
    if (part.type === 'diagnostics-passed') return true
    if (part.type === 'fetching-diagnostics') return true
    // Add more meaningful part types as needed
    return false
  })

  // If there's only one meaningful part, show just the content without the collapsible wrapper
  if (meaningfulParts.length === 1) {
    return (
      <div className={className} data-component="task-section-inline">
        <div data-part>
          {renderTaskPart(meaningfulParts[0], 0, iconRenderer)}
        </div>
      </div>
    )
  }

  return (
    <div className={className} data-component="task-section">
      <button onClick={handleCollapse} data-expanded={!collapsed} data-button>
        <div data-icon-container>
          <div data-task-icon>
            {taskIcon || getTypeIcon(type, title, iconRenderer)}
          </div>
          {collapsed
            ? chevronRightIcon ||
              (iconRenderer ? (
                React.createElement(iconRenderer, { name: 'chevron-right' })
              ) : (
                <Icon name="chevron-right" />
              ))
            : chevronDownIcon ||
              (iconRenderer ? (
                React.createElement(iconRenderer, { name: 'chevron-down' })
              ) : (
                <Icon name="chevron-down" />
              ))}
        </div>
        <span data-title>{title || 'Task'}</span>
      </button>
      {!collapsed && (
        <div data-content>
          <div data-parts-container>
            {parts.map((part, index) => (
              <div key={index} data-part>
                {renderTaskPart(part, index, iconRenderer)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
