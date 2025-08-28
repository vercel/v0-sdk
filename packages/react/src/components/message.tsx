import React from 'react'
import { MessageProps } from '../types'
import { MathPart } from './math-part'
import { CodeBlock } from './code-block'
import { CodeProjectPart } from './code-project-part'
import { ContentPartRenderer } from './content-part-renderer'
import { cn } from '../utils/cn'

// Simplified renderer that matches v0's exact approach
function MessageImpl({
  content,
  messageId = 'unknown',
  role: _role = 'assistant',
  streaming: _streaming = false,
  isLastMessage: _isLastMessage = false,
  className,
  components,
  renderers, // deprecated
}: MessageProps) {
  if (!Array.isArray(content)) {
    console.warn(
      'MessageContent: content must be an array (MessageBinaryFormat)',
    )
    return null
  }

  // Merge components and renderers (backward compatibility)
  const mergedComponents = {
    ...components,
    // Map legacy renderers to new component names
    ...(renderers?.CodeBlock && { CodeBlock: renderers.CodeBlock }),
    ...(renderers?.MathRenderer && { MathPart: renderers.MathRenderer }),
    ...(renderers?.MathPart && { MathPart: renderers.MathPart }),
    ...(renderers?.Icon && { Icon: renderers.Icon }),
  }

  // Process content exactly like v0's Renderer component
  const elements = content.map(([type, data], index) => {
    const key = `${messageId}-${index}`

    // Markdown data (type 0) - this is the main content
    if (type === 0) {
      return <Elements key={key} data={data} components={mergedComponents} />
    }

    // Metadata (type 1) - extract context but don't render
    if (type === 1) {
      // In the future, we could extract sources/context here like v0 does
      // For now, just return null like v0's renderer
      return null
    }

    // Other types - v0 doesn't handle these in the main renderer
    return null
  })

  return <div className={className}>{elements}</div>
}

// This component handles the markdown data array (equivalent to v0's Elements component)
function Elements({
  data,
  components,
}: {
  data: any
  components?: MessageProps['components']
}) {
  // Handle case where data might not be an array due to streaming/patching
  if (!Array.isArray(data)) {
    return null
  }

  const renderedElements = data
    .map((item, index) => {
      const key = `element-${index}`
      return renderElement(item, key, components)
    })
    .filter(Boolean) // Filter out null/undefined elements

  return <>{renderedElements}</>
}

// Render individual elements (equivalent to v0's element rendering logic)
function renderElement(
  element: any,
  key: string,
  components?: MessageProps['components'],
): React.ReactNode {
  if (typeof element === 'string') {
    return <span key={key}>{element}</span>
  }

  if (!Array.isArray(element)) {
    return null
  }

  const [tagName, props, ...children] = element

  if (!tagName) {
    return null
  }

  // Handle special v0 Platform API elements
  if (tagName === 'AssistantMessageContentPart') {
    return (
      <ContentPartRenderer
        key={key}
        part={props.part}
        iconRenderer={components?.Icon}
        thinkingSectionRenderer={components?.ThinkingSection}
        taskSectionRenderer={components?.TaskSection}
      />
    )
  }

  if (tagName === 'Codeblock') {
    const CustomCodeProjectPart = components?.CodeProjectPart
    const CodeProjectComponent = CustomCodeProjectPart || CodeProjectPart
    return (
      <CodeProjectComponent
        key={key}
        language={props.lang}
        code={children[0]}
        iconRenderer={components?.Icon}
      />
    )
  }

  if (tagName === 'text') {
    return <span key={key}>{children[0] || ''}</span>
  }

  // Render children
  const renderedChildren = children
    .map((child, childIndex) => {
      const childKey = `${key}-child-${childIndex}`
      return renderElement(child, childKey, components)
    })
    .filter(Boolean)

  // Handle standard HTML elements
  const className = props?.className
  const componentOrConfig = components?.[tagName as keyof typeof components]

  if (typeof componentOrConfig === 'function') {
    const Component = componentOrConfig
    return (
      <Component key={key} {...props} className={className}>
        {renderedChildren}
      </Component>
    )
  } else if (componentOrConfig && typeof componentOrConfig === 'object') {
    const mergedClassName = cn(className, componentOrConfig.className)
    return React.createElement(
      tagName,
      { key, ...props, className: mergedClassName },
      renderedChildren,
    )
  } else {
    // Default HTML element rendering
    const elementProps: Record<string, any> = { key, ...props }
    if (className) {
      elementProps.className = className
    }

    // Special handling for links
    if (tagName === 'a') {
      elementProps.target = '_blank'
      elementProps.rel = 'noopener noreferrer'
    }

    return React.createElement(tagName, elementProps, renderedChildren)
  }
}

/**
 * Main component for rendering v0 Platform API message content
 */
export const Message = React.memo(MessageImpl)
