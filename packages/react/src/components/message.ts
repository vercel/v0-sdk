import React from 'react'
import { MessageProps } from '../types'
import { MathPart } from './math-part'
import { CodeBlock } from './code-block'
import { CodeProjectPart } from './code-project-part'
import { ContentPartRenderer } from './content-part-renderer'
import { cn } from '../utils/cn'

// Headless message data structure
export interface MessageData {
  elements: MessageElement[]
  messageId: string
  role: string
  streaming: boolean
  isLastMessage: boolean
}

export interface MessageElement {
  type: 'text' | 'html' | 'component' | 'content-part' | 'code-project'
  key: string
  data: any
  props?: Record<string, any>
  children?: MessageElement[]
}

// Headless hook for processing message content
export function useMessage({
  content,
  messageId = 'unknown',
  role = 'assistant',
  streaming = false,
  isLastMessage = false,
  components,
  renderers, // deprecated
}: Omit<MessageProps, 'className'>): MessageData {
  if (!Array.isArray(content)) {
    console.warn(
      'MessageContent: content must be an array (MessageBinaryFormat)',
    )
    return {
      elements: [],
      messageId,
      role,
      streaming,
      isLastMessage,
    }
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
  const elements = content
    .map(([type, data], index) => {
      const key = `${messageId}-${index}`

      // Markdown data (type 0) - this is the main content
      if (type === 0) {
        return processElements(data, key, mergedComponents)
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
    .filter(Boolean) as MessageElement[]

  return {
    elements,
    messageId,
    role,
    streaming,
    isLastMessage,
  }
}

// Process elements into headless data structure
function processElements(
  data: any,
  keyPrefix: string,
  components?: MessageProps['components'],
): MessageElement | null {
  // Handle case where data might not be an array due to streaming/patching
  if (!Array.isArray(data)) {
    return null
  }

  const children = data
    .map((item, index) => {
      const key = `${keyPrefix}-${index}`
      return processElement(item, key, components)
    })
    .filter(Boolean) as MessageElement[]

  return {
    type: 'component',
    key: keyPrefix,
    data: 'elements',
    children,
  }
}

// Process individual elements into headless data structure
function processElement(
  element: any,
  key: string,
  components?: MessageProps['components'],
): MessageElement | null {
  if (typeof element === 'string') {
    return {
      type: 'text',
      key,
      data: element,
    }
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
    return {
      type: 'content-part',
      key,
      data: {
        part: props.part,
        iconRenderer: components?.Icon,
        thinkingSectionRenderer: components?.ThinkingSection,
        taskSectionRenderer: components?.TaskSection,
      },
    }
  }

  if (tagName === 'Codeblock') {
    return {
      type: 'code-project',
      key,
      data: {
        language: props.lang,
        code: children[0],
        iconRenderer: components?.Icon,
        customRenderer: components?.CodeProjectPart,
      },
    }
  }

  if (tagName === 'text') {
    return {
      type: 'text',
      key,
      data: children[0] || '',
    }
  }

  // Process children
  const processedChildren = children
    .map((child, childIndex) => {
      const childKey = `${key}-child-${childIndex}`
      return processElement(child, childKey, components)
    })
    .filter(Boolean) as MessageElement[]

  // Handle standard HTML elements
  const componentOrConfig = components?.[tagName as keyof typeof components]

  return {
    type: 'html',
    key,
    data: {
      tagName,
      props,
      componentOrConfig,
    },
    children: processedChildren,
  }
}

// Default JSX renderer for backward compatibility
function MessageRenderer({
  messageData,
  className,
}: {
  messageData: MessageData
  className?: string
}) {
  const renderElement = (element: MessageElement): React.ReactNode => {
    switch (element.type) {
      case 'text':
        return React.createElement('span', { key: element.key }, element.data)

      case 'content-part':
        return React.createElement(ContentPartRenderer, {
          key: element.key,
          part: element.data.part,
          iconRenderer: element.data.iconRenderer,
          thinkingSectionRenderer: element.data.thinkingSectionRenderer,
          taskSectionRenderer: element.data.taskSectionRenderer,
        })

      case 'code-project':
        const CustomCodeProjectPart = element.data.customRenderer
        const CodeProjectComponent = CustomCodeProjectPart || CodeProjectPart
        return React.createElement(CodeProjectComponent, {
          key: element.key,
          language: element.data.language,
          code: element.data.code,
          iconRenderer: element.data.iconRenderer,
        })

      case 'html':
        const { tagName, props, componentOrConfig } = element.data
        const renderedChildren = element.children?.map(renderElement)

        if (typeof componentOrConfig === 'function') {
          const Component = componentOrConfig
          return React.createElement(
            Component,
            {
              key: element.key,
              ...props,
              className: props?.className,
            },
            renderedChildren,
          )
        } else if (componentOrConfig && typeof componentOrConfig === 'object') {
          const mergedClassName = cn(
            props?.className,
            componentOrConfig.className,
          )
          return React.createElement(
            tagName,
            { key: element.key, ...props, className: mergedClassName },
            renderedChildren,
          )
        } else {
          // Default HTML element rendering
          const elementProps: Record<string, any> = {
            key: element.key,
            ...props,
          }
          if (props?.className) {
            elementProps.className = props.className
          }

          // Special handling for links
          if (tagName === 'a') {
            elementProps.target = '_blank'
            elementProps.rel = 'noopener noreferrer'
          }

          return React.createElement(tagName, elementProps, renderedChildren)
        }

      case 'component':
        return React.createElement(
          React.Fragment,
          { key: element.key },
          element.children?.map(renderElement),
        )

      default:
        return null
    }
  }

  return React.createElement(
    'div',
    { className },
    messageData.elements.map(renderElement),
  )
}

// Simplified renderer that matches v0's exact approach (backward compatibility)
function MessageImpl({
  content,
  messageId = 'unknown',
  role = 'assistant',
  streaming = false,
  isLastMessage = false,
  className,
  components,
  renderers, // deprecated
}: MessageProps) {
  const messageData = useMessage({
    content,
    messageId,
    role,
    streaming,
    isLastMessage,
    components,
    renderers,
  })

  return React.createElement(MessageRenderer, { messageData, className })
}

/**
 * Main component for rendering v0 Platform API message content
 * This is a backward-compatible JSX renderer. For headless usage, use the useMessage hook.
 */
export const Message = React.memo(MessageImpl)
