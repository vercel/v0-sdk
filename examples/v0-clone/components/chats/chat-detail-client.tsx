'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppHeader } from '@/components/shared/app-header'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { PreviewPanel } from '@/components/chat/preview-panel'
import { useChat } from '@/hooks/use-chat'
import { useStreaming } from '@/contexts/streaming-context'
import { cn } from '@/lib/utils'

export function ChatDetailClient() {
  const params = useParams()
  const chatId = params.chatId as string
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { handoff } = useStreaming()
  const {
    message,
    setMessage,
    currentChat,
    isLoading,
    isStreaming,
    chatHistory,
    isLoadingChat,
    handleSendMessage,
    handleStreamingComplete,
    handleChatData,
  } = useChat(chatId)

  // Handle fullscreen keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Don't show loading if we have a handoff (streaming from homepage)
  if (isLoadingChat && !(handoff.chatId === chatId && handoff.stream)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="text-gray-600 dark:text-gray-300">
            Loading chat...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-gray-50 dark:bg-black',
        isFullscreen && 'fixed inset-0 z-50',
      )}
    >
      <AppHeader />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Chat Section */}
        <div className="w-[30%] flex flex-col border-r border-border dark:border-input">
          <ChatMessages
            chatHistory={chatHistory}
            isLoading={isLoading}
            currentChat={currentChat || null}
            onStreamingComplete={handleStreamingComplete}
            onChatData={handleChatData}
          />

          <ChatInput
            message={message}
            setMessage={setMessage}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            showSuggestions={false}
          />
        </div>

        {/* Preview Panel */}
        <PreviewPanel
          currentChat={currentChat || null}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          refreshKey={refreshKey}
          setRefreshKey={setRefreshKey}
        />
      </div>
    </div>
  )
}
