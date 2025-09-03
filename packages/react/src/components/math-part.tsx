import React from 'react'

export interface MathPartProps {
  content: string
  inline?: boolean
  className?: string
  children?: React.ReactNode
  displayMode?: boolean
}

// Headless math data
export interface MathData {
  content: string
  inline: boolean
  displayMode: boolean
  processedContent: string
}

// Headless hook for math data
export function useMath(
  props: Omit<MathPartProps, 'className' | 'children'>,
): MathData {
  return {
    content: props.content,
    inline: props.inline ?? false,
    displayMode: props.displayMode ?? !props.inline,
    processedContent: props.content, // Could be enhanced with math processing
  }
}

/**
 * Generic math renderer component
 * Renders plain math content by default - consumers should provide their own math rendering
 *
 * For headless usage, use the useMath hook instead.
 */
export function MathPart({
  content,
  inline = false,
  className = '',
  children,
  displayMode,
}: MathPartProps) {
  // If children provided, use that (allows complete customization)
  if (children) {
    return React.createElement(React.Fragment, {}, children)
  }

  const mathData = useMath({ content, inline, displayMode })

  // Simple fallback - just render plain math content
  // Uses React.createElement for maximum compatibility across environments
  return React.createElement(
    mathData.inline ? 'span' : 'div',
    {
      className,
      'data-math-inline': mathData.inline,
      'data-math-display': mathData.displayMode,
    },
    mathData.processedContent,
  )
}
