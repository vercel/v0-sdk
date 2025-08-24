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
          <span className="text-yellow-400 bg-gray-900 px-1 rounded">
            [MATH]
          </span>
        ) : MathComponent ? (
          <span className="text-cyan-300">
            <MathComponent math={content} />
          </span>
        ) : (
          <code className="bg-gray-900 text-yellow-300 px-1 py-0.5 rounded border border-gray-700">
            {content}
          </code>
        )}
      </BaseMathPart>
    )
  }

  return (
    <BaseMathPart {...props} content={content} inline={inline} className="my-4">
      <div className="border border-cyan-400 rounded bg-black">
        <div className="px-4 py-2 bg-cyan-400 text-black text-sm font-bold">
          MATH_PROCESSOR.exe
        </div>
        <div className="p-4 text-center">
          {isLoading ? (
            <div className="text-yellow-400 font-mono">
              [LOADING MATH ENGINE...]
            </div>
          ) : MathComponent ? (
            <div className="text-cyan-300">
              <MathComponent math={content} />
            </div>
          ) : (
            <div className="bg-gray-900 p-4 rounded border border-gray-700 font-mono text-yellow-300">
              {content}
            </div>
          )}
        </div>
      </div>
    </BaseMathPart>
  )
}
