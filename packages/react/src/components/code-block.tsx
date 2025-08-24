import React from 'react'

export interface CodeBlockProps {
  language: string
  code: string
  className?: string
  children?: React.ReactNode
}

/**
 * Generic code block component
 * Renders plain code by default - consumers should provide their own styling and highlighting
 */
export function CodeBlock({
  language,
  code,
  className = '',
  children,
}: CodeBlockProps) {
  // If children provided, use that (allows complete customization)
  if (children) {
    return <>{children}</>
  }

  // Simple fallback - just render plain code
  return (
    <pre className={className} data-language={language}>
      <code>{code}</code>
    </pre>
  )
}
