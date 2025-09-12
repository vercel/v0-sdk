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

// Headless task section data
export interface TaskSectionData {
  title: string
  type?: string
  parts: any[]
  collapsed: boolean
  meaningfulParts: any[]
  shouldShowCollapsible: boolean
  iconName: IconProps['name']
}

// Headless task part data
export interface TaskPartData {
  type: string
  status?: string
  content: React.ReactNode
  isSearching?: boolean
  isAnalyzing?: boolean
  isComplete?: boolean
  query?: string
  count?: number
  answer?: string
  sources?: Array<{ url: string; title: string }>
  files?: string[]
  issues?: number
}

function getTypeIcon(type?: string, title?: string): IconProps['name'] {
  // Check title content for specific cases
  if (title?.includes('No issues found')) {
    return 'wrench'
  }
  if (title?.includes('Analyzed codebase')) {
    return 'search'
  }

  // Fallback to type-based icons
  switch (type) {
    case 'task-search-web-v1':
      return 'search'
    case 'task-search-repo-v1':
      return 'folder'
    case 'task-diagnostics-v1':
      return 'settings'
    case 'task-generate-design-inspiration-v1':
      return 'wrench'
    case 'task-read-file-v1':
      return 'folder'
    case 'task-coding-v1':
      return 'wrench'
    default:
      return 'wrench'
  }
}

function processTaskPart(part: any, index: number): TaskPartData {
  const baseData: TaskPartData = {
    type: part.type,
    status: part.status,
    content: null,
  }

  if (part.type === 'search-web') {
    if (part.status === 'searching') {
      return {
        ...baseData,
        isSearching: true,
        query: part.query,
        content: `Searching "${part.query}"`,
      }
    }
    if (part.status === 'analyzing') {
      return {
        ...baseData,
        isAnalyzing: true,
        count: part.count,
        content: `Analyzing ${part.count} results...`,
      }
    }
    if (part.status === 'complete' && part.answer) {
      return {
        ...baseData,
        isComplete: true,
        answer: part.answer,
        sources: part.sources,
        content: part.answer,
      }
    }
  }

  if (part.type === 'search-repo') {
    if (part.status === 'searching') {
      return {
        ...baseData,
        isSearching: true,
        query: part.query,
        content: `Searching "${part.query}"`,
      }
    }
    if (part.status === 'reading' && part.files) {
      return {
        ...baseData,
        files: part.files,
        content: 'Reading files',
      }
    }
  }

  if (part.type === 'diagnostics') {
    if (part.status === 'checking') {
      return {
        ...baseData,
        content: 'Checking for issues...',
      }
    }
    if (part.status === 'complete' && part.issues === 0) {
      return {
        ...baseData,
        isComplete: true,
        issues: part.issues,
        content: '✅ No issues found',
      }
    }
  }

  return {
    ...baseData,
    content: JSON.stringify(part),
  }
}

function renderTaskPartContent(
  partData: TaskPartData,
  index: number,
  iconRenderer?: React.ComponentType<IconProps>,
): React.ReactNode {
  if (
    partData.type === 'search-web' &&
    partData.isComplete &&
    partData.sources
  ) {
    return React.createElement(
      'div',
      { key: index },
      React.createElement('p', {}, partData.content),
      partData.sources.length > 0
        ? React.createElement(
            'div',
            {},
            partData.sources.map((source, sourceIndex) =>
              React.createElement(
                'a',
                {
                  key: sourceIndex,
                  href: source.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
                source.title,
              ),
            ),
          )
        : null,
    )
  }

  if (partData.type === 'search-repo' && partData.files) {
    return React.createElement(
      'div',
      { key: index },
      React.createElement('span', {}, partData.content),
      partData.files.map((file, fileIndex) =>
        React.createElement(
          'span',
          { key: fileIndex },
          iconRenderer
            ? React.createElement(iconRenderer, { name: 'file-text' })
            : React.createElement(Icon, { name: 'file-text' }),
          ' ',
          file,
        ),
      ),
    )
  }

  return React.createElement('div', { key: index }, partData.content)
}

// Headless hook for task section
export function useTaskSection({
  title,
  type,
  parts = [],
  collapsed: initialCollapsed = true,
  onCollapse,
}: Omit<
  TaskSectionProps,
  | 'className'
  | 'children'
  | 'iconRenderer'
  | 'taskIcon'
  | 'chevronRightIcon'
  | 'chevronDownIcon'
>): {
  data: TaskSectionData
  collapsed: boolean
  handleCollapse: () => void
  processedParts: TaskPartData[]
} {
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed)
  const collapsed = onCollapse ? initialCollapsed : internalCollapsed
  const handleCollapse =
    onCollapse || (() => setInternalCollapsed(!internalCollapsed))

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
    return false
  })

  const processedParts = parts.map(processTaskPart)

  return {
    data: {
      title: title || 'Task',
      type,
      parts,
      collapsed,
      meaningfulParts,
      shouldShowCollapsible: meaningfulParts.length > 1,
      iconName: getTypeIcon(type, title),
    },
    collapsed,
    handleCollapse,
    processedParts,
  }
}

/**
 * Generic task section component
 * Renders a collapsible task section with basic structure - consumers provide styling
 *
 * For headless usage, use the useTaskSection hook instead.
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
  const { data, collapsed, handleCollapse, processedParts } = useTaskSection({
    title,
    type,
    parts,
    collapsed: initialCollapsed,
    onCollapse,
  })

  // If children provided, use that (allows complete customization)
  if (children) {
    return React.createElement(React.Fragment, {}, children)
  }

  // If there's only one meaningful part, show just the content without the collapsible wrapper
  if (!data.shouldShowCollapsible && data.meaningfulParts.length === 1) {
    const partData = processTaskPart(data.meaningfulParts[0], 0)
    return React.createElement(
      'div',
      {
        className,
        'data-component': 'task-section-inline',
      },
      React.createElement(
        'div',
        { 'data-part': true },
        renderTaskPartContent(partData, 0, iconRenderer),
      ),
    )
  }

  // Uses React.createElement for maximum compatibility across environments
  return React.createElement(
    'div',
    {
      className,
      'data-component': 'task-section',
    },
    React.createElement(
      'button',
      {
        onClick: handleCollapse,
        'data-expanded': !collapsed,
        'data-button': true,
      },
      React.createElement(
        'div',
        { 'data-icon-container': true },
        React.createElement(
          'div',
          { 'data-task-icon': true },
          taskIcon ||
            (iconRenderer
              ? React.createElement(iconRenderer, { name: data.iconName })
              : React.createElement(Icon, { name: data.iconName })),
        ),
        collapsed
          ? chevronRightIcon ||
              (iconRenderer
                ? React.createElement(iconRenderer, { name: 'chevron-right' })
                : React.createElement(Icon, { name: 'chevron-right' }))
          : chevronDownIcon ||
              (iconRenderer
                ? React.createElement(iconRenderer, { name: 'chevron-down' })
                : React.createElement(Icon, { name: 'chevron-down' })),
      ),
      React.createElement('span', { 'data-title': true }, data.title),
    ),
    !collapsed
      ? React.createElement(
          'div',
          { 'data-content': true },
          React.createElement(
            'div',
            { 'data-parts-container': true },
            processedParts.map((partData, index) =>
              React.createElement(
                'div',
                { key: index, 'data-part': true },
                renderTaskPartContent(partData, index, iconRenderer),
              ),
            ),
          ),
        )
      : null,
  )
}
