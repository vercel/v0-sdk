'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview'
import { Loader } from '@/components/ai-elements/loader'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { MessageRenderer } from '@/components/message-renderer'
import { sharedComponents } from '@/components/shared-components'
import { StreamingMessage } from '@v0-sdk/react'
import { RefreshCw, Monitor, Github } from 'lucide-react'

interface Chat {
  id: string
  demo?: string
  url?: string
  messages?: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    experimental_content?: any // The structured content from v0 API
  }>
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.chatId as string

  const [message, setMessage] = useState('')
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingEnabled, setStreamingEnabled] = useState(true)
  const [chatHistory, setChatHistory] = useState<
    Array<{
      type: 'user' | 'assistant'
      content: string | any // Can be string or MessageBinaryFormat
      isStreaming?: boolean
      stream?: ReadableStream<Uint8Array> | null
    }>
  >([])
  const [isLoadingChat, setIsLoadingChat] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load existing chat data
  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) return

      try {
        setIsLoadingChat(true)
        const response = await fetch(`/api/chats/${chatId}`)

        if (!response.ok) {
          throw new Error('Failed to load chat')
        }

        const chat: Chat = await response.json()
        setCurrentChat(chat)

        // Update chat history with existing messages
        if (chat.messages) {
          setChatHistory(
            chat.messages.map((msg) => ({
              type: msg.role,
              // Use experimental_content if available, otherwise fall back to plain content
              content: msg.experimental_content || msg.content,
            })),
          )
        }
      } catch (error) {
        console.error('Error loading chat:', error)
        // Redirect to home if chat not found
        router.push('/')
      } finally {
        setIsLoadingChat(false)
      }
    }

    loadChat()
  }, [chatId, router])

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim() || isLoading || !chatId) return

    const userMessage = message.trim()
    setMessage('')
    setIsLoading(true)

    setChatHistory((prev) => [...prev, { type: 'user', content: userMessage }])

    try {
      if (streamingEnabled) {
        // Use streaming mode
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            chatId: chatId,
            streaming: true,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        if (!response.body) {
          throw new Error('No response body for streaming')
        }

        setIsStreaming(true)
        setIsLoading(false) // Hide "Creating your app..." once streaming starts

        // Add placeholder for streaming response with the stream attached
        setChatHistory((prev) => [
          ...prev,
          {
            type: 'assistant',
            content: [],
            isStreaming: true,
            stream: response.body,
          },
        ])
      } else {
        // Use non-streaming mode (original behavior)
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            chatId: chatId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const chat: Chat = await response.json()
        setCurrentChat(chat)

        // Update chat history with structured content from v0 API
        if (chat.messages) {
          setChatHistory(
            chat.messages.map((msg) => ({
              type: msg.role,
              // Use experimental_content if available, otherwise fall back to plain content
              content: msg.experimental_content || msg.content,
            })),
          )
        } else {
          // Final fallback
          setChatHistory((prev) => [
            ...prev,
            {
              type: 'assistant',
              content: 'Generated new app preview. Check the preview panel!',
            },
          ])
        }
      }
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
    } finally {
      if (!streamingEnabled) {
        setIsLoading(false)
      }
    }
  }

  const handleStreamingComplete = async (finalContent: any) => {
    setIsStreaming(false)
    setIsLoading(false)

    console.log(
      'Stream completed with final content:',
      JSON.stringify(finalContent, null, 2),
    )

    // Try to extract chat ID from the final content if we don't have one yet
    if (!currentChat && finalContent && Array.isArray(finalContent)) {
      let newChatId: string | undefined

      // Search through the content structure for chat ID
      const searchForChatId = (obj: any) => {
        if (obj && typeof obj === 'object') {
          // Log any ID-like fields we find for debugging
          if (obj.chatId) {
            console.log('Found chatId field:', obj.chatId, typeof obj.chatId)
          }
          if (obj.id) {
            console.log(
              'Found id field:',
              obj.id,
              typeof obj.id,
              'context:',
              Object.keys(obj),
            )
          }

          // Look for chat ID - be more specific about what we accept
          if (obj.chatId && typeof obj.chatId === 'string') {
            // Validate that it looks like a real chat ID (UUID-like or specific format)
            if (obj.chatId.length > 10 && obj.chatId !== 'hello-world') {
              console.log('Accepting chatId:', obj.chatId)
              newChatId = obj.chatId
            } else {
              console.log(
                'Rejecting chatId:',
                obj.chatId,
                '(too short or invalid)',
              )
            }
          }

          // Only use 'id' if it's specifically a chat context and looks like a real ID
          if (!newChatId && obj.id && typeof obj.id === 'string') {
            // More restrictive check for 'id' field - should look like UUID or be longer
            if (
              (obj.id.includes('-') && obj.id.length > 20) ||
              (obj.id.length > 15 && obj.id !== 'hello-world')
            ) {
              console.log('Accepting id as chatId:', obj.id)
              newChatId = obj.id
            } else {
              console.log(
                'Rejecting id:',
                obj.id,
                '(too short or invalid format)',
              )
            }
          }

          // Recursively search in arrays and objects
          if (Array.isArray(obj)) {
            obj.forEach(searchForChatId)
          } else {
            Object.values(obj).forEach(searchForChatId)
          }
        }
      }

      finalContent.forEach(searchForChatId)

      if (newChatId) {
        console.log('Found chat ID:', newChatId)
        console.log('Fetching chat details to get demo URL...')

        try {
          // Fetch the full chat details to get the demo URL
          const response = await fetch(`/api/chats/${newChatId}`)
          if (response.ok) {
            const chatDetails = await response.json()
            console.log('Chat details:', chatDetails)

            const demoUrl =
              chatDetails?.latestVersion?.demoUrl || chatDetails?.demo
            console.log('Demo URL from chat details:', demoUrl)

            setCurrentChat({
              id: newChatId,
              demo: demoUrl || `Generated Chat ${newChatId}`,
            })
          } else {
            console.warn('Failed to fetch chat details:', response.status)
            setCurrentChat({
              id: newChatId,
              demo: `Generated Chat ${newChatId}`,
            })
          }
        } catch (error) {
          console.error('Error fetching chat details:', error)
          setCurrentChat({
            id: newChatId,
            demo: `Generated Chat ${newChatId}`,
          })
        }
      } else {
        console.log('No chat ID found in final content')
      }
    }

    // Update chat history with the final content
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

  if (isLoadingChat) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
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
    <div className="h-screen flex bg-white dark:bg-black">
      {/* Chat Panel */}
      <div className="w-1/2 flex flex-col border-r border-border dark:border-input">
        {/* Header */}
        <div className="border-b border-border dark:border-input p-3 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
            >
              ← v0 Clone
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Projects
            </Link>
            <Link
              href="https://github.com/vercel/v0-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="View v0 SDK on GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={streamingEnabled}
                onChange={(e) => setStreamingEnabled(e.target.checked)}
                className="mr-1"
              />
              Streaming
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black">
          {chatHistory.length === 0 ? (
            <div className="text-center font-semibold mt-8">
              <p className="text-3xl mt-4 text-gray-900 dark:text-white">
                Continue the conversation
              </p>
            </div>
          ) : (
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
                          onComplete={handleStreamingComplete}
                          onChatData={async (chatData) => {
                            console.log(
                              'Received chat data from first SSE message:',
                              chatData,
                            )
                            if (chatData.id && !currentChat) {
                              console.log(
                                'Fetching full chat details for demo URL...',
                              )

                              try {
                                // Fetch the full chat details to get the demo URL
                                const response = await fetch(
                                  `/api/chats/${chatData.id}`,
                                )
                                if (response.ok) {
                                  const chatDetails = await response.json()
                                  console.log(
                                    'Chat details from onChatData:',
                                    chatDetails,
                                  )

                                  const demoUrl =
                                    chatDetails?.latestVersion?.demoUrl ||
                                    chatDetails?.demo
                                  console.log(
                                    'Demo URL from chat details:',
                                    demoUrl,
                                  )

                                  setCurrentChat({
                                    id: chatData.id,
                                    url: chatData.webUrl || chatData.url,
                                    demo:
                                      demoUrl ||
                                      `Generated Chat ${chatData.id}`,
                                  })
                                } else {
                                  console.warn(
                                    'Failed to fetch chat details:',
                                    response.status,
                                  )
                                  setCurrentChat({
                                    id: chatData.id,
                                    url: chatData.webUrl || chatData.url,
                                    demo: `Generated Chat ${chatData.id}`,
                                  })
                                }
                              } catch (error) {
                                console.error(
                                  'Error fetching chat details in onChatData:',
                                  error,
                                )
                                setCurrentChat({
                                  id: chatData.id,
                                  url: chatData.webUrl || chatData.url,
                                  demo: `Generated Chat ${chatData.id}`,
                                })
                              }
                            }
                          }}
                          onError={(error) =>
                            console.error('Streaming error:', error)
                          }
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
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border dark:border-input p-4">
          {chatHistory.length === 0 && (
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
          )}
          <div className="flex gap-2">
            <PromptInput
              onSubmit={handleSendMessage}
              className="mt-4 w-full max-w-2xl mx-auto relative"
            >
              <PromptInputTextarea
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                className="pr-12 min-h-[60px]"
                placeholder="Continue the conversation..."
              />
              <PromptInputSubmit
                className="absolute bottom-1 right-1"
                disabled={!message}
                status={isLoading ? 'streaming' : 'ready'}
              />
            </PromptInput>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 flex flex-col">
        <WebPreview
          defaultUrl={currentChat?.demo || ''}
          onUrlChange={(url) => {
            // Optional: Handle URL changes if needed
            console.log('Preview URL changed:', url)
          }}
        >
          <WebPreviewNavigation>
            <WebPreviewNavigationButton
              onClick={() => {
                // Force refresh the iframe by updating the refresh key
                setRefreshKey((prev) => prev + 1)
              }}
              tooltip="Refresh preview"
              disabled={!currentChat?.demo}
            >
              <RefreshCw className="h-4 w-4" />
            </WebPreviewNavigationButton>
            <WebPreviewUrl
              readOnly
              placeholder="Your app will appear here..."
              value={currentChat?.demo || ''}
            />
          </WebPreviewNavigation>
          {currentChat?.demo ? (
            <WebPreviewBody key={refreshKey} src={currentChat.demo} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-black">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="mb-2">
                  <Monitor className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium">No preview available</p>
                <p className="text-xs">
                  Start a conversation to see your app here
                </p>
              </div>
            </div>
          )}
        </WebPreview>
      </div>
    </div>
  )
}
