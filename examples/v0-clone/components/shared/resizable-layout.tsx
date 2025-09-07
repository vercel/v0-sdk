'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ResizableLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  defaultLeftWidth?: number
  minLeftWidth?: number
  maxLeftWidth?: number
  className?: string
}

export function ResizableLayout({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 30,
  minLeftWidth = 20,
  maxLeftWidth = 60,
  className,
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Clamp the width between min and max
      const clampedWidth = Math.min(
        Math.max(newLeftWidth, minLeftWidth),
        maxLeftWidth,
      )
      setLeftWidth(clampedWidth)
    },
    [isDragging, minLeftWidth, maxLeftWidth],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className={cn('flex h-full', className)}>
      {/* Left Panel */}
      <div
        className="flex flex-col border-r border-border dark:border-input"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>

      {/* Resize Handle */}
      <div
        className={cn(
          'w-1 bg-border dark:bg-input hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize transition-colors relative group',
          isDragging && 'bg-blue-500 dark:bg-blue-400',
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator on hover */}
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20 transition-colors" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col">{rightPanel}</div>
    </div>
  )
}
