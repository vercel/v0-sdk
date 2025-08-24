import React from 'react'
import { MessageProps } from '../types'
import { MathPart } from './math-part'
import { CodeBlock } from './code-block'
import { CodeProjectPart } from './code-project-part'
import { ContentPartRenderer } from './content-part-renderer'
import { cn } from '../utils/cn'

// Helper function to render HTML elements with component or className config
function renderHtmlElement(
  tagName: string,
  key: string,
  props: any,
  children: any[],
  className: string | undefined,
  componentOrConfig: any,
  components: MessageProps['components'],
): React.ReactNode {
  if (typeof componentOrConfig === 'function') {
    const Component = componentOrConfig
    return (
      <Component key={key} {...props} className={className}>
        {renderChildren(children, key, components)}
      </Component>
    )
  } else if (componentOrConfig && typeof componentOrConfig === 'object') {
    const mergedClassName = cn(className, componentOrConfig.className)
    return React.createElement(
      tagName,
      { key, ...props, className: mergedClassName },
      renderChildren(children, key, components),
    )
  } else {
    return React.createElement(
      tagName,
      { key, ...props, className },
      renderChildren(children, key, components),
    )
  }
}

/**
 * Core renderer component for v0 Platform API message content
 */
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

  const elements = content.map(([type, ...data], index) => {
    const key = `${messageId}-${index}`

    // Markdown/text content (type 0)
    if (type === 0) {
      const markdownData = data[0]
      if (!Array.isArray(markdownData)) {
        return null
      }

      return (
        <div key={key}>
          {markdownData.map((item: any, mdIndex: number) => {
            const mdKey = `${key}-md-${mdIndex}`
            return renderMarkdownElement(item, mdKey, mergedComponents)
          })}
        </div>
      )
    }

    // Code block (type 1)
    if (type === 1) {
      const [language, code] = data
      const CodeBlockComponent = mergedComponents?.CodeBlock || CodeBlock
      return (
        <CodeBlockComponent
          key={key}
          language={language || 'text'}
          code={code || ''}
        />
      )
    }

    // Math (type 2 for inline, type 3 for block)
    if (type === 2 || type === 3) {
      const mathContent = data[0] || ''
      const MathPartComponent = mergedComponents?.MathPart || MathPart
      return (
        <MathPartComponent
          key={key}
          content={mathContent}
          inline={type === 2}
        />
      )
    }

    // Unknown type - render as text for debugging
    return <div key={key}>[Unknown content type: {type}]</div>
  })

  return <div className={className}>{elements}</div>
}

function renderMarkdownElement(
  item: any,
  key: string,
  components?: MessageProps['components'],
): React.ReactNode {
  if (typeof item === 'string') {
    return <span key={key}>{item}</span>
  }

  if (Array.isArray(item)) {
    const [tagName, props, ...children] = item

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
      return <span key={key}>{children[0]}</span>
    }

    // Handle standard markdown elements
    const className = props?.className

    switch (tagName) {
      case 'p': {
        const componentOrConfig = components?.p
        if (typeof componentOrConfig === 'function') {
          const Component = componentOrConfig
          return (
            <Component key={key} {...props} className={className}>
              {renderChildren(children, key, components)}
            </Component>
          )
        } else if (componentOrConfig && typeof componentOrConfig === 'object') {
          const mergedClassName = cn(className, componentOrConfig.className)
          return (
            <p key={key} {...props} className={mergedClassName}>
              {renderChildren(children, key, components)}
            </p>
          )
        } else {
          return (
            <p key={key} {...props} className={className}>
              {renderChildren(children, key, components)}
            </p>
          )
        }
      }
      case 'h1':
        return renderHtmlElement(
          'h1',
          key,
          props,
          children,
          className,
          components?.h1,
          components,
        )
      case 'h2':
        return renderHtmlElement(
          'h2',
          key,
          props,
          children,
          className,
          components?.h2,
          components,
        )
      case 'h3':
        return renderHtmlElement(
          'h3',
          key,
          props,
          children,
          className,
          components?.h3,
          components,
        )
      case 'h4':
        return renderHtmlElement(
          'h4',
          key,
          props,
          children,
          className,
          components?.h4,
          components,
        )
      case 'h5':
        return renderHtmlElement(
          'h5',
          key,
          props,
          children,
          className,
          components?.h5,
          components,
        )
      case 'h6':
        return renderHtmlElement(
          'h6',
          key,
          props,
          children,
          className,
          components?.h6,
          components,
        )
      case 'ul':
        return renderHtmlElement(
          'ul',
          key,
          props,
          children,
          className,
          components?.ul,
          components,
        )
      case 'ol':
        return renderHtmlElement(
          'ol',
          key,
          props,
          children,
          className,
          components?.ol,
          components,
        )
      case 'li':
        return renderHtmlElement(
          'li',
          key,
          props,
          children,
          className,
          components?.li,
          components,
        )
      case 'blockquote':
        return renderHtmlElement(
          'blockquote',
          key,
          props,
          children,
          className,
          components?.blockquote,
          components,
        )
      case 'code':
        return renderHtmlElement(
          'code',
          key,
          props,
          children,
          className,
          components?.code,
          components,
        )
      case 'pre':
        return renderHtmlElement(
          'pre',
          key,
          props,
          children,
          className,
          components?.pre,
          components,
        )
      case 'strong':
        return renderHtmlElement(
          'strong',
          key,
          props,
          children,
          className,
          components?.strong,
          components,
        )
      case 'em':
        return renderHtmlElement(
          'em',
          key,
          props,
          children,
          className,
          components?.em,
          components,
        )
      case 'a': {
        const componentOrConfig = components?.a
        if (typeof componentOrConfig === 'function') {
          const Component = componentOrConfig
          return (
            <Component
              key={key}
              {...props}
              className={className}
              target="_blank"
              rel="noopener noreferrer"
            >
              {renderChildren(children, key, components)}
            </Component>
          )
        } else if (componentOrConfig && typeof componentOrConfig === 'object') {
          const mergedClassName = cn(className, componentOrConfig.className)
          return (
            <a
              key={key}
              {...props}
              className={mergedClassName}
              target="_blank"
              rel="noopener noreferrer"
            >
              {renderChildren(children, key, components)}
            </a>
          )
        } else {
          return (
            <a
              key={key}
              {...props}
              className={className}
              target="_blank"
              rel="noopener noreferrer"
            >
              {renderChildren(children, key, components)}
            </a>
          )
        }
      }
      case 'br':
        return <br key={key} />
      case 'hr': {
        const componentOrConfig = components?.hr
        if (typeof componentOrConfig === 'function') {
          const Component = componentOrConfig
          return <Component key={key} {...props} className={className} />
        } else if (componentOrConfig && typeof componentOrConfig === 'object') {
          const mergedClassName = cn(className, componentOrConfig.className)
          return <hr key={key} {...props} className={mergedClassName} />
        } else {
          return <hr key={key} {...props} className={className} />
        }
      }
      case 'div':
        return renderHtmlElement(
          'div',
          key,
          props,
          children,
          className,
          components?.div,
          components,
        )
      case 'span':
        return renderHtmlElement(
          'span',
          key,
          props,
          children,
          className,
          components?.span,
          components,
        )
      default:
        return (
          <span key={key}>{renderChildren(children, key, components)}</span>
        )
    }
  }

  return null
}

function renderChildren(
  children: any[],
  parentKey: string,
  components?: MessageProps['components'],
): React.ReactNode[] {
  return children
    .map((child, index) => {
      const key = `${parentKey}-child-${index}`
      return renderMarkdownElement(child, key, components)
    })
    .filter(Boolean)
}

/**
 * Main component for rendering v0 Platform API message content
 *
 * @example
 * ```tsx
 * import { Message } from '@v0-sdk/react'
 *
 * function MyComponent({ apiResponse }) {
 *   const content = JSON.parse(apiResponse.content)
 *
 *   return (
 *     <Message
 *       content={content}
 *       messageId={apiResponse.id}
 *       role={apiResponse.role}
 *       className="space-y-4"
 *       components={{
 *         p: ({ children, ...props }) => <p className="mb-4" {...props}>{children}</p>,
 *         h1: ({ children, ...props }) => <h1 className="mb-4 text-2xl font-bold" {...props}>{children}</h1>,
 *         CodeBlock: MyCustomCodeBlock,
 *         MathPart: MyCustomMathRenderer,
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export const Message = React.memo(MessageImpl)
