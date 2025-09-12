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
    case 'task-fetch-from-web-v1':
    case 'task-inspect-site-v1':
      return 'search'
    case 'task-search-repo-v1':
    case 'task-read-files-v1':
    case 'task-read-file-v1':
      return 'folder'
    case 'task-diagnostics-v1':
    case 'task-get-or-request-integration-v1':
    case 'task-stopped-v1':
      return 'settings'
    case 'task-manage-todos-v1':
      return 'file-text'
    case 'task-coding-v1':
    case 'task-run-shell-command-v1':
    case 'task-generate-design-inspiration-v1':
    case 'task-repaired-parser-content-v1':
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

  // Handle all the new task part types
  switch (part.type) {
    // Shell command parts
    case 'starting-shell-command':
      return { ...baseData, content: `Running: ${part.command}` }
    case 'command-output':
      return { ...baseData, content: part.output }
    case 'command-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Command completed (exit code: ${part.exitCode})` 
      }

    // File operation parts
    case 'starting-read-files':
      return { ...baseData, content: `Reading ${part.files.length} files...` }
    case 'reading-file':
      return { ...baseData, content: `Reading ${part.file} (${part.progress}/${part.total})` }
    case 'files-read-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Read ${part.filesRead} files (${part.totalLines} lines)` 
      }
    case 'starting-file-read':
      return { ...baseData, content: `Reading ${part.file}${part.searchPattern ? ` (searching: ${part.searchPattern})` : ''}` }
    case 'search-matches-found':
      return { 
        ...baseData, 
        content: `Found ${part.matches.length} matches: ${part.matches.map((m: any) => `Line ${m.line}: ${m.text}`).join(', ')}` 
      }
    case 'file-read-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Read ${part.file} (${part.matchCount} matches)` 
      }

    // Todo management parts
    case 'creating-todo-list':
      return { ...baseData, content: `Creating todo list: ${part.title}` }
    case 'adding-todo-item':
      return { ...baseData, content: `Added: ${part.item.text} (${part.item.status})` }
    case 'todo-list-updated':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Updated todo list: ${part.completedItems}/${part.totalItems} completed` 
      }

    // Coding parts
    case 'analyzing-requirements':
      return { ...baseData, content: `Analyzing: ${part.requirements.join(', ')}` }
    case 'generating-code':
      return { ...baseData, content: `Generating ${part.filename} (${Math.round(part.progress * 100)}%)` }
    case 'code-generation-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Generated ${part.filename} (${part.linesGenerated} lines)` 
      }
    case 'running-linter':
      return { ...baseData, content: `Running ${part.tool}...` }
    case 'linting-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Linting complete: ${part.issues} issues, ${part.warnings} warnings` 
      }

    // Web fetch parts
    case 'starting-web-fetch':
      return { ...baseData, content: `Fetching ${part.url}` }
    case 'web-fetch-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Fetched ${part.dataSize} bytes (${part.statusCode})` 
      }
    case 'response-parsed':
      return { 
        ...baseData, 
        content: `Parsed response: ${part.fields.join(', ')}` 
      }

    // Site inspection parts
    case 'starting-site-inspection':
      return { ...baseData, content: `Inspecting ${part.url}` }
    case 'page-loaded':
      return { ...baseData, content: `✅ Page loaded in ${part.loadTime}s` }
    case 'screenshot-captured':
      return { 
        ...baseData, 
        content: `📸 Screenshot captured: ${part.dimensions.width}x${part.dimensions.height}` 
      }
    case 'inspection-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Inspection complete: Accessibility ${part.accessibility.score}/100` 
      }

    // Design inspiration parts
    case 'analyzing-design-brief':
      return { ...baseData, content: `Analyzing: ${part.brief}` }
    case 'generating-color-palette':
      return { ...baseData, content: `Generated ${part.palettes.length} color palettes` }
    case 'design-inspiration-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Created ${part.totalVariations} design variations` 
      }

    // Integration parts
    case 'checking-existing-integrations':
      return { ...baseData, content: `Found integrations: ${part.integrations.join(', ')}` }
    case 'integration-authorized':
      return { ...baseData, content: `✅ ${part.service} authorized` }
    case 'environment-updated':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Updated ${part.variablesSet} environment variables` 
      }
    case 'integration-test-complete':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ ${part.service} test ${part.success ? 'passed' : 'failed'} (${part.responseTime}s)` 
      }

    // Task stopped parts
    case 'task-interruption':
      return { ...baseData, content: `⚠️ Task interrupted: ${part.reason} after ${part.timeElapsed}s` }
    case 'task-stopped':
      return { 
        ...baseData, 
        content: `🛑 Task stopped: ${part.reason}${part.partialResults ? ' (partial results available)' : ''}` 
      }

    // Parser repair parts
    case 'parser-error-detected':
      return { ...baseData, content: `❌ Parse error: ${part.error}` }
    case 'repair-successful':
      return { 
        ...baseData, 
        isComplete: true,
        content: `✅ Content repaired (confidence: ${Math.round(part.confidence * 100)}%)` 
      }

    // Existing task parts (keep existing logic)
    case 'starting-repo-search':
      return { ...baseData, content: `Searching: ${part.query}` }
    case 'select-files':
      return { ...baseData, content: `Selected ${part.filePaths.length} files` }
    case 'starting-web-search':
      return { ...baseData, content: `Searching: ${part.query}` }
    case 'got-results':
      return { ...baseData, content: `Found ${part.count} results` }
    case 'finished-web-search':
      return { 
        ...baseData, 
        isComplete: true,
        content: part.answer 
      }
    case 'diagnostics-passed':
      return { 
        ...baseData, 
        isComplete: true,
        content: '✅ No issues found' 
      }
    case 'fetching-diagnostics':
      return { ...baseData, content: 'Checking for issues...' }

    default:
      return {
        ...baseData,
        content: JSON.stringify(part),
      }
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
    
    // Existing task parts
    if (part.type === 'starting-repo-search' && part.query) return true
    if (part.type === 'select-files' && part.filePaths?.length > 0) return true
    if (part.type === 'starting-web-search' && part.query) return true
    if (part.type === 'got-results' && part.count) return true
    if (part.type === 'finished-web-search' && part.answer) return true
    if (part.type === 'diagnostics-passed') return true
    if (part.type === 'fetching-diagnostics') return true
    
    // New task parts - shell commands
    if (part.type === 'starting-shell-command') return true
    if (part.type === 'command-output') return true
    if (part.type === 'command-complete') return true
    
    // New task parts - file operations
    if (part.type === 'starting-read-files') return true
    if (part.type === 'reading-file') return true
    if (part.type === 'files-read-complete') return true
    if (part.type === 'starting-file-read') return true
    if (part.type === 'search-matches-found') return true
    if (part.type === 'file-read-complete') return true
    
    // New task parts - todo management
    if (part.type === 'creating-todo-list') return true
    if (part.type === 'adding-todo-item') return true
    if (part.type === 'todo-list-updated') return true
    
    // New task parts - coding
    if (part.type === 'analyzing-requirements') return true
    if (part.type === 'generating-code') return true
    if (part.type === 'code-generation-complete') return true
    if (part.type === 'running-linter') return true
    if (part.type === 'linting-complete') return true
    
    // New task parts - web fetching
    if (part.type === 'starting-web-fetch') return true
    if (part.type === 'web-fetch-complete') return true
    if (part.type === 'response-parsed') return true
    
    // New task parts - site inspection
    if (part.type === 'starting-site-inspection') return true
    if (part.type === 'page-loaded') return true
    if (part.type === 'screenshot-captured') return true
    if (part.type === 'inspection-complete') return true
    
    // New task parts - design inspiration
    if (part.type === 'analyzing-design-brief') return true
    if (part.type === 'generating-color-palette') return true
    if (part.type === 'design-inspiration-complete') return true
    
    // New task parts - integrations
    if (part.type === 'checking-existing-integrations') return true
    if (part.type === 'integration-authorized') return true
    if (part.type === 'environment-updated') return true
    if (part.type === 'integration-test-complete') return true
    
    // New task parts - task stopped
    if (part.type === 'task-interruption') return true
    if (part.type === 'task-stopped') return true
    
    // New task parts - parser repair
    if (part.type === 'parser-error-detected') return true
    if (part.type === 'repair-successful') return true
    
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
