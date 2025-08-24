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
    <BaseCodeBlock {...props} language={language} code={code} className="my-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/30 rounded-2xl p-1 shadow-lg">
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-gray-800 dark:to-purple-900/50 border-b border-purple-200 dark:border-purple-700/30">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {language}
            </span>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-300"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
              <div className="w-3 h-3 rounded-full bg-green-300"></div>
            </div>
          </div>

          {isLoading ? (
            <pre className="p-6 text-gray-500 dark:text-gray-400 font-mono text-sm">
              <code>Loading beautiful code...</code>
            </pre>
          ) : (
            <pre className="p-6 text-gray-800 dark:text-gray-200 font-mono text-sm overflow-x-auto">
              <code
                className={`language-${normalizeLanguage(language)}`}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
          )}
        </div>
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
