/**
 * @v0-sdk/react
 *
 * Headless React components and hooks for rendering content from the v0 Platform API
 */

// Main component
export { Message } from './components/message'
export { StreamingMessage } from './components/streaming-message'

// Individual components
export { ThinkingSection } from './components/thinking-section'
export { TaskSection } from './components/task-section'
export { CodeProjectPart } from './components/code-project-part'
export { ContentPartRenderer } from './components/content-part-renderer'
export { MathPart } from './components/math-part'
export { CodeBlock } from './components/code-block'
export { Icon, IconProvider } from './components/icon'

// Headless hooks (new)
export { useMessage } from './components/message'
export { useStreamingMessageData } from './components/streaming-message'
export { useThinkingSection } from './components/thinking-section'
export { useTaskSection } from './components/task-section'
export { useCodeProject } from './components/code-project-part'
export { useContentPart } from './components/content-part-renderer'
export { useMath } from './components/math-part'
export { useCodeBlock } from './components/code-block'
export { useIcon } from './components/icon'

// Backward compatibility - re-export with old names
export { Message as MessageRenderer } from './components/message'
export { Message as MessageContent } from './components/message'
export { Message as V0MessageRenderer } from './components/message'
export { CodeProjectPart as CodeProjectBlock } from './components/code-project-part'
export { ContentPartRenderer as AssistantMessageContentPart } from './components/content-part-renderer'
export { MathPart as MathRenderer } from './components/math-part'

// Hooks
export { useStreamingMessage } from './hooks/use-streaming-message'

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
export type { StreamingMessageProps } from './components/streaming-message'

// Export section component prop types
export type { ThinkingSectionProps } from './components/thinking-section'
export type { TaskSectionProps } from './components/task-section'

// Export hook types
export type {
  StreamingMessageState,
  UseStreamingMessageOptions,
} from './hooks/use-streaming-message'

// Export headless data types (new)
export type { MessageData, MessageElement } from './components/message'
export type { StreamingMessageData } from './components/streaming-message'
export type { ThinkingSectionData } from './components/thinking-section'
export type { TaskSectionData, TaskPartData } from './components/task-section'
export type { CodeProjectData } from './components/code-project-part'
export type { ContentPartData } from './components/content-part-renderer'
export type { MathData } from './components/math-part'
export type { CodeBlockData } from './components/code-block'
export type { IconData } from './components/icon'

// Backward compatibility for prop types
export type { MathPartProps as MathRendererProps } from './components/math-part'
export type { CodeProjectPartProps as CodeProjectBlockProps } from './components/code-project-part'
