import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import { MessageRenderer } from '@/components/message-renderer'
import { sharedComponents } from '@/components/shared-components'
import { StreamingMessage } from '@v0-sdk/react'

interface ChatMessage {
  type: 'user' | 'assistant'
  content: string | any
  isStreaming?: boolean
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
}

export function ChatMessages({
  chatHistory,
  isLoading,
  currentChat,
  onStreamingComplete,
  onChatData,
}: ChatMessagesProps) {
  if (chatHistory.length === 0) {
    return (
      <div className="text-center font-semibold mt-8">
        <p className="text-3xl mt-4 text-gray-900 dark:text-white">
          Continue the conversation
        </p>
      </div>
    )
  }

  return (
    <>
      <Conversation>
        <ConversationContent>
          {chatHistory.map((msg, index) => (
            <Message from={msg.type} key={index}>
              {msg.isStreaming && msg.stream ? (
                <StreamingMessage
                  stream={msg.stream}
                  messageId={`msg-${index}`}
                  role={msg.type}
                  onComplete={onStreamingComplete}
                  onChatData={onChatData}
                  onError={(error) => console.error('Streaming error:', error)}
                  components={sharedComponents}
                />
              ) : (
                <MessageRenderer
                  content={msg.content}
                  role={msg.type}
                  messageId={`msg-${index}`}
                />
              )}
            </Message>
          ))}
        </ConversationContent>
      </Conversation>
      {isLoading && (
        <Message from="assistant">
          <MessageContent>
            <div className="flex items-center gap-2">
              <Loader />
              Creating your app...
            </div>
          </MessageContent>
        </Message>
      )}
    </>
  )
}
