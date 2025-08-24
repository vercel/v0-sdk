import React, { Suspense } from 'react'

// Dynamically import react-katex to avoid SSR issues
const InlineMath = React.lazy(() =>
  import('react-katex').then((mod) => ({ default: mod.InlineMath })),
) as React.LazyExoticComponent<React.ComponentType<{ math: string }>>

const BlockMath = React.lazy(() =>
  import('react-katex').then((mod) => ({ default: mod.BlockMath })),
) as React.LazyExoticComponent<React.ComponentType<{ math: string }>>

interface MathRendererProps {
  content: string
  inline?: boolean
}

/**
 * Component for rendering mathematical expressions using KaTeX
 */
export function MathRenderer({ content, inline = false }: MathRendererProps) {
  const MathComponent = inline ? InlineMath : BlockMath

  return (
    <Suspense
      fallback={<span className="text-gray-500">[Loading math...]</span>}
    >
      <MathComponent math={content} />
    </Suspense>
  )
}
