import React from 'react'

export interface CodeBlockProps {
  language: string
  code: string
  className?: string
  children?: React.ReactNode
  filename?: string
}

// Headless code block data
export interface CodeBlockData {
  language: string
  code: string
  filename?: string
  lines: string[]
  lineCount: number
}

// Headless hook for code block data
export function useCodeBlock(
  props: Omit<CodeBlockProps, 'className' | 'children'>,
): CodeBlockData {
  const lines = props.code.split('\n')

  return {
    language: props.language,
    code: props.code,
    filename: props.filename,
    lines,
    lineCount: lines.length,
  }
}

/**
 * Generic code block component
 * Renders plain code by default - consumers should provide their own styling and highlighting
 *
 * For headless usage, use the useCodeBlock hook instead.
 */
export function CodeBlock({
  language,
  code,
  className = '',
  children,
  filename,
}: CodeBlockProps) {
  // If children provided, use that (allows complete customization)
  if (children) {
    return React.createElement(React.Fragment, {}, children)
  }

  const codeBlockData = useCodeBlock({ language, code, filename })

  // Simple fallback - just render plain code
  // Uses React.createElement for maximum compatibility across environments
  return React.createElement(
    'pre',
    {
      className,
      'data-language': codeBlockData.language,
      ...(filename && { 'data-filename': filename }),
    },
    React.createElement('code', {}, codeBlockData.code),
  )
}
