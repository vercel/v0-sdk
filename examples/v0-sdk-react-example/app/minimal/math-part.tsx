'use client'
import React, { Suspense, useState, useEffect } from 'react'
import { MathPart as BaseMathPart, MathPartProps } from '@v0-sdk/react'

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
      className={inline ? 'mx-1' : 'my-4 text-center'}
    >
      {isLoading ? (
        <span className="text-gray-400 text-sm">[Math...]</span>
      ) : MathComponent ? (
        <MathComponent math={content} />
      ) : inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
          {content}
        </code>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-center font-mono text-sm">
          {content}
        </div>
      )}
    </BaseMathPart>
  )
}
