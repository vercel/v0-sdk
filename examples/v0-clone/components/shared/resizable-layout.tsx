'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/lib/client-utils'

interface ResizableLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  defaultLeftWidth?: number
  minLeftWidth?: number
  maxLeftWidth?: number
  className?: string
  singlePanelMode?: boolean
  activePanel?: 'left' | 'right'
}

export function ResizableLayout({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 30,
  minLeftWidth = 20,
  maxLeftWidth = 60,
  className,
  singlePanelMode = false,
  activePanel = 'left',
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

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

  if (singlePanelMode) {
    return (
      <div ref={containerRef} className={cn('flex flex-col h-full', className)}>
        <div className="flex-1 flex flex-col min-h-0">
          {activePanel === 'left' ? leftPanel : rightPanel}
        </div>
      </div>
    )
  }

  // On mobile, conditionally render to avoid stream duplication
  // On desktop, always render both to prevent iframe remounting
  if (isMobile) {
    return (
      <div ref={containerRef} className={cn('flex h-full', className)}>
        <div className="flex flex-col h-full w-full">
          {activePanel === 'left' ? leftPanel : rightPanel}
        </div>
      </div>
    )
  }

  // Desktop: Always render both panels to prevent remounting on resize
  return (
    <div ref={containerRef} className={cn('flex h-full', className)}>
      <div className="flex flex-col" style={{ width: `${leftWidth}%` }}>
        {leftPanel}
      </div>

      <div
        className={cn(
          'w-px bg-border dark:bg-input cursor-col-resize transition-all relative group',
          isDragging && 'bg-blue-500 dark:bg-blue-400',
        )}
        onMouseDown={handleMouseDown}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 bg-blue-500 dark:bg-blue-400 transition-all duration-200',
            'group-hover:w-[3px]',
            isDragging && 'w-[3px]',
          )}
        />
        <div className="absolute inset-y-0 -left-2 -right-2" />
      </div>

      <div className="flex-1 flex flex-col">{rightPanel}</div>
    </div>
  )
}
