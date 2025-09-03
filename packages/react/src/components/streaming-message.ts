import React from 'react'
import { Message, useMessage, MessageData } from './message'
import {
  useStreamingMessage,
  UseStreamingMessageOptions,
  StreamingMessageState,
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

// Headless streaming message data
export interface StreamingMessageData extends StreamingMessageState {
  messageData: MessageData | null
}

// Headless hook for streaming message
export function useStreamingMessageData({
  stream,
  messageId = 'unknown',
  role = 'assistant',
  components,
  renderers,
  onChunk,
  onComplete,
  onError,
  onChatData,
}: Omit<
  StreamingMessageProps,
  'className' | 'showLoadingIndicator' | 'loadingComponent' | 'errorComponent'
>): StreamingMessageData {
  const streamingState = useStreamingMessage(stream, {
    onChunk,
    onComplete,
    onError,
    onChatData,
  })

  const messageData =
    streamingState.content.length > 0
      ? useMessage({
          content: streamingState.content,
          messageId,
          role,
          streaming: streamingState.isStreaming,
          isLastMessage: true,
          components,
          renderers,
        })
      : null

  return {
    ...streamingState,
    messageData,
  }
}

/**
 * Component for rendering streaming message content from v0 API
 *
 * For headless usage, use the useStreamingMessageData hook instead.
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
  className,
  ...messageProps
}: StreamingMessageProps) {
  const streamingData = useStreamingMessageData({
    stream,
    onChunk,
    onComplete,
    onError,
    onChatData,
    ...messageProps,
  })

  // Handle error state
  if (streamingData.error) {
    if (errorComponent) {
      return React.createElement(
        React.Fragment,
        {},
        errorComponent(streamingData.error),
      )
    }
    // Fallback error component using React.createElement for compatibility
    return React.createElement(
      'div',
      {
        className: 'text-red-500 p-4 border border-red-200 rounded',
        style: {
          color: 'red',
          padding: '1rem',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
        },
      },
      `Error: ${streamingData.error}`,
    )
  }

  // Handle loading state
  if (
    showLoadingIndicator &&
    streamingData.isStreaming &&
    streamingData.content.length === 0
  ) {
    if (loadingComponent) {
      return React.createElement(React.Fragment, {}, loadingComponent)
    }
    // Fallback loading component using React.createElement for compatibility
    return React.createElement(
      'div',
      {
        className: 'flex items-center space-x-2 text-gray-500',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#6b7280',
        },
      },
      React.createElement('div', {
        className:
          'animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full',
        style: {
          animation: 'spin 1s linear infinite',
          height: '1rem',
          width: '1rem',
          border: '2px solid #d1d5db',
          borderTopColor: '#4b5563',
          borderRadius: '50%',
        },
      }),
      React.createElement('span', {}, 'Loading...'),
    )
  }

  // Render the message content
  return React.createElement(Message, {
    ...messageProps,
    content: streamingData.content,
    streaming: streamingData.isStreaming,
    isLastMessage: true,
    className,
  })
}
