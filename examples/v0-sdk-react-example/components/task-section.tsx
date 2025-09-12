import React, { useState } from 'react'
import { TaskSectionProps } from '@v0-sdk/react'
import {
  ChevronRight,
  ChevronDown,
  Search,
  Folder,
  Settings,
  Wrench,
  Camera,
  Globe,
  Sparkles,
  Menu,
  LayoutPanelTop,
  Database,
  Terminal,
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

    // New task part types
    case 'starting-shell-command':
      return (
        <div className="bg-black/90 rounded-md p-3 font-mono text-sm">
          <div className="text-green-400">$ {part.command}</div>
        </div>
      )
    
    case 'finished-shell-command':
      return (
        <div className="bg-black/90 rounded-md p-3 font-mono text-sm space-y-1">
          {part.stdout && (
            <div className="text-gray-300 whitespace-pre-wrap">{part.stdout}</div>
          )}
          {part.stderr && (
            <div className="text-red-400 whitespace-pre-wrap">{part.stderr}</div>
          )}
          <div className="text-gray-500">
            Process exited with code {part.exitCode || 0}
          </div>
        </div>
      )

    case 'starting-read-files':
      return <div className="text-gray-400">Reading {part.files.length} files...</div>
    
    case 'reading-file':
      return <div className="text-gray-400">Reading {part.file} ({part.progress}/{part.total})</div>
    
    case 'files-read-complete':
      return <div className="text-green-400">✅ Read {part.filesRead} files ({part.totalLines} lines)</div>

    case 'starting-file-read':
      return <div className="text-gray-400">Reading {part.file}{part.searchPattern ? ` (searching: ${part.searchPattern})` : ''}</div>
    
    case 'search-matches-found':
      return (
        <div className="space-y-1">
          <div className="text-gray-400">Found {part.matches.length} matches:</div>
          {part.matches.map((match: any, idx: number) => (
            <div key={idx} className="text-gray-300 text-xs font-mono bg-gray-800/50 p-1 rounded">
              Line {match.line}: {match.text}
            </div>
          ))}
        </div>
      )
    
    case 'file-read-complete':
      return <div className="text-green-400">✅ Read {part.file} ({part.matchCount} matches)</div>

    case 'creating-todo-list':
      return <div className="text-gray-400">Creating todo list: {part.title}</div>
    
    case 'adding-todo-item':
      return <div className="text-gray-400">Added: {part.item.text} ({part.item.status})</div>
    
    case 'todo-list-updated':
      return <div className="text-green-400">✅ Updated todo list: {part.completedItems}/{part.totalItems} completed</div>

    case 'analyzing-requirements':
      return <div className="text-gray-400">Analyzing: {part.requirements.join(', ')}</div>
    
    case 'generating-code':
      return <div className="text-gray-400">Generating {part.filename} ({Math.round(part.progress * 100)}%)</div>
    
    case 'code-generation-complete':
      return <div className="text-green-400">✅ Generated {part.filename} ({part.linesGenerated} lines)</div>
    
    case 'running-linter':
      return <div className="text-gray-400">Running {part.tool}...</div>
    
    case 'linting-complete':
      return <div className="text-green-400">✅ Linting complete: {part.issues} issues, {part.warnings} warnings</div>

    case 'starting-fetch-from-web':
      return <div className="text-gray-400">Visiting "{part.url.replace('https://', '').replace('http://', '')}"</div>
    
    case 'finished-fetch-from-web':
      return (
        <div className="flex items-center gap-2 text-gray-400">
          <span>Read</span>
          <span className="bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-300">
            {part.title || part.domain}
          </span>
        </div>
      )

    case 'starting-site-inspection':
      return <div className="text-gray-400">Inspecting {part.url}</div>
    
    case 'page-loaded':
      return <div className="text-green-400">✅ Page loaded in {part.loadTime}s</div>
    
    case 'screenshot-captured':
      return <div className="text-blue-400">📸 Screenshot captured: {part.dimensions.width}x{part.dimensions.height}</div>
    
    case 'inspection-complete':
      return <div className="text-green-400">✅ Inspection complete: Accessibility {part.accessibility.score}/100</div>

    case 'analyzing-design-brief':
      return <div className="text-gray-400">Analyzing: {part.brief}</div>
    
    case 'generating-color-palette':
      return <div className="text-gray-400">Generated {part.palettes.length} color palettes</div>
    
    case 'design-inspiration-complete':
      return <div className="text-green-400">✅ Created {part.totalVariations} design variations</div>

    case 'starting-integration-status-check':
      return <div className="text-gray-400">Checking integrations...</div>
    
    case 'finished-integration-status-check':
      return (
        <div className="space-y-2">
          {part.integrations.map((integration: any, idx: number) => (
            <div key={idx} className="text-gray-400">
              <span className="text-green-400">✅</span> Connected to{' '}
              <span className="bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-300">
                {integration.instanceName}
              </span>
              {integration.schema && (
                <span className="text-gray-500"> ({integration.schema.tableCount} tables)</span>
              )}
            </div>
          ))}
          {part.envVars.length > 0 && (
            <div className="text-gray-400">Found {part.envVars.length} environment variables</div>
          )}
        </div>
      )

    case 'agent-timeout':
      return (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 text-blue-400">
          <div className="font-medium mb-1">Agent Timeout</div>
          <div className="text-sm">The Agent timed out. Type a new prompt to continue.</div>
        </div>
      )
    
    case 'out-of-credits':
      return (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 text-yellow-400">
          <div className="font-medium mb-1">Out of Credits</div>
          <div className="text-sm">The Agent stopped because you are out of credits. Please add more credits to continue.</div>
        </div>
      )
    
    case 'orchestrator-invocations-exhausted':
    case 'subagent-invocations-exhausted':
      return (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 text-blue-400">
          <div className="font-medium mb-1">Output Stopped</div>
          <div className="text-sm">The maximum number of calls for the message has been reached ({part.invocations}).</div>
        </div>
      )
    
    case 'orchestrator-error':
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-red-400">
          <div className="font-medium mb-1">Task stopped</div>
          <div className="text-sm">The task was stopped because the agent encountered an unrecoverable error.</div>
        </div>
      )
    
    case 'manually-stopped-on-client':
      return null

    case 'parser-error-detected':
      return <div className="text-red-400">❌ Parse error: {part.error}</div>
    
    case 'repair-successful':
      return <div className="text-green-400">✅ Content repaired (confidence: {Math.round(part.confidence * 100)}%)</div>

    default:
      // For debugging - show unknown part types
      return <div className="text-yellow-400 text-xs">Unknown part: {part.type}</div>
  }
}

export function TaskSection({
  title,
  type,
  parts = [],
  collapsed: initialCollapsed,
  onCollapse,
  className,
  taskIcon,
  chevronRightIcon,
  chevronDownIcon,
  iconRenderer,
  children,
  ...props
}: TaskSectionProps) {
  // Add state management for collapse/expand
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed ?? true)
  const collapsed = onCollapse ? initialCollapsed : internalCollapsed
  const handleCollapse = onCollapse || (() => setInternalCollapsed(!internalCollapsed))
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
      case 'task-fetch-from-web-v1':
        return <Globe className={iconClass} />
      case 'task-inspect-site-v1':
        return <Camera className={iconClass} />
      case 'task-search-repo-v1':
      case 'task-read-files-v1':
      case 'task-read-file-v1':
        return <Folder className={iconClass} />
      case 'task-diagnostics-v1':
      case 'task-stopped-v1':
        return <Settings className={iconClass} />
      case 'task-get-or-request-integration-v1':
        return <Database className={iconClass} />
      case 'task-manage-todos-v1':
        return <Menu className={iconClass} />
      case 'task-generate-design-inspiration-v1':
        return <LayoutPanelTop className={iconClass} />
      case 'task-run-shell-command-v1':
        return <Terminal className={iconClass} />
      case 'task-coding-v1':
      case 'task-repaired-parser-content-v1':
      default:
        return <Wrench className={iconClass} />
    }
  }

  // Count meaningful parts (parts that actually render content)
  const meaningfulParts = parts.filter((part) => {
    const rendered = renderTaskPart(part)
    return rendered !== null
  })

  // Special cases: some tasks should always be inline (non-expandable)
  if (type === 'task-generate-design-inspiration-v1') {
    return (
      <div className="mb-4" {...props}>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <LayoutPanelTop className="w-4 h-4" />
          <span>{title || 'Generated design inspiration'}</span>
        </div>
      </div>
    )
  }

  if (type === 'task-manage-todos-v1') {
    return (
      <div className="mb-4" {...props}>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Menu className="w-4 h-4" />
          <span>{title || 'Updated todo list'}</span>
        </div>
      </div>
    )
  }

  // If there's only one meaningful part AND the original parts array is also small, 
  // show just the content without heading. But for complex tasks with multiple parts,
  // always show the collapsible interface even if only one part renders meaningfully.
  if (meaningfulParts.length === 1 && parts.length <= 2) {
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
        onClick={handleCollapse}
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
