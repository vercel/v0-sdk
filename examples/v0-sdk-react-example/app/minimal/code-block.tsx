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
      {isLoading ? (
        <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded text-sm font-mono overflow-x-auto">
          <code className="text-gray-500">[Loading...]</code>
        </pre>
      ) : (
        <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded text-sm font-mono overflow-x-auto">
          <code
            className={`language-${normalizeLanguage(language)} text-gray-900 dark:text-gray-100`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      )}
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
