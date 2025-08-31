import React from 'react'
import { Message } from './message'
import {
  useStreamingMessage,
  UseStreamingMessageOptions,
} from '../hooks/use-streaming-message'
import { MessageProps } from '../types'

export interface StreamingMessageProps
  extends Omit<MessageProps, 'content' | 'streaming' | 'isLastMessage'>,
    UseStreamingMessageOptions {
  /**
   * The streaming response from v0.chats.create() with responseMode: 'experimental_stream'
   */
  stream: ReadableStream<Uint8Array> | null

  /**
   * Show a loading indicator while no content has been received yet
   */
  showLoadingIndicator?: boolean

  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode

  /**
   * Custom error component
   */
  errorComponent?: (error: string) => React.ReactNode
}

/**
 * Component for rendering streaming message content from v0 API
 *
 * @example
 * ```tsx
 * import { v0 } from 'v0-sdk'
 * import { StreamingMessage } from '@v0-sdk/react'
 *
 * function ChatDemo() {
 *   const [stream, setStream] = useState<ReadableStream<Uint8Array> | null>(null)
 *
 *   const handleSubmit = async () => {
 *     const response = await v0.chats.create({
 *       message: 'Create a button component',
 *       responseMode: 'experimental_stream'
 *     })
 *     setStream(response)
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleSubmit}>Send Message</button>
 *       {stream && (
 *         <StreamingMessage
 *           stream={stream}
 *           messageId="demo-message"
 *           role="assistant"
 *           onComplete={(content) => handleCompletion(content)}
 *           onChatData={(chatData) => handleChatData(chatData)}
 *         />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function StreamingMessage({
  stream,
  showLoadingIndicator = true,
  loadingComponent,
  errorComponent,
  onChunk,
  onComplete,
  onError,
  onChatData,
  ...messageProps
}: StreamingMessageProps) {
  const { content, isStreaming, error, isComplete } = useStreamingMessage(
    stream,
    {
      onChunk,
      onComplete,
      onError,
      onChatData,
    },
  )

  // Handle error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent(error)}</>
    }
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded">
        Error: {error}
      </div>
    )
  }

  // Handle loading state
  if (showLoadingIndicator && isStreaming && content.length === 0) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        <span>Loading...</span>
      </div>
    )
  }

  // Render the message content
  return (
    <Message
      {...messageProps}
      content={content}
      streaming={isStreaming}
      isLastMessage={true}
    />
  )
}
