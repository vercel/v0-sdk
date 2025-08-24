import React, { useState } from 'react'
import { CodeProjectPartProps } from '@v0-sdk/react'
import { ChevronRight, ChevronDown, FileText } from 'lucide-react'

export function CodeProjectPart({
  title,
  filename,
  collapsed: initialCollapsed = true,
  className,
  code,
  language,
  children,
  iconRenderer,
  ...props
}: CodeProjectPartProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  return (
    <div className="mb-4" {...props}>
      <div className="border border-gray-300 dark:border-gray-800 rounded-lg bg-gray-100 dark:bg-gray-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between p-3 text-left group"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-gray-300 text-sm font-medium">
              {title || 'Code Project'}
            </span>
            <span className="text-gray-500 text-xs">v1</span>
          </div>
        </button>

        {!collapsed && (
          <div className="px-3 pb-3 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">page.tsx</span>
              <span className="text-gray-500">app/page.tsx</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
