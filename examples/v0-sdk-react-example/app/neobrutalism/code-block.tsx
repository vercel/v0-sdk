import React from 'react'
import { CodeBlockProps } from '@v0-sdk/react'

export function CodeBlock({ children, language, filename }: CodeBlockProps) {
  return (
    <div className="mb-6 group">
      {filename && (
        <div className="bg-yellow-300 border-4 border-black px-4 py-2 font-bold text-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          📁 {filename}
        </div>
      )}
      <div className="bg-black border-4 border-black relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(255,0,255,1)]">
        {language && (
          <div className="absolute top-0 right-0 bg-cyan-400 text-black px-3 py-1 font-bold uppercase text-xs border-l-4 border-b-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {language}
          </div>
        )}
        <pre className="p-6 text-green-400 font-mono text-sm overflow-x-auto leading-relaxed">
          <code>{children}</code>
        </pre>
        {/* Decorative corner */}
        <div className="absolute bottom-0 left-0 w-6 h-6 bg-pink-500 border-t-4 border-r-4 border-black"></div>
      </div>
    </div>
  )
}
