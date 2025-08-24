'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { MathPart as BaseMathPart, MathPartProps } from '@v0-sdk/react'

/**
 * Math renderer implementation using KaTeX
 */
export function MathPart({
  content,
  inline = false,
  className,
  ...props
}: Omit<MathPartProps, 'children'>) {
  const [MathComponent, setMathComponent] = useState<React.ComponentType<{
    math: string
  }> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadKaTeX = async () => {
      try {
        const katex = await import('react-katex')
        if (mounted) {
          setMathComponent(() => (inline ? katex.InlineMath : katex.BlockMath))
          setIsLoading(false)
        }
      } catch (error) {
        console.warn('Failed to load KaTeX:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadKaTeX()

    return () => {
      mounted = false
    }
  }, [inline])

  return (
    <BaseMathPart
      {...props}
      content={content}
      inline={inline}
      className={className}
    >
      {isLoading ? (
        <span className="text-gray-500 animate-pulse">[Loading math...]</span>
      ) : MathComponent ? (
        <MathComponent math={content} />
      ) : // Fallback to plain text if KaTeX fails to load
      inline ? (
        <span>{content}</span>
      ) : (
        <div>{content}</div>
      )}
    </BaseMathPart>
  )
}
