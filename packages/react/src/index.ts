/**
 * @v0-sdk/react
 *
 * React components for rendering content from the v0 Platform API
 */

// Main component (new name)
export { MessageContent } from './components/MessageContent'

// Individual components
export { ThinkingSection } from './components/ThinkingSection'
export { TaskSection } from './components/TaskSection'
export { CodeProjectBlock } from './components/CodeProjectBlock'
export { AssistantMessageContentPart } from './components/AssistantMessageContentPart'
export { MathRenderer } from './components/MathRenderer'
export { CodeBlock } from './components/CodeBlock'
export { Icon } from './components/Icon'

// Backward compatibility - re-export MessageContent as V0MessageRenderer
export { MessageContent as V0MessageRenderer } from './components/MessageContent'

// Utilities
export { cn } from './utils/cn'

export type {
  MessageBinaryFormat,
  MessageBinaryFormatRow,
  V0MessageRendererProps,
  V0MessageRendererStyles,
} from './types'
