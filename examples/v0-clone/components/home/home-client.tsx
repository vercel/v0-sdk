'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { AppHeader } from '@/components/shared/app-header'
import { useStreaming } from '@/contexts/streaming-context'
import { StreamingMessage } from '@v0-sdk/react'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { PreviewPanel } from '@/components/chat/preview-panel'

export function HomeClient() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [chatHistory, setChatHistory] = useState<
    Array<{
      type: 'user' | 'assistant'
      content: string | any
      isStreaming?: boolean
      stream?: ReadableStream<Uint8Array> | null
    }>
  >([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
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

    // Immediately show chat interface and add user message
    setShowChatInterface(true)
    setChatHistory([
      {
        type: 'user',
        content: userMessage,
      },
    ])
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

      // Add streaming assistant response
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: [],
          isStreaming: true,
          stream: response.body,
        },
      ])
    } catch (error) {
      console.error('Error creating chat:', error)
      setIsLoading(false)
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content:
            'Sorry, there was an error processing your message. Please try again.',
        },
      ])
    }
  }

  const handleChatData = async (chatData: any) => {
    console.log('Received chat data:', chatData)
    if (chatData.id) {
      console.log('Chat ID received:', chatData.id)

      // Store the chat ID
      setCurrentChatId(chatData.id)

      // Update URL without triggering Next.js routing
      window.history.pushState(null, '', `/chats/${chatData.id}`)
    }
  }

  const handleStreamingComplete = (finalContent: any) => {
    setIsLoading(false)

    // Update chat history with final content
    setChatHistory((prev) => {
      const updated = [...prev]
      const lastIndex = updated.length - 1
      if (lastIndex >= 0 && updated[lastIndex].isStreaming) {
        updated[lastIndex] = {
          ...updated[lastIndex],
          content: finalContent,
          isStreaming: false,
          stream: undefined,
        }
      }
      return updated
    })
  }

  const handleChatSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim() || isLoading || !currentChatId) return

    const userMessage = message.trim()
    setMessage('')
    setIsLoading(true)

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { type: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChatId,
          streaming: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      setIsLoading(false)

      // Add streaming response
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: [],
          isStreaming: true,
          stream: response.body,
        },
      ])
    } catch (error) {
      console.error('Error:', error)
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content:
            'Sorry, there was an error sending your message. Please try again.',
        },
      ])
      setIsLoading(false)
    }
  }

  if (showChatInterface) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
        <AppHeader />

        <div className="flex h-[calc(100vh-64px)]">
          {/* Chat Section */}
          <div className="w-[30%] flex flex-col border-r border-border dark:border-input">
            <ChatMessages
              chatHistory={chatHistory}
              isLoading={isLoading}
              currentChat={currentChatId ? { id: currentChatId } : null}
              onStreamingComplete={handleStreamingComplete}
              onChatData={handleChatData}
            />

            <ChatInput
              message={message}
              setMessage={setMessage}
              onSubmit={handleChatSendMessage}
              isLoading={isLoading}
              showSuggestions={false}
            />
          </div>

          {/* Preview Panel */}
          <PreviewPanel
            currentChat={currentChatId ? { id: currentChatId } : null}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            refreshKey={refreshKey}
            setRefreshKey={setRefreshKey}
          />
        </div>

        {/* Hidden streaming component for initial response */}
        {chatHistory.some((msg) => msg.isStreaming && msg.stream) && (
          <div className="hidden">
            {chatHistory.map((msg, index) =>
              msg.isStreaming && msg.stream ? (
                <StreamingMessage
                  key={index}
                  stream={msg.stream}
                  messageId={`msg-${index}`}
                  role="assistant"
                  onComplete={handleStreamingComplete}
                  onChatData={handleChatData}
                  onError={(error) => {
                    console.error('Streaming error:', error)
                    setIsLoading(false)
                  }}
                />
              ) : null,
            )}
          </div>
        )}
      </div>
    )
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
