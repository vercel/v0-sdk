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
    <div className="my-4" {...props}>
      <div className="border border-green-400 rounded bg-black">
        {/* Terminal-style header */}
        <div className="flex items-center justify-between px-4 py-2 bg-green-400 text-black">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">PROJECT_GENERATOR.exe</span>
            <span className="text-xs bg-black text-green-400 px-2 py-1 rounded">
              v1.0
            </span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-600"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-900 transition-colors"
        >
          <span className="text-yellow-400">{collapsed ? '►' : '▼'}</span>
          <span className="text-green-300 font-mono">
            {title || 'GENERATED_PROJECT'}
          </span>
          <span className="text-gray-500 text-sm">
            [{collapsed ? 'COLLAPSED' : 'EXPANDED'}]
          </span>
        </button>

        {!collapsed && (
          <div className="px-4 pb-4 border-t border-green-600">
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-400 font-mono mb-2">
                [INFO] Project structure:
              </div>
              <div className="flex items-center gap-3 text-sm font-mono">
                <span className="text-cyan-400">📄</span>
                <span className="text-green-300">page.tsx</span>
                <span className="text-gray-500">→</span>
                <span className="text-gray-400">app/page.tsx</span>
                <span className="text-green-400 text-xs">[ACTIVE]</span>
              </div>
              <div className="text-xs text-gray-500 mt-2 font-mono">
                Status: ✓ Generated successfully
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
