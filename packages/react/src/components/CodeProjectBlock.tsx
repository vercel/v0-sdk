import React, { useState } from 'react'
import { cn } from '../utils/cn'
import { CodeBlock } from './CodeBlock'
import { Icon } from './Icon'

interface CodeProjectBlockProps {
  meta?: any
  lang?: string
  closed?: boolean
  code?: string
  className?: string
}

function parseV0File(code: string) {
  if (!code?.startsWith('[V0_FILE]')) return { filename: 'code', content: code }

  const lines = code.split('\n')
  const firstLine = lines[0]
  const match = firstLine.match(/\[V0_FILE\]([^:]+):file="([^"]+)"/)

  if (match) {
    const [, extension, filename] = match
    const content = lines.slice(1).join('\n')
    return { filename, content, extension }
  }

  return { filename: 'code', content: code }
}

export function CodeProjectBlock({
  meta,
  lang,
  closed: initialClosed = false,
  code,
  className,
}: CodeProjectBlockProps) {
  const [collapsed, setCollapsed] = useState(initialClosed)

  const { filename, content } = parseV0File(code || '')

  return (
    <div
      className={cn(
        'w-[70%] border border-gray-700 rounded-lg bg-[#1A1A1A]',
        className,
      )}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-3 py-2 text-left flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <Icon
            name={collapsed ? 'chevron-right' : 'chevron-down'}
            className="w-3 h-3 text-gray-300 flex-shrink-0"
          />
          <span className="text-base text-gray-300">
            {meta?.taskNameComplete || 'Created code project'}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-mono">v1</span>
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 animate-in fade-in duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Icon name="file-text" className="w-3 h-3 text-gray-400" />
              <span className="font-mono">{filename}</span>
              <span className="text-gray-600">app/page.tsx</span>
            </div>
            {meta?.project && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon name="file-text" className="w-3 h-3 text-gray-500" />
                  <span className="font-mono">layout.tsx</span>
                  <span className="text-gray-600">app/layout.tsx</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon name="file-text" className="w-3 h-3 text-gray-500" />
                  <span className="font-mono">globals.css</span>
                  <span className="text-gray-600">app/globals.css</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
