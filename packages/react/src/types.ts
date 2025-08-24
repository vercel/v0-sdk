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
 * Custom styling options for different content elements
 */
export interface V0MessageRendererStyles {
  /**
   * Custom classes for different element types
   */
  elements?: {
    /** Paragraph elements */
    p?: string
    /** Heading elements (h1-h6) */
    h1?: string
    h2?: string
    h3?: string
    h4?: string
    h5?: string
    h6?: string
    /** List elements */
    ul?: string
    ol?: string
    li?: string
    /** Other elements */
    blockquote?: string
    code?: string
    pre?: string
    strong?: string
    em?: string
    a?: string
    hr?: string
  }

  /**
   * Container for markdown content
   */
  markdownContainer?: string

  /**
   * Container for code blocks
   */
  codeBlockContainer?: string

  /**
   * Container for math content
   */
  mathContainer?: string

  /**
   * Container for thinking sections
   */
  thinkingContainer?: string

  /**
   * Container for task sections
   */
  taskContainer?: string

  /**
   * Container for code project artifacts
   */
  codeProjectContainer?: string
}

/**
 * Props for the V0MessageRenderer component
 */
export interface V0MessageRendererProps {
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
   * Custom styling options for different content elements
   */
  styles?: V0MessageRendererStyles
}
