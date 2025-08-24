import React, { useEffect, useState } from 'react'

interface CodeBlockProps {
  language: string
  code: string
  className?: string
}

/**
 * Component for rendering syntax-highlighted code blocks
 * Uses Prism.js for syntax highlighting
 */
export function CodeBlock({ language, code, className }: CodeBlockProps) {
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
          import('prismjs/components/prism-javascript'),
          import('prismjs/components/prism-typescript'),
          import('prismjs/components/prism-jsx'),
          import('prismjs/components/prism-tsx'),
          import('prismjs/components/prism-python'),
          import('prismjs/components/prism-java'),
          import('prismjs/components/prism-c'),
          import('prismjs/components/prism-cpp'),
          import('prismjs/components/prism-csharp'),
          import('prismjs/components/prism-php'),
          import('prismjs/components/prism-ruby'),
          import('prismjs/components/prism-go'),
          import('prismjs/components/prism-rust'),
          import('prismjs/components/prism-swift'),
          import('prismjs/components/prism-kotlin'),
          import('prismjs/components/prism-scala'),
          import('prismjs/components/prism-sql'),
          import('prismjs/components/prism-json'),
          import('prismjs/components/prism-yaml'),
          import('prismjs/components/prism-markdown'),
          import('prismjs/components/prism-bash'),
          import('prismjs/components/prism-shell-session'),
          import('prismjs/components/prism-css'),
          import('prismjs/components/prism-scss'),
          import('prismjs/components/prism-less'),
          import('prismjs/components/prism-xml-doc'),
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

  if (isLoading) {
    return (
      <pre
        className={`bg-[#1E1E1E] border border-gray-700 p-4 rounded-lg overflow-x-auto text-sm font-mono ${className || ''}`}
      >
        <code className="text-gray-400">[Loading code...]</code>
      </pre>
    )
  }

  return (
    <pre
      className={`bg-[#1E1E1E] border border-gray-700 p-4 rounded-lg overflow-x-auto text-sm font-mono ${className || ''}`}
    >
      <code
        className={`language-${normalizeLanguage(language)} text-gray-100`}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  )
}

function normalizeLanguage(lang: string): string {
  const langMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
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
