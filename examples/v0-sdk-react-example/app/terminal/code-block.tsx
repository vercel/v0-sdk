'use client'
import React, { useEffect, useState } from 'react'
import { CodeBlock as BaseCodeBlock, CodeBlockProps } from '@v0-sdk/react'

export function CodeBlock({
  language,
  code,
  className,
  ...props
}: Omit<CodeBlockProps, 'children'>) {
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const highlightCode = async () => {
      try {
        const Prism = await import('prismjs')
        await Promise.all([
          import('prismjs/components/prism-javascript' as any),
          import('prismjs/components/prism-typescript' as any),
          import('prismjs/components/prism-jsx' as any),
          import('prismjs/components/prism-tsx' as any),
        ]).catch(() => {})
        if (!mounted) return
        const normalizedLang = normalizeLanguage(language)
        if (Prism.languages[normalizedLang]) {
          const highlighted = Prism.highlight(
            code,
            Prism.languages[normalizedLang],
            normalizedLang,
          )
          setHighlightedCode(highlighted)
        } else {
          setHighlightedCode(escapeHtml(code))
        }
      } catch (error) {
        console.warn('Failed to highlight code:', error)
        if (mounted) {
          setHighlightedCode(escapeHtml(code))
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    highlightCode()
    return () => {
      mounted = false
    }
  }, [code, language])

  return (
    <BaseCodeBlock {...props} language={language} code={code} className="my-4">
      <div className="border border-green-400 rounded bg-black">
        {/* Terminal-style header */}
        <div className="flex items-center justify-between px-4 py-2 bg-green-400 text-black text-sm font-bold">
          <span>code.{language}</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-600"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
          </div>
        </div>

        {isLoading ? (
          <pre className="p-4 text-green-300 font-mono text-sm overflow-x-auto">
            <code>[LOADING CODE...]</code>
          </pre>
        ) : (
          <pre className="p-4 text-green-100 font-mono text-sm overflow-x-auto">
            <code
              className={`language-${normalizeLanguage(language)}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        )}
      </div>
    </BaseCodeBlock>
  )
}

function normalizeLanguage(lang: string): string {
  const langMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    tsx: 'tsx',
    jsx: 'jsx',
  }
  return langMap[lang.toLowerCase()] || lang.toLowerCase()
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
