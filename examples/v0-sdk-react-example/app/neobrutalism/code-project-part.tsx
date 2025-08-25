import React, { useState } from 'react'
import { CodeProjectPartProps } from '@v0-sdk/react'

export function CodeProjectPart({
  title,
  filename,
  collapsed: initialCollapsed = false,
  className,
  code,
  language,
  children,
  ...props
}: CodeProjectPartProps) {
  const [isExpanded, setIsExpanded] = useState(!initialCollapsed)

  return (
    <div className="mb-6" {...props}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-purple-400 hover:bg-purple-500 border-4 border-black px-6 py-4 font-black uppercase tracking-wider text-black shadow-[6px_6px_0px_0px_rgba(255,255,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black border-2 border-white flex items-center justify-center text-white text-lg">
              💻
            </div>
            <span>{(title || 'CODE PROJECT').toUpperCase()}</span>
            {filename && (
              <div className="bg-black text-cyan-400 px-2 py-1 font-mono text-xs border-2 border-cyan-400">
                {filename}
              </div>
            )}
          </div>
          <div
            className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-white border-l-4 border-r-4 border-b-4 border-black shadow-[6px_6px_0px_0px_rgba(255,0,255,1)]">
          <div className="p-6">
            <div className="bg-yellow-200 border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-2 text-black font-bold uppercase text-xs tracking-wide">
                📁 PROJECT STRUCTURE
              </div>
              <div className="flex items-center gap-3 bg-black border-2 border-cyan-400 p-3 shadow-[2px_2px_0px_0px_rgba(0,255,255,1)]">
                <div className="w-8 h-8 bg-cyan-400 border-2 border-black flex items-center justify-center">
                  <span className="text-black font-bold">📄</span>
                </div>
                <div className="flex-1">
                  <div className="text-cyan-400 font-bold font-mono">
                    page.tsx
                  </div>
                  <div className="text-green-400 font-mono text-sm">
                    app/page.tsx
                  </div>
                </div>
                <div className="bg-green-400 border-2 border-black px-3 py-1 text-black font-bold text-xs">
                  ACTIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
