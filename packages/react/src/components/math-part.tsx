import React from 'react'

export interface MathPartProps {
  content: string
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Generic math renderer component
 * Renders plain math content by default - consumers should provide their own math rendering
 */
export function MathPart({
  content,
  inline = false,
  className = '',
  children,
}: MathPartProps) {
  // If children provided, use that (allows complete customization)
  if (children) {
    return <>{children}</>
  }

  // Simple fallback - just render plain math content
  const Element = inline ? 'span' : 'div'

  return (
    <Element className={className} data-math-inline={inline}>
      {content}
    </Element>
  )
}
