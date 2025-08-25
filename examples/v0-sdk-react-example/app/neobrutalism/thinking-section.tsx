import React, { useState } from 'react'
import { ThinkingSectionProps } from '@v0-sdk/react'

export function ThinkingSection({ children }: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-pink-400 hover:bg-pink-500 border-4 border-black px-6 py-4 font-black uppercase tracking-wider text-black shadow-[6px_6px_0px_0px_rgba(0,0,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-300 border-2 border-black flex items-center justify-center">
              🧠
            </div>
            <span>THINKING PROCESS</span>
          </div>
          <div
            className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-yellow-200 border-l-4 border-r-4 border-b-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(255,0,0,1)]">
          <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="prose max-w-none">
              <div className="font-mono text-black">{children}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
