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

  if (inline) {
    return (
      <BaseMathPart
        {...props}
        content={content}
        inline={inline}
        className="mx-1"
      >
        {isLoading ? (
          <span className="text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
            math
          </span>
        ) : MathComponent ? (
          <span className="text-purple-700 dark:text-purple-300">
            <MathComponent math={content} />
          </span>
        ) : (
          <code className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
            {content}
          </code>
        )}
      </BaseMathPart>
    )
  }

  return (
    <BaseMathPart {...props} content={content} inline={inline} className="my-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/30 rounded-2xl p-1 shadow-lg">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center">
          <div className="text-xs uppercase tracking-wider text-purple-500 dark:text-purple-400 mb-4 font-medium">
            Mathematical Expression
          </div>
          {isLoading ? (
            <div className="text-purple-400 italic">
              Loading elegant mathematics...
            </div>
          ) : MathComponent ? (
            <div className="text-purple-700 dark:text-purple-300 text-lg">
              <MathComponent math={content} />
            </div>
          ) : (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg font-mono text-purple-800 dark:text-purple-200">
              {content}
            </div>
          )}
        </div>
      </div>
    </BaseMathPart>
  )
}
