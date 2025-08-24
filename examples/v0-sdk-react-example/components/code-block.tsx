'use client'

import React, { useEffect, useState } from 'react'
import { CodeBlock as BaseCodeBlock, CodeBlockProps } from '@v0-sdk/react'
import { cn } from '@/lib/utils'

/**
 * Code block implementation using Prism.js for syntax highlighting
 */
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
        // Dynamically import Prism to avoid SSR issues
        const Prism = await import('prismjs')

        // Import common language components
        await Promise.all([
          import('prismjs/components/prism-javascript' as any),
          import('prismjs/components/prism-typescript' as any),
          import('prismjs/components/prism-jsx' as any),
          import('prismjs/components/prism-tsx' as any),
          import('prismjs/components/prism-python' as any),
          import('prismjs/components/prism-java' as any),
          import('prismjs/components/prism-c' as any),
          import('prismjs/components/prism-cpp' as any),
          import('prismjs/components/prism-csharp' as any),
          import('prismjs/components/prism-php' as any),
          import('prismjs/components/prism-ruby' as any),
          import('prismjs/components/prism-go' as any),
          import('prismjs/components/prism-rust' as any),
          import('prismjs/components/prism-swift' as any),
          import('prismjs/components/prism-kotlin' as any),
          import('prismjs/components/prism-scala' as any),
          import('prismjs/components/prism-sql' as any),
          import('prismjs/components/prism-json' as any),
          import('prismjs/components/prism-yaml' as any),
          import('prismjs/components/prism-markdown' as any),
          import('prismjs/components/prism-bash' as any),
          import('prismjs/components/prism-shell-session' as any),
          import('prismjs/components/prism-css' as any),
          import('prismjs/components/prism-scss' as any),
          import('prismjs/components/prism-less' as any),
          import('prismjs/components/prism-xml-doc' as any),
        ]).catch(() => {
          // Ignore errors for missing language components
        })

        if (!mounted) return

        // Normalize language name
        const normalizedLang = normalizeLanguage(language)

        // Check if language is supported
        if (Prism.languages[normalizedLang]) {
          const highlighted = Prism.highlight(
            code,
            Prism.languages[normalizedLang],
            normalizedLang,
          )
          setHighlightedCode(highlighted)
        } else {
          // Fallback to plain text
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
    <BaseCodeBlock
      {...props}
      language={language}
      code={code}
      className={cn(
        'bg-gray-900 dark:bg-gray-900 border border-gray-700 p-4 rounded-lg overflow-x-auto text-sm font-mono',
        className,
      )}
    >
      {isLoading ? (
        <pre
          className={cn(
            'bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono',
            className,
          )}
        >
          <code className="text-gray-400">[Loading code...]</code>
        </pre>
      ) : (
        <pre
          className={cn(
            'bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono',
            className,
          )}
        >
          <code
            className={`language-${normalizeLanguage(language)} text-gray-100`}
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
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
    xml: 'markup',
    html: 'markup',
  }

  return langMap[lang.toLowerCase()] || lang.toLowerCase()
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
