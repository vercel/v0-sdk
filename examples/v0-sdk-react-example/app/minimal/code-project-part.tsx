import React, { useState } from 'react'
import { CodeProjectPartProps } from '@v0-sdk/react'

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
    <div className="my-6" {...props}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm">{collapsed ? '▶' : '▼'}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {title || 'Code Project'}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              v1
            </span>
          </div>
        </button>

        {!collapsed && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
            <div className="pt-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span>page.tsx</span>
                <span className="text-gray-400">app/page.tsx</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
