import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStreaming } from '@/contexts/streaming-context'
import useSWR, { mutate } from 'swr'

interface Chat {
  id: string
  demo?: string
  url?: string
  messages?: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    experimental_content?: any
  }>
}

interface ChatMessage {
  type: 'user' | 'assistant'
  content: string | any
  isStreaming?: boolean
  stream?: ReadableStream<Uint8Array> | null
}

export function useChat(chatId: string) {
  const router = useRouter()
  const { handoff, clearHandoff } = useStreaming()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  // Use SWR to fetch chat data
  const {
    data: currentChat,
    error,
    isLoading: isLoadingChat,
  } = useSWR<Chat>(chatId ? `/api/chats/${chatId}` : null, {
    onError: (error) => {
      console.error('Error loading chat:', error)
      // Redirect to home if chat not found
      router.push('/')
    },
    onSuccess: (chat) => {
      // Update chat history with existing messages when chat loads
      // But skip if we have a handoff (streaming from homepage) to avoid duplicates
      if (
        chat.messages &&
        chatHistory.length === 0 &&
        !(handoff.chatId === chatId && handoff.stream)
      ) {
        setChatHistory(
          chat.messages.map((msg) => ({
            type: msg.role,
            // Use experimental_content if available, otherwise fall back to plain content
            content: msg.experimental_content || msg.content,
          })),
        )
      }
    },
  })

  // Handle streaming from context (when redirected from homepage)
  useEffect(() => {
    if (handoff.chatId === chatId && handoff.stream && handoff.userMessage) {
      console.log('Continuing streaming from context for chat:', chatId)

      // Add the user message to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'user',
          content: handoff.userMessage!,
        },
      ])

      // Start streaming the assistant response
      setIsStreaming(true)
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: [],
          isStreaming: true,
          stream: handoff.stream,
        },
      ])

      // Clear the handoff immediately to prevent re-runs
      clearHandoff()
    }
  }, [chatId, handoff, clearHandoff])

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim() || isLoading || !chatId) return

    const userMessage = message.trim()
    setMessage('')
    setIsLoading(true)

    setChatHistory((prev) => [...prev, { type: 'user', content: userMessage }])

    try {
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

  const handleStreamingComplete = async (finalContent: any) => {
    setIsStreaming(false)
    setIsLoading(false)

    // Refresh chat data from server after streaming completes
    mutate(`/api/chats/${chatId}`)

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
          // Look for chat ID - be more specific about what we accept
          if (obj.chatId && typeof obj.chatId === 'string') {
            // Validate that it looks like a real chat ID (UUID-like or specific format)
            if (obj.chatId.length > 10 && obj.chatId !== 'hello-world') {
              console.log('Accepting chatId:', obj.chatId)
              newChatId = obj.chatId
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

            // Update SWR cache with new chat data
            mutate(
              `/api/chats/${newChatId}`,
              {
                id: newChatId,
                demo: demoUrl || `Generated Chat ${newChatId}`,
              },
              false,
            )
          } else {
            console.warn('Failed to fetch chat details:', response.status)
            // Update SWR cache with new chat data
            mutate(
              `/api/chats/${newChatId}`,
              {
                id: newChatId,
                demo: `Generated Chat ${newChatId}`,
              },
              false,
            )
          }
        } catch (error) {
          console.error('Error fetching chat details:', error)
          // Update SWR cache with new chat data
          mutate(
            `/api/chats/${newChatId}`,
            {
              id: newChatId,
              demo: `Generated Chat ${newChatId}`,
            },
            false,
          )
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

  const handleChatData = async (chatData: any) => {
    console.log('Received chat data from first SSE message:', chatData)
    if (chatData.id && !currentChat) {
      console.log('Fetching full chat details for demo URL...')

      try {
        // Fetch the full chat details to get the demo URL
        const response = await fetch(`/api/chats/${chatData.id}`)
        if (response.ok) {
          const chatDetails = await response.json()
          console.log('Chat details from onChatData:', chatDetails)

          const demoUrl =
            chatDetails?.latestVersion?.demoUrl || chatDetails?.demo
          console.log('Demo URL from chat details:', demoUrl)

          // Update SWR cache with new chat data
          mutate(
            `/api/chats/${chatData.id}`,
            {
              id: chatData.id,
              url: chatData.webUrl || chatData.url,
              demo: demoUrl || `Generated Chat ${chatData.id}`,
            },
            false,
          )
        } else {
          console.warn('Failed to fetch chat details:', response.status)
          // Update SWR cache with new chat data
          mutate(
            `/api/chats/${chatData.id}`,
            {
              id: chatData.id,
              url: chatData.webUrl || chatData.url,
              demo: `Generated Chat ${chatData.id}`,
            },
            false,
          )
        }
      } catch (error) {
        console.error('Error fetching chat details in onChatData:', error)
        // Update SWR cache with new chat data
        mutate(
          `/api/chats/${chatData.id}`,
          {
            id: chatData.id,
            url: chatData.webUrl || chatData.url,
            demo: `Generated Chat ${chatData.id}`,
          },
          false,
        )
      }
    }
  }

  return {
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
  }
}
