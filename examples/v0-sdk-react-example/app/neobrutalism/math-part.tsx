import React from 'react'
import { MathPartProps } from '@v0-sdk/react'

export function MathPart({ children, displayMode }: MathPartProps) {
  return (
    <div className="mb-6">
      <div
        className={`bg-orange-400 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,255,0,1)] ${
          displayMode ? 'text-center' : 'inline-block'
        }`}
      >
        <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 border border-black"></div>
            <div className="w-3 h-3 bg-yellow-400 border border-black"></div>
            <div className="w-3 h-3 bg-green-500 border border-black"></div>
            <span className="font-bold text-black uppercase text-xs">MATH</span>
          </div>
          <div className="font-mono text-black text-lg">{children}</div>
        </div>
      </div>
    </div>
  )
}
