import React, { useState } from 'react'
import { cn } from '../utils/cn'
import { Icon } from './Icon'

interface TaskSectionProps {
  title?: string
  type?: string
  parts?: any[]
  collapsed?: boolean
  className?: string
}

function getTypeIcon(type?: string, title?: string) {
  // Check title content for specific cases
  if (title?.includes('No issues found')) {
    return (
      <Icon
        name="wrench"
        className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:opacity-0 transition-opacity"
      />
    )
  }
  if (title?.includes('Analyzed codebase')) {
    return (
      <Icon
        name="search"
        className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:opacity-0 transition-opacity"
      />
    )
  }

  // Fallback to type-based icons
  switch (type) {
    case 'task-search-web-v1':
      return (
        <Icon
          name="search"
          className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:opacity-0 transition-opacity"
        />
      )
    case 'task-search-repo-v1':
      return (
        <Icon
          name="folder"
          className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:opacity-0 transition-opacity"
        />
      )
    case 'task-diagnostics-v1':
      return (
        <Icon
          name="settings"
          className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:opacity-0 transition-opacity"
        />
      )
    default:
      return (
        <Icon
          name="settings"
          className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:opacity-0 transition-opacity"
        />
      )
  }
}

function renderTaskPart(part: any): React.ReactNode {
  if (!part || typeof part !== 'object') return null

  switch (part.type) {
    case 'starting-web-search':
      return <div className="ml-0.5">{`Searching "${part.query}"`}</div>
    case 'got-results':
      return (
        <div className="ml-0.5">{`Analyzing ${part.count} results...`}</div>
      )
    case 'finished-web-search':
      return (
        <div>
          <p className="ml-0.5 text-gray-400">{part.answer}</p>
          {part.citations && part.citations.length > 0 && (
            <div className="flex gap-2 mt-2">
              {part.citations.map((citation: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[#1A1A1A] text-gray-400 text-xs rounded border border-gray-600"
                >
                  {new URL(citation.url).hostname.replace(/^www\./, '')}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    case 'starting-repo-search':
      return <div className="ml-0.5">{`Searching "${part.query}"`}</div>
    case 'select-files':
      return (
        <div className="ml-0.5 flex items-center gap-2">
          <span className="text-cyan-400">Reading files</span>
          {part.filePaths?.map((file: string, index: number) => (
            <span key={index} className="text-cyan-400 flex items-center gap-1">
              <Icon name="file-text" className="w-3 h-3" /> {file}
            </span>
          ))}
        </div>
      )
    case 'fetching-diagnostics':
      return <div className="ml-0.5">Checking for issues...</div>
    case 'diagnostics-passed':
      return <div className="ml-0.5">✅ No issues found</div>
    default:
      return <div className="ml-0.5">{JSON.stringify(part)}</div>
  }
}

export function TaskSection({
  title,
  type,
  parts,
  collapsed: initialCollapsed = true,
  className,
}: TaskSectionProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  // Check if task completed with no issues
  const hasNoIssues = parts?.some((part) => part.type === 'diagnostics-passed')
  const displayTitle = hasNoIssues ? 'No issues found' : title || 'Processing'

  return (
    <div className={cn('mb-2', className)}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full py-2 text-left flex items-center gap-2 group"
      >
        <div className="relative w-3 h-3 flex-shrink-0">
          {collapsed ? (
            <>
              {getTypeIcon(type, displayTitle)}
              <Icon
                name="chevron-right"
                className="w-3 h-3 text-gray-400 group-hover:text-white absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </>
          ) : (
            <Icon
              name="chevron-down"
              className="w-3 h-3 text-gray-400 group-hover:text-white"
            />
          )}
        </div>
        <span className="text-sm text-gray-400 group-hover:text-white">
          {displayTitle}
        </span>
      </button>
      {!collapsed && parts && (
        <div className="ml-1 mt-1 animate-in fade-in duration-200">
          <div className="pl-3 border-l-2 border-gray-700 space-y-2">
            {parts.map((part, index) => (
              <div key={index} className="text-sm text-gray-400">
                {renderTaskPart(part)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
