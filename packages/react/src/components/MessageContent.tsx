import React, { type JSX } from 'react'
import {
  MessageBinaryFormat,
  V0MessageRendererProps,
  V0MessageRendererStyles,
} from '../types'
import { MathRenderer } from './MathRenderer'
import { CodeBlock } from './CodeBlock'
import { CodeProjectBlock } from './CodeProjectBlock'
import { AssistantMessageContentPart } from './AssistantMessageContentPart'
import { cn } from '../utils/cn'
import 'katex/dist/katex.min.css'

/**
 * Core renderer component for v0 Platform API message content
 */
function MessageContentImpl({
  content,
  messageId = 'unknown',
  role = 'assistant',
  streaming = false,
  isLastMessage = false,
  className,
  styles,
}: V0MessageRendererProps) {
  if (!Array.isArray(content)) {
    console.warn(
      'MessageContent: content must be an array (MessageBinaryFormat)',
    )
    return null
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
        <div
          key={key}
          className={cn('prose prose-sm max-w-none', styles?.markdownContainer)}
        >
          {markdownData.map((item: any, mdIndex: number) => {
            const mdKey = `${key}-md-${mdIndex}`
            return renderMarkdownElement(item, mdKey, styles)
          })}
        </div>
      )
    }

    // Code block (type 1)
    if (type === 1) {
      const [language, code] = data
      return styles?.codeBlockContainer ? (
        <div key={key} className={styles.codeBlockContainer}>
          <CodeBlock language={language || 'text'} code={code || ''} />
        </div>
      ) : (
        <CodeBlock key={key} language={language || 'text'} code={code || ''} />
      )
    }

    // Math (type 2 for inline, type 3 for block)
    if (type === 2 || type === 3) {
      const mathContent = data[0] || ''
      return (
        <div key={key} className={styles?.mathContainer}>
          <MathRenderer content={mathContent} inline={type === 2} />
        </div>
      )
    }

    // Unknown type - render as text for debugging
    return (
      <div key={key} className="text-gray-400 text-sm">
        [Unknown content type: {type}]
      </div>
    )
  })

  return <div className={className}>{elements}</div>
}

function renderMarkdownElement(
  item: any,
  key: string,
  styles?: V0MessageRendererStyles,
): React.ReactNode {
  if (typeof item === 'string') {
    return <span key={key}>{item}</span>
  }

  if (Array.isArray(item)) {
    const [tagName, props, ...children] = item

    // Handle special v0 Platform API elements
    if (tagName === 'AssistantMessageContentPart') {
      return (
        <AssistantMessageContentPart
          key={key}
          part={props.part}
          styles={styles}
        />
      )
    }

    if (tagName === 'Codeblock') {
      return (
        <CodeProjectBlock
          key={key}
          meta={props.meta}
          lang={props.lang}
          closed={props.closed}
          code={children[0]}
          className={styles?.codeProjectContainer}
        />
      )
    }

    if (tagName === 'text') {
      return <span key={key}>{children[0]}</span>
    }

    // Handle standard markdown elements
    const className = cn(
      props?.className,
      styles?.elements?.[tagName as keyof typeof styles.elements],
    )

    switch (tagName) {
      case 'p':
        return (
          <p key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </p>
        )
      case 'h1':
        return (
          <h1 key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </h1>
        )
      case 'h2':
        return (
          <h2 key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </h2>
        )
      case 'h3':
        return (
          <h3 key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </h3>
        )
      case 'h4':
        return (
          <h4 key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </h4>
        )
      case 'h5':
        return (
          <h5 key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </h5>
        )
      case 'h6':
        return (
          <h6 key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </h6>
        )
      case 'ul':
        return (
          <ul key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </ul>
        )
      case 'ol':
        return (
          <ol key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </ol>
        )
      case 'li':
        return (
          <li key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </li>
        )
      case 'blockquote':
        return (
          <blockquote key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </blockquote>
        )
      case 'code':
        return (
          <code key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </code>
        )
      case 'pre':
        return (
          <pre key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </pre>
        )
      case 'strong':
        return (
          <strong key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </strong>
        )
      case 'em':
        return (
          <em key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </em>
        )
      case 'a':
        return (
          <a
            key={key}
            {...props}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderChildren(children, key, styles)}
          </a>
        )
      case 'br':
        return <br key={key} />
      case 'hr':
        return <hr key={key} {...props} className={className} />
      case 'div':
        return (
          <div key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </div>
        )
      case 'span':
        return (
          <span key={key} {...props} className={className}>
            {renderChildren(children, key, styles)}
          </span>
        )
      default:
        return <span key={key}>{renderChildren(children, key, styles)}</span>
    }
  }

  return null
}

function renderChildren(
  children: any[],
  parentKey: string,
  styles?: V0MessageRendererStyles,
): React.ReactNode[] {
  return children
    .map((child, index) => {
      const key = `${parentKey}-child-${index}`
      return renderMarkdownElement(child, key, styles)
    })
    .filter(Boolean)
}

/**
 * Main component for rendering v0 Platform API message content
 *
 * @example
 * ```tsx
 * import { MessageContent } from '@v0-sdk/react'
 *
 * function MyComponent({ apiResponse }) {
 *   const content = JSON.parse(apiResponse.content)
 *
 *   return (
 *     <MessageContent
 *       content={content}
 *       messageId={apiResponse.id}
 *       role={apiResponse.role}
 *       styles={{
 *         elements: {
 *           p: 'mb-5', // 20px gap between paragraphs
 *           h1: 'mb-5 text-2xl font-bold',
 *           h2: 'mb-5 text-xl font-semibold',
 *           h3: 'mb-5 text-lg font-medium',
 *         },
 *         markdownContainer: 'space-y-5', // 20px gap between all elements
 *         codeBlockContainer: 'mb-5',
 *         mathContainer: 'mb-5',
 *         thinkingContainer: 'mb-4',
 *         taskContainer: 'mb-4',
 *         codeProjectContainer: 'mb-4',
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export const MessageContent = React.memo(MessageContentImpl)
