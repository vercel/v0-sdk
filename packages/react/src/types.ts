/**
 * Binary format for message content as returned by the v0 Platform API
 * Each row is a tuple where the first element is the type and the rest are data
 */
export type MessageBinaryFormat = [number, ...any[]][]

/**
 * Individual row in the message binary format
 */
export type MessageBinaryFormatRow = MessageBinaryFormat[number]

/**
 * Props for the Message component
 */
export interface MessageProps {
  /**
   * The parsed content from the v0 Platform API
   * This should be the JSON.parsed value of the 'content' field from API responses
   */
  content: MessageBinaryFormat

  /**
   * Optional message ID for tracking purposes
   */
  messageId?: string

  /**
   * Role of the message sender
   */
  role?: 'user' | 'assistant' | 'system' | 'tool'

  /**
   * Whether the message is currently being streamed
   */
  streaming?: boolean

  /**
   * Whether this is the last message in the conversation
   */
  isLastMessage?: boolean

  /**
   * Custom className for styling the root container
   */
  className?: string

  /**
   * Custom component renderers (react-markdown style)
   * Override specific components by name
   * Can be either a React component or an object with className for simple styling
   */
  components?: {
    // Content components
    CodeBlock?: React.ComponentType<{
      language: string
      code: string
      className?: string
    }>
    MathPart?: React.ComponentType<{
      content: string
      inline?: boolean
      className?: string
    }>
    CodeProjectPart?: React.ComponentType<{
      title?: string
      filename?: string
      code?: string
      language?: string
      collapsed?: boolean
      className?: string
    }>
    ThinkingSection?: React.ComponentType<{
      title?: string
      duration?: number
      thought?: string
      collapsed?: boolean
      onCollapse?: () => void
      className?: string
      children?: React.ReactNode
      brainIcon?: React.ReactNode
      chevronRightIcon?: React.ReactNode
      chevronDownIcon?: React.ReactNode
    }>
    TaskSection?: React.ComponentType<{
      title?: string
      type?: string
      parts?: any[]
      collapsed?: boolean
      onCollapse?: () => void
      className?: string
      children?: React.ReactNode
      taskIcon?: React.ReactNode
      chevronRightIcon?: React.ReactNode
      chevronDownIcon?: React.ReactNode
    }>
    Icon?: React.ComponentType<{
      name:
        | 'chevron-right'
        | 'chevron-down'
        | 'search'
        | 'folder'
        | 'settings'
        | 'file-text'
        | 'brain'
        | 'wrench'
      className?: string
    }>

    // HTML elements (react-markdown style)
    // Can be either a React component or an object with className
    p?:
      | React.ComponentType<React.HTMLAttributes<HTMLParagraphElement>>
      | { className?: string }
    h1?:
      | React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>
      | { className?: string }
    h2?:
      | React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>
      | { className?: string }
    h3?:
      | React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>
      | { className?: string }
    h4?:
      | React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>
      | { className?: string }
    h5?:
      | React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>
      | { className?: string }
    h6?:
      | React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>
      | { className?: string }
    ul?:
      | React.ComponentType<React.HTMLAttributes<HTMLUListElement>>
      | { className?: string }
    ol?:
      | React.ComponentType<React.HTMLAttributes<HTMLOListElement>>
      | { className?: string }
    li?:
      | React.ComponentType<React.HTMLAttributes<HTMLLIElement>>
      | { className?: string }
    blockquote?:
      | React.ComponentType<React.HTMLAttributes<HTMLQuoteElement>>
      | { className?: string }
    code?:
      | React.ComponentType<React.HTMLAttributes<HTMLElement>>
      | { className?: string }
    pre?:
      | React.ComponentType<React.HTMLAttributes<HTMLPreElement>>
      | { className?: string }
    strong?:
      | React.ComponentType<React.HTMLAttributes<HTMLElement>>
      | { className?: string }
    em?:
      | React.ComponentType<React.HTMLAttributes<HTMLElement>>
      | { className?: string }
    a?:
      | React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>
      | { className?: string }
    hr?:
      | React.ComponentType<React.HTMLAttributes<HTMLHRElement>>
      | { className?: string }
    div?:
      | React.ComponentType<React.HTMLAttributes<HTMLDivElement>>
      | { className?: string }
    span?:
      | React.ComponentType<React.HTMLAttributes<HTMLSpanElement>>
      | { className?: string }
  }

  /**
   * @deprecated Use `components` instead. Will be removed in next major version.
   */
  renderers?: {
    CodeBlock?: React.ComponentType<{
      language: string
      code: string
      className?: string
    }>
    MathRenderer?: React.ComponentType<{
      content: string
      inline?: boolean
      className?: string
    }>
    MathPart?: React.ComponentType<{
      content: string
      inline?: boolean
      className?: string
    }>
    Icon?: React.ComponentType<{
      name:
        | 'chevron-right'
        | 'chevron-down'
        | 'search'
        | 'folder'
        | 'settings'
        | 'file-text'
        | 'brain'
        | 'wrench'
      className?: string
    }>
  }
}

// Backward compatibility exports
export type MessageRendererProps = MessageProps
export type V0MessageRendererProps = MessageProps
// Note: MessageStyles/MessageRendererStyles/V0MessageRendererStyles removed as styles prop is no longer supported
