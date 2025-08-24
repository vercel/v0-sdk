/**
 * @v0-sdk/react
 *
 * React components for rendering content from the v0 Platform API
 */

// Main component
export { Message } from './components/message'

// Individual components
export { ThinkingSection } from './components/thinking-section'
export { TaskSection } from './components/task-section'
export { CodeProjectPart } from './components/code-project-part'
export { ContentPartRenderer } from './components/content-part-renderer'
export { MathPart } from './components/math-part'
export { CodeBlock } from './components/code-block'
export { Icon } from './components/icon'

// Backward compatibility - re-export with old names
export { Message as MessageRenderer } from './components/message'
export { Message as MessageContent } from './components/message'
export { Message as V0MessageRenderer } from './components/message'
export { CodeProjectPart as CodeProjectBlock } from './components/code-project-part'
export { ContentPartRenderer as AssistantMessageContentPart } from './components/content-part-renderer'
export { MathPart as MathRenderer } from './components/math-part'

// Utilities
// cn is internal only - not exported

export type {
  MessageBinaryFormat,
  MessageBinaryFormatRow,
  MessageProps,
  // Backward compatibility
  MessageRendererProps,
  V0MessageRendererProps,
  // Note: MessageStyles/MessageRendererStyles/V0MessageRendererStyles removed as styles prop is no longer supported
} from './types'

// Export component prop types for customization
export type { IconProps } from './components/icon'
export type { CodeBlockProps } from './components/code-block'
export type { MathPartProps } from './components/math-part'
export type { CodeProjectPartProps } from './components/code-project-part'
export type { ContentPartRendererProps } from './components/content-part-renderer'

// Export section component prop types
export type { ThinkingSectionProps } from './components/thinking-section'
export type { TaskSectionProps } from './components/task-section'

// Backward compatibility for prop types
export type { MathPartProps as MathRendererProps } from './components/math-part'
export type { CodeProjectPartProps as CodeProjectBlockProps } from './components/code-project-part'
