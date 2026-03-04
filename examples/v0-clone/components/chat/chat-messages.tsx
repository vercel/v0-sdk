import React, { useRef, useEffect } from 'react'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import { cn } from '@/lib/utils'
import { MessageRenderer } from '@/components/message-renderer'
import { sharedComponents } from '@/components/shared-components'
import { StreamingMessage } from '@v0-sdk/react'

interface ChatMessage {
  type: 'user' | 'assistant'
  content: string | any
  isStreaming?: boolean
  isError?: boolean
  stream?: ReadableStream<Uint8Array> | null
}

interface Chat {
  id: string
  demo?: string
  url?: string
}

interface ChatMessagesProps {
  chatHistory: ChatMessage[]
  isLoading: boolean
  currentChat: Chat | null
  onStreamingComplete: (finalContent: any) => void
  onChatData: (chatData: any) => void
  onStreamingStarted?: () => void
}

const USER_BUBBLE_BACKGROUND =
  'linear-gradient(in oklab 180deg, oklab(100% 0 0 / 50%) 0%, oklab(100% 0 0 / 0%) 100%), linear-gradient(in oklab 90deg, oklab(85.2% 0.091 -0.077 / 90%) 0%, oklab(85.2% 0.091 -0.077 / 90%) 100%)'

const ASSISTANT_BUBBLE_BACKGROUND =
  'linear-gradient(in oklab 180deg, oklab(100% 0 0 / 50%) 0%, oklab(100% 0 0 / 0%) 100%), linear-gradient(in oklab 90deg, oklab(92% -0.071 0.158) 0%, oklab(92% -0.071 0.158) 100%)'

export function ChatMessages({
  chatHistory,
  isLoading,
  currentChat,
  onStreamingComplete,
  onChatData,
  onStreamingStarted,
}: ChatMessagesProps) {
  const streamingStartedRef = useRef(false)

  // Reset the streaming started flag when a new message starts loading
  useEffect(() => {
    if (isLoading) {
      streamingStartedRef.current = false
    }
  }, [isLoading])

  if (chatHistory.length === 0) {
    return (
      <Conversation>
        <ConversationContent>
          <div>
            {/* Empty conversation - messages will appear here when they load */}
          </div>
        </ConversationContent>
      </Conversation>
    )
  }

  return (
    <>
      <Conversation>
        <ConversationContent>
          {chatHistory.map((msg, index) => {
            const isUser = msg.type === 'user'
            const isError = !isUser && Boolean(msg.isError)

            return (
              <Message from={msg.type} key={index}>
                <MessageContent
                  className={cn(
                    isUser ? 'text-right text-[#5E405D]' : 'text-left',
                    !isUser &&
                      (isError
                        ? 'chat-message-bubble-error text-[#5B1111]'
                        : 'text-[#162C12B3]'),
                  )}
                  style={{
                    backgroundImage: isUser
                      ? USER_BUBBLE_BACKGROUND
                      : isError
                        ? undefined
                        : ASSISTANT_BUBBLE_BACKGROUND,
                  }}
                >
                  <div>
                    {msg.isStreaming && msg.stream ? (
                      <StreamingMessage
                        stream={msg.stream}
                        messageId={`msg-${index}`}
                        role={msg.type}
                        onComplete={onStreamingComplete}
                        onChatData={onChatData}
                        onChunk={() => {
                          // Hide external loader once we start receiving content (only once)
                          if (
                            onStreamingStarted &&
                            !streamingStartedRef.current
                          ) {
                            streamingStartedRef.current = true
                            onStreamingStarted()
                          }
                        }}
                        onError={(error) =>
                          console.error('Streaming error:', error)
                        }
                        components={sharedComponents}
                        showLoadingIndicator={false}
                      />
                    ) : (
                      <MessageRenderer
                        content={msg.content}
                        role={msg.type}
                        messageId={`msg-${index}`}
                      />
                    )}
                  </div>
                </MessageContent>
              </Message>
            )
          })}
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader size={16} className="text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </ConversationContent>
      </Conversation>
    </>
  )
}
