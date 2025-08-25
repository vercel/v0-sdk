import React, { useState } from 'react'
import { TaskSectionProps } from '@v0-sdk/react'

function renderTaskPart(part: any): React.ReactNode {
  if (!part || typeof part !== 'object') {
    return null
  }

  switch (part.type) {
    case 'starting-repo-search':
      return <span className="font-mono">🔍 SEARCHING "{part.query}"</span>
    case 'select-files':
      return (
        <div className="space-y-2">
          <span className="font-bold">📁 READING FILES:</span>
          <div className="flex flex-wrap gap-2">
            {part.filePaths?.map((path: string, idx: number) => (
              <div
                key={idx}
                className="bg-black border-2 border-cyan-400 text-cyan-400 px-2 py-1 font-mono text-xs shadow-[2px_2px_0px_0px_rgba(0,255,255,1)]"
              >
                {path.split('/').pop()}
              </div>
            ))}
          </div>
        </div>
      )
    case 'starting-web-search':
      return <span className="font-mono">🌐 WEB SEARCH: "{part.query}"</span>
    case 'got-results':
      return (
        <span className="font-bold text-green-600">
          ✨ FOUND {part.count} RESULTS
        </span>
      )
    case 'finished-web-search':
      return part.answer ? (
        <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="font-bold text-black mb-2">🎯 RESULT:</div>
          <p className="text-black font-medium">{part.answer}</p>
        </div>
      ) : null
    case 'diagnostics-passed':
      return (
        <span className="font-bold text-green-600">✅ NO ISSUES FOUND</span>
      )
    case 'launch-tasks':
      return (
        <span className="font-bold text-purple-600">🚀 LAUNCHING TASKS</span>
      )
    case 'fetching-diagnostics':
      return <span className="font-mono">🔧 CHECKING FOR ISSUES...</span>
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
  children,
  ...props
}: TaskSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
    if (onCollapse) {
      onCollapse()
    }
  }

  // Count meaningful parts
  const meaningfulParts = parts.filter((part) => {
    const rendered = renderTaskPart(part)
    return rendered !== null
  })

  // If there's only one meaningful part, show just the content
  if (meaningfulParts.length === 1) {
    return (
      <div className="mb-6" {...props}>
        <div className="bg-cyan-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="font-bold text-black">
            {renderTaskPart(meaningfulParts[0])}
          </div>
        </div>
      </div>
    )
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'task-search-web-v1':
        return {
          bg: 'bg-blue-400',
          icon: '🌐',
          shadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,255,1)]',
        }
      case 'task-search-repo-v1':
        return {
          bg: 'bg-green-400',
          icon: '📁',
          shadow: 'shadow-[6px_6px_0px_0px_rgba(0,255,0,1)]',
        }
      case 'task-diagnostics-v1':
        return {
          bg: 'bg-orange-400',
          icon: '🔧',
          shadow: 'shadow-[6px_6px_0px_0px_rgba(255,165,0,1)]',
        }
      default:
        return {
          bg: 'bg-cyan-400',
          icon: '📋',
          shadow: 'shadow-[6px_6px_0px_0px_rgba(0,255,255,1)]',
        }
    }
  }

  const config = getTypeConfig(type || '')

  return (
    <div className="mb-6" {...props}>
      <button
        onClick={handleToggle}
        className={`w-full ${config.bg} hover:brightness-110 border-4 border-black px-6 py-4 font-black uppercase tracking-wider text-black ${config.shadow} hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center text-lg">
              {config.icon}
            </div>
            <span>{title || 'TASK'}</span>
          </div>
          <div
            className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-white border-l-4 border-r-4 border-b-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-gray-100 border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-3">
              {parts.map((part, index) => (
                <div key={index} className="font-mono text-black">
                  {renderTaskPart(part)}
                </div>
              ))}
              {children && (
                <div className="font-mono text-black">{children}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
