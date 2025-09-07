'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StreamingMessage } from '@v0-sdk/react'
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { AppHeader } from '@/components/shared/app-header'
import { useStreaming } from '@/contexts/streaming-context'

export function HomeClient() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingStream, setPendingStream] = useState<{
    stream: ReadableStream<Uint8Array>
    userMessage: string
  } | null>(null)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { startHandoff } = useStreaming()

  // Auto-focus the textarea on page load
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          streaming: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create chat')
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      setIsLoading(false)

      // Store the stream and user message for when we get the chatId
      setPendingStream({
        stream: response.body,
        userMessage: userMessage,
      })
    } catch (error) {
      console.error('Error creating chat:', error)
      setIsLoading(false)
    }
  }

  const handleChatData = async (chatData: any) => {
    console.log('Received chat data:', chatData)
    if (chatData.id && pendingStream) {
      console.log(
        'Starting streaming in context and redirecting to chat:',
        chatData.id,
      )

      // Store the streaming state in context
      startHandoff(chatData.id, pendingStream.stream, pendingStream.userMessage)

      // Clean up the temporary storage
      setPendingStream(null)

      // Redirect to chat page which will pick up the streaming
      router.push(`/chats/${chatData.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      <AppHeader />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What can we build together?
            </h2>
          </div>

          {/* Suggestions */}
          <div className="mb-8">
            <Suggestions>
              <Suggestion
                onClick={() => setMessage('How do I use PPR in Next.js?')}
                suggestion="How do I use PPR in Next.js?"
              />
              <Suggestion
                onClick={() =>
                  setMessage('Create a responsive navbar with Tailwind CSS')
                }
                suggestion="Create a responsive navbar with Tailwind CSS"
              />
              <Suggestion
                onClick={() => setMessage('Build a todo app with React')}
                suggestion="Build a todo app with React"
              />
              <Suggestion
                onClick={() =>
                  setMessage('Make a landing page for a coffee shop')
                }
                suggestion="Make a landing page for a coffee shop"
              />
            </Suggestions>
          </div>

          {/* Prompt Input */}
          <div className="max-w-2xl mx-auto">
            <PromptInput
              onSubmit={handleSendMessage}
              className="w-full relative"
            >
              <PromptInputTextarea
                ref={textareaRef}
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="Describe what you want to build..."
                className="pr-12 min-h-[80px] text-base"
                disabled={isLoading}
              />
              <PromptInputSubmit
                className="absolute bottom-2 right-2"
                disabled={!message.trim() || isLoading}
                status={isLoading ? 'streaming' : 'ready'}
              />
            </PromptInput>

            {isLoading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                  Creating your chat...
                </div>
              </div>
            )}

            {/* Hidden streaming component for processing the response */}
            {pendingStream && (
              <div className="hidden">
                <StreamingMessage
                  stream={pendingStream.stream}
                  messageId="homepage-stream"
                  role="assistant"
                  onChatData={handleChatData}
                  onComplete={() => {}}
                  onError={(error) => {
                    console.error('Streaming error:', error)
                    setIsLoading(false)
                    setPendingStream(null)
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Powered by <Link href="https://v0-sdk.dev">v0 SDK</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
