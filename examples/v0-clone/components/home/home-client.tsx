'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  PromptInput,
  PromptInputImageButton,
  PromptInputImagePreview,
  PromptInputMicButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  createImageAttachment,
  createImageAttachmentFromStored,
  savePromptToStorage,
  loadPromptFromStorage,
  clearPromptFromStorage,
  type ImageAttachment,
} from '@/components/ai-elements/prompt-input'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { AppHeader } from '@/components/shared/app-header'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { PreviewPanel } from '@/components/chat/preview-panel'
import { ResizableLayout } from '@/components/shared/resizable-layout'
import { BottomToolbar } from '@/components/shared/bottom-toolbar'

type UIStateMode =
  | 'auto'
  | 'landing'
  | 'chat-empty'
  | 'chat-messages'
  | 'chat-messages-filled'
  | 'chat-loading'
  | 'chat-error'
  | 'chat-preview'

type ChatMessage = {
  type: 'user' | 'assistant'
  content: string | any
  isStreaming?: boolean
  isError?: boolean
  stream?: ReadableStream<Uint8Array> | null
}

type Chat = {
  id: string
  demo?: string
}

type CursorPreset = 'system' | 'frutiger-aero' | 'roundy-normal'
type LayoutMode = 'chat+artifact' | 'chat' | 'artifact'

type DevControlsState = {
  layoutMode: LayoutMode
  uiState: UIStateMode
  cursorPreset: CursorPreset
}

const HomeDevControls =
  process.env.NODE_ENV === 'development'
    ? dynamic(
        () =>
          import('./home-dev-controls').then((module) => module.HomeDevControls),
        { ssr: false },
      )
    : null

const CURSOR_PRESETS: Record<
  CursorPreset,
  { defaultCursor: string; pointerCursor: string }
> = {
  system: {
    defaultCursor: 'auto',
    pointerCursor: 'pointer',
  },
  'frutiger-aero': {
    defaultCursor: "url('/cursors/frutiger-aero-default.cur') 0 0, auto",
    pointerCursor: "url('/cursors/frutiger-aero-pointer.cur') 0 0, pointer",
  },
  'roundy-normal': {
    defaultCursor: "url('/cursors/roundy-normal.cur') 0 0, auto",
    pointerCursor: "url('/cursors/roundy-normal.cur') 0 0, pointer",
  },
}

const MOCK_CHAT_BY_STATE: Record<
  Exclude<UIStateMode, 'auto' | 'landing'>,
  ChatMessage[]
> = {
  'chat-empty': [],
  'chat-messages': [
    { type: 'user', content: 'Build a pricing page for my SaaS app.' },
    {
      type: 'assistant',
      content:
        'I created a responsive pricing layout with Starter, Pro, and Enterprise tiers.',
    },
  ],
  'chat-messages-filled': [
    { type: 'user', content: 'Help me design a todo app landing page.' },
    {
      type: 'assistant',
      content:
        'Started with a bold hero, concise feature bullets, and a focused call to action.',
    },
    { type: 'user', content: 'Can you make the hero copy shorter?' },
    {
      type: 'assistant',
      content:
        'Updated. New headline: "Plan less. Finish more." with a one-line subheading.',
    },
    { type: 'user', content: 'Add a testimonials section under features.' },
    {
      type: 'assistant',
      content:
        'Added three testimonials with names, roles, and compact profile cards.',
    },
    {
      type: 'user',
      content: 'Switch the accent color from blue to emerald.',
    },
    {
      type: 'assistant',
      content:
        'Color tokens now use emerald shades for buttons, badges, and links.',
    },
    {
      type: 'user',
      content: 'Make sure the pricing cards stack nicely on mobile.',
    },
    {
      type: 'assistant',
      content:
        'Adjusted breakpoints so cards become a single-column stack below 768px.',
    },
    {
      type: 'user',
      content: 'Please include one highlighted "Pro" plan.',
    },
    {
      type: 'assistant',
      content:
        'Pro plan now has a stronger border, subtle glow, and "Most Popular" badge.',
    },
    {
      type: 'user',
      content: 'Can we add a FAQ with six common questions?',
    },
    {
      type: 'assistant',
      content:
        'Added an accordion FAQ section with six entries and smooth open/close states.',
    },
    { type: 'user', content: 'Tighten spacing between feature rows.' },
    {
      type: 'assistant',
      content:
        'Reduced vertical gaps and aligned icon-text rows for better scan speed.',
    },
    {
      type: 'user',
      content: 'Show a simple footer with links for pricing, docs, and support.',
    },
    {
      type: 'assistant',
      content:
        'Footer added with three links, copyright text, and a compact mobile layout.',
    },
    { type: 'user', content: 'Looks good. Final pass for readability?' },
    {
      type: 'assistant',
      content:
        'Complete. Increased body contrast slightly and normalized heading line lengths for easier reading.',
    },
  ],
  'chat-loading': [
    {
      type: 'user',
      content: 'Generate a dashboard with analytics cards and charts.',
    },
  ],
  'chat-error': [
    {
      type: 'user',
      content: 'Create an admin panel with user management.',
    },
    {
      type: 'assistant',
      isError: true,
      content:
        'Sorry, there was an error processing your message. Please try again.',
    },
  ],
  'chat-preview': [
    {
      type: 'user',
      content: 'Build a hero section for a fintech landing page.',
    },
    {
      type: 'assistant',
      content: 'Done. I prepared a preview with a clean hero and CTA.',
    },
  ],
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function SearchParamsHandler({ onReset }: { onReset: () => void }) {
  const searchParams = useSearchParams()

  // Reset UI when reset parameter is present
  useEffect(() => {
    const reset = searchParams.get('reset')
    if (reset === 'true') {
      onReset()

      // Remove the reset parameter from URL without triggering navigation
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('reset')
      window.history.replaceState({}, '', newUrl.pathname)
    }
  }, [searchParams, onReset])

  return null
}

export function HomeClient() {
  const isLocalDesignDebug = process.env.NODE_ENV === 'development'
  const [devControls, setDevControls] = useState<DevControlsState>({
    layoutMode: 'chat+artifact',
    uiState: 'chat-messages',
    cursorPreset: 'system',
  })
  const layoutMode = isLocalDesignDebug ? devControls.layoutMode : 'chat+artifact'
  const uiState = isLocalDesignDebug ? devControls.uiState : 'auto'
  const cursorPreset = isLocalDesignDebug ? devControls.cursorPreset : 'system'
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [attachments, setAttachments] = useState<ImageAttachment[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activePanel, setActivePanel] = useState<'chat' | 'preview'>('chat')
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isUIStateControlled = uiState !== 'auto'
  const forcedPanel = layoutMode === 'artifact' ? 'preview' : 'chat'
  const isSinglePanelMode = layoutMode !== 'chat+artifact'
  const activeResizablePanel =
    (isSinglePanelMode ? forcedPanel : activePanel) === 'chat'
      ? 'left'
      : 'right'
  const displayShowChatInterface =
    uiState === 'auto' ? showChatInterface : uiState !== 'landing'
  const displayIsLoading =
    uiState === 'auto' ? isLoading : uiState === 'chat-loading'
  const displayChatHistory =
    uiState === 'auto'
      ? chatHistory
      : uiState === 'landing'
        ? []
        : MOCK_CHAT_BY_STATE[
            uiState as Exclude<UIStateMode, 'auto' | 'landing'>
          ]
  const displayCurrentChat =
    uiState === 'auto'
      ? currentChat
      : uiState === 'chat-preview'
        ? {
            id: 'preview-mock-chat',
            demo: 'https://example.com',
          }
        : null

  useEffect(() => {
    if (isSinglePanelMode) {
      setActivePanel(forcedPanel)
    }
  }, [isSinglePanelMode, forcedPanel])

  useEffect(() => {
    const preset =
      CURSOR_PRESETS[cursorPreset as CursorPreset] ?? CURSOR_PRESETS.system
    const root = document.documentElement

    root.style.setProperty('--app-cursor-default', preset.defaultCursor)
    root.style.setProperty('--app-cursor-pointer', preset.pointerCursor)

    return () => {
      root.style.removeProperty('--app-cursor-default')
      root.style.removeProperty('--app-cursor-pointer')
    }
  }, [cursorPreset])

  const handleReset = () => {
    // Reset all chat-related state
    setShowChatInterface(false)
    setChatHistory([])
    setCurrentChatId(null)
    setCurrentChat(null)
    setMessage('')
    setAttachments([])
    setIsLoading(false)
    setIsFullscreen(false)
    setRefreshKey((prev) => prev + 1)

    // Clear any stored data
    clearPromptFromStorage()

    // Focus textarea after reset
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 0)
  }

  // Auto-focus the textarea on page load and restore from sessionStorage
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }

    // Restore prompt data from sessionStorage
    const storedData = loadPromptFromStorage()
    if (storedData) {
      setMessage(storedData.message)
      if (storedData.attachments.length > 0) {
        const restoredAttachments = storedData.attachments.map(
          createImageAttachmentFromStored,
        )
        setAttachments(restoredAttachments)
      }
    }
  }, [])

  // Save prompt data to sessionStorage whenever message or attachments change
  useEffect(() => {
    if (message.trim() || attachments.length > 0) {
      savePromptToStorage(message, attachments)
    } else {
      // Clear sessionStorage if both message and attachments are empty
      clearPromptFromStorage()
    }
  }, [message, attachments])

  // Image attachment handlers
  const handleImageFiles = async (files: File[]) => {
    try {
      const newAttachments = await Promise.all(
        files.map((file) => createImageAttachment(file)),
      )
      setAttachments((prev) => [...prev, ...newAttachments])
    } catch (error) {
      console.error('Error processing image files:', error)
    }
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id))
  }

  const handleDragOver = () => {
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = () => {
    setIsDragOver(false)
  }

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>,
    attachmentUrls?: Array<{ url: string }>,
  ) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    const currentAttachmentUrls =
      attachmentUrls && attachmentUrls.length > 0
        ? attachmentUrls
        : attachments.map((att) => ({ url: att.dataUrl }))

    // Clear sessionStorage immediately upon submission
    clearPromptFromStorage()

    setMessage('')
    setAttachments([])

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
          ...(currentAttachmentUrls.length > 0 && {
            attachments: currentAttachmentUrls,
          }),
        }),
      })

      if (!response.ok) {
        // Try to get the specific error message from the response
        let errorMessage =
          'Sorry, there was an error processing your message. Please try again.'
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (response.status === 429) {
            errorMessage =
              'You have exceeded your maximum number of messages for the day. Please try again later.'
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
          if (response.status === 429) {
            errorMessage =
              'You have exceeded your maximum number of messages for the day. Please try again later.'
          }
        }
        throw new Error(errorMessage)
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

      // Use the specific error message if available, otherwise fall back to generic message
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Sorry, there was an error processing your message. Please try again.'

      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          isError: true,
          content: errorMessage,
        },
      ])
    }
  }

  const handleChatData = async (chatData: any) => {
    if (chatData.id) {
      // Only set currentChat if it's not already set or if this is the main chat object
      if (!currentChatId || chatData.object === 'chat') {
        setCurrentChatId(chatData.id)
        setCurrentChat({ id: chatData.id })

        // Update URL without triggering Next.js routing
        window.history.pushState(null, '', `/chats/${chatData.id}`)
      }

      // Create ownership record for new chat (only if this is a new chat)
      if (!currentChatId) {
        try {
          await fetch('/api/chat/ownership', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: chatData.id,
            }),
          })
        } catch (error) {
          console.error('Failed to create chat ownership:', error)
          // Don't fail the UI if ownership creation fails
        }
      }
    }
  }

  const handleStreamingComplete = async (finalContent: any) => {
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

    // Fetch demo URL after streaming completes
    // Use the current state by accessing it in the state updater
    setCurrentChat((prevCurrentChat) => {
      if (prevCurrentChat?.id) {
        // Fetch demo URL asynchronously
        fetch(`/api/chats/${prevCurrentChat.id}`)
          .then((response) => {
            if (response.ok) {
              return response.json()
            } else {
              console.warn('Failed to fetch chat details:', response.status)
              return null
            }
          })
          .then((chatDetails) => {
            if (chatDetails) {
              const demoUrl =
                chatDetails?.latestVersion?.demoUrl || chatDetails?.demo

              // Update the current chat with demo URL
              if (demoUrl) {
                setCurrentChat((prev) =>
                  prev ? { ...prev, demo: demoUrl } : null,
                )
                if (window.innerWidth < 768) {
                  setActivePanel('preview')
                }
              }
            }
          })
          .catch((error) => {
            console.error('Error fetching demo URL:', error)
          })
      }

      // Return the current state unchanged for now
      return prevCurrentChat
    })
  }

  const handleChatSendMessage = async (
    e: React.FormEvent<HTMLFormElement>,
    attachmentUrls?: Array<{ url: string }>,
  ) => {
    if (!currentChatId) {
      return handleSendMessage(e, attachmentUrls)
    }

    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    const currentAttachmentUrls = attachmentUrls ?? []
    setMessage('')
    setAttachments([])
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
          ...(currentAttachmentUrls.length > 0 && {
            attachments: currentAttachmentUrls,
          }),
        }),
      })

      if (!response.ok) {
        // Try to get the specific error message from the response
        let errorMessage =
          'Sorry, there was an error processing your message. Please try again.'
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (response.status === 429) {
            errorMessage =
              'You have exceeded your maximum number of messages for the day. Please try again later.'
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
          if (response.status === 429) {
            errorMessage =
              'You have exceeded your maximum number of messages for the day. Please try again later.'
          }
        }
        throw new Error(errorMessage)
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

      // Use the specific error message if available, otherwise fall back to generic message
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Sorry, there was an error processing your message. Please try again.'

      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          isError: true,
          content: errorMessage,
        },
      ])
      setIsLoading(false)
    }
  }

  if (displayShowChatInterface) {
    return (
      <div className="min-h-screen app-page-background flex flex-col">
        {HomeDevControls ? <HomeDevControls onChange={setDevControls} /> : null}
        {/* Handle search params with Suspense boundary */}
        <Suspense fallback={null}>
          <SearchParamsHandler onReset={handleReset} />
        </Suspense>

        <AppHeader />

        <div className="flex flex-col h-[calc(100vh-64px-40px)] md:h-[calc(100vh-64px)]">
          <ResizableLayout
            className="flex-1 min-h-0"
            singlePanelMode={isSinglePanelMode}
            activePanel={activeResizablePanel}
            leftPanel={
              <div className="flex h-full min-w-0 flex-col">
                <div className="relative flex-1 min-h-0">
                  <div className="pointer-events-none absolute bottom-2 left-0 z-0 flex items-end pl-1 sm:pl-2 md:pl-3 lg:pl-4">
                    <img
                      src="/character.png"
                      alt=""
                      aria-hidden="true"
                      className="h-auto w-[130px] sm:w-[150px] md:w-[180px] lg:w-[210px] opacity-100"
                    />
                  </div>

                  <div className="relative z-10 flex h-full min-h-0 flex-col pl-[84px] sm:pl-[102px] md:pl-[124px] lg:pl-[146px]">
                    <ChatMessages
                      chatHistory={displayChatHistory}
                      isLoading={displayIsLoading}
                      currentChat={displayCurrentChat}
                      onStreamingComplete={handleStreamingComplete}
                      onChatData={handleChatData}
                      onStreamingStarted={() => {
                        if (!isUIStateControlled) {
                          setIsLoading(false)
                        }
                      }}
                    />
                  </div>
                </div>

                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSubmit={handleChatSendMessage}
                  isLoading={displayIsLoading}
                  showSuggestions={false}
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                  textareaRef={textareaRef}
                />
              </div>
            }
            rightPanel={
              <PreviewPanel
                currentChat={displayCurrentChat}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                refreshKey={refreshKey}
                setRefreshKey={setRefreshKey}
              />
            }
          />

          {!isSinglePanelMode && (
            <div className="md:hidden">
              <BottomToolbar
                activePanel={activePanel}
                onPanelChange={setActivePanel}
                hasPreview={!!displayCurrentChat}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen app-page-background flex flex-col">
      {HomeDevControls ? <HomeDevControls onChange={setDevControls} /> : null}
      {/* Handle search params with Suspense boundary */}
      <Suspense fallback={null}>
        <SearchParamsHandler onReset={handleReset} />
      </Suspense>

      <AppHeader />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What can we build together?
            </h2>
          </div>

          {/* Prompt Input */}
          <div className="max-w-2xl mx-auto">
            <PromptInput
              onSubmit={handleSendMessage}
              className="w-full relative"
              onImageDrop={handleImageFiles}
              isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <PromptInputImagePreview
                attachments={attachments}
                onRemove={handleRemoveAttachment}
              />
              <PromptInputTextarea
                ref={textareaRef}
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="Describe what you want to build..."
                className="min-h-[80px] text-base"
                disabled={isLoading}
              />
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputImageButton
                    onImageSelect={handleImageFiles}
                    disabled={isLoading}
                  />
                </PromptInputTools>
                <PromptInputTools>
                  <PromptInputMicButton
                    onTranscript={(transcript) => {
                      setMessage(
                        (prev) => prev + (prev ? ' ' : '') + transcript,
                      )
                    }}
                    onError={(error) => {
                      console.error('Speech recognition error:', error)
                    }}
                    disabled={isLoading}
                  />
                  <PromptInputSubmit
                    disabled={!message.trim() || isLoading}
                    status={isLoading ? 'streaming' : 'ready'}
                  />
                </PromptInputTools>
              </PromptInputToolbar>
            </PromptInput>
          </div>

          {/* Suggestions */}
          <div className="mt-4 max-w-2xl mx-auto">
            <Suggestions>
              <Suggestion
                onClick={() => {
                  setMessage('Landing page')
                  // Submit after setting message
                  setTimeout(() => {
                    const form = textareaRef.current?.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 0)
                }}
                suggestion="Landing page"
              />
              <Suggestion
                onClick={() => {
                  setMessage('Todo app')
                  // Submit after setting message
                  setTimeout(() => {
                    const form = textareaRef.current?.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 0)
                }}
                suggestion="Todo app"
              />
              <Suggestion
                onClick={() => {
                  setMessage('Dashboard')
                  // Submit after setting message
                  setTimeout(() => {
                    const form = textareaRef.current?.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 0)
                }}
                suggestion="Dashboard"
              />
              <Suggestion
                onClick={() => {
                  setMessage('Blog')
                  // Submit after setting message
                  setTimeout(() => {
                    const form = textareaRef.current?.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 0)
                }}
                suggestion="Blog"
              />
              <Suggestion
                onClick={() => {
                  setMessage('E-commerce')
                  // Submit after setting message
                  setTimeout(() => {
                    const form = textareaRef.current?.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 0)
                }}
                suggestion="E-commerce"
              />
              <Suggestion
                onClick={() => {
                  setMessage('Portfolio')
                  // Submit after setting message
                  setTimeout(() => {
                    const form = textareaRef.current?.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 0)
                }}
                suggestion="Portfolio"
              />
              <Suggestion
                onClick={() => {
                  setMessage('Chat app')
                  // Submit after setting message
                  setTimeout(() => {
                    const form = textareaRef.current?.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 0)
                }}
                suggestion="Chat app"
              />
              <Suggestion
                onClick={() => {
                  setMessage('Calculator')
                  // Submit after setting message
                  setTimeout(() => {
                    const form = textareaRef.current?.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }, 0)
                }}
                suggestion="Calculator"
              />
            </Suggestions>
          </div>

          {/* Footer */}
          <div className="mt-8 md:mt-16 text-center text-sm text-muted-foreground">
            <p>
              Powered by{' '}
              <Link
                href="https://v0-sdk.dev"
                className="text-foreground hover:underline"
              >
                v0 SDK
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
