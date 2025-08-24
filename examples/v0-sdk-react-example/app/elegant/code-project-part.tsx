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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/30 rounded-2xl p-1 shadow-lg">
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  collapsed
                    ? 'bg-purple-100 dark:bg-purple-800'
                    : 'bg-purple-200 dark:bg-purple-700'
                }`}
              >
                <div
                  className={`w-4 h-4 border-2 border-purple-600 dark:border-purple-300 rounded transition-transform duration-200 ${
                    collapsed ? '' : 'rotate-45'
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-sm"></div>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {title || 'Generated Project'}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Version 1.0
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-300 to-green-500 shadow-sm"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Ready
              </span>
            </div>
          </button>

          {!collapsed && (
            <div className="px-6 pb-6 border-t border-purple-100 dark:border-purple-800/50">
              <div className="pt-4 space-y-3">
                <div className="text-xs uppercase tracking-wider text-purple-500 dark:text-purple-400 font-medium mb-3">
                  Project Structure
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm">
                    <div className="w-4 h-4 bg-white rounded opacity-90"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                      page.tsx
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      app/page.tsx
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                    Active
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
