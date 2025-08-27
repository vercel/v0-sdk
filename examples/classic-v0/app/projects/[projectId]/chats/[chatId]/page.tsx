'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, CornerDownLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Preview } from '@/components/layout/preview'
import { HistorySidebar } from '@/components/layout/history-sidebar'

interface Generation {
  id: string
  demoUrl: string
  label: string
}

interface HistoryItem {
  id: string
  prompt: string
  demoUrl: string
  timestamp: Date
}

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface Chat {
  id: string
  projectId: string
  prompt: string
  generation: Generation
  history: HistoryItem[]
}

// Modern loading spinner component
const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
  </div>
)

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const chatId = params.chatId as string

  const [user, setUser] = useState<User | null>(null)
  const [chat, setChat] = useState<Chat | null>(null)
  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0)

  // Helper function to get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Component for user avatar
  const UserAvatar = ({ className = 'h-8 w-8' }: { className?: string }) => (
    <Avatar className={className}>
      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
      <AvatarFallback className="bg-gray-600 text-white">
        {user ? getUserInitials(user.name) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {}
    }
    fetchUser()
  }, [])

  // Fetch chat data
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}`)
        if (response.ok) {
          const chatData = await response.json()
          setChat(chatData)

          // Auto-select the latest version (last in the history array)
          if (chatData.history && chatData.history.length > 0) {
            const latestIndex = chatData.history.length - 1
            setSelectedVersionIndex(latestIndex)
          }
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }
    fetchChat()
  }, [chatId, projectId])

  const handleFollowUpPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!followUpPrompt.trim() || isLoading || !chat) return

    const userPrompt = followUpPrompt.trim()
    setIsLoading(true)
    setFollowUpPrompt('')

    // Immediately add a placeholder version to show loading state
    const tempId = 'temp-' + Date.now()
    const newHistoryItem: HistoryItem = {
      id: tempId,
      prompt: userPrompt,
      demoUrl: 'about:blank', // This will show the loader
      timestamp: new Date(),
    }

    // Update chat with the new loading version and select it
    const updatedHistory = [...chat.history, newHistoryItem]
    setChat({
      ...chat,
      generation: {
        id: tempId,
        demoUrl: 'about:blank',
        label: chat.generation.label,
      },
      history: updatedHistory,
    })

    // Set the new version as selected (it will be the last one)
    setSelectedVersionIndex(updatedHistory.length - 1)

    try {
      // Use sendMessage to continue working on the selected generation
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          chatId: chat.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const updatedChat = await response.json()

      // Update the placeholder with real data
      const finalHistoryItem: HistoryItem = {
        id: updatedChat.id,
        prompt: userPrompt,
        demoUrl: updatedChat.demo || 'about:blank',
        timestamp: new Date(),
      }

      // Replace the placeholder in history with real data
      const finalHistory = [...chat.history, finalHistoryItem]

      setChat({
        ...chat,
        generation: {
          id: updatedChat.id,
          demoUrl: updatedChat.demo || 'about:blank',
          label: chat.generation.label,
        },
        history: finalHistory,
      })

      // Navigate to the new chat while staying on the same project
      router.push(`/projects/${projectId}/chats/${updatedChat.id}`)
    } catch (error) {
      // Remove the placeholder on error
      setChat({
        ...chat,
        history: chat.history, // Revert to original history
      })

      // Reset selection to previous version
      setSelectedVersionIndex(chat.history.length - 1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectVersion = (index: number) => {
    if (chat && chat.history[index]) {
      const selectedVersion = chat.history[index]
      setChat({
        ...chat,
        generation: {
          ...chat.generation,
          demoUrl: selectedVersion.demoUrl,
        },
      })
    }
  }

  if (!chat) {
    return (
      <TooltipProvider>
        <div className="h-screen flex flex-col bg-white">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ModernSpinner className="h-8 w-8 mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">Loading chat...</p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <Header
          user={user}
          prompt={chat.prompt}
          projectId={projectId}
          generations={[{ id: chat.id, label: chat.generation.label }]}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {/* Main Preview Container */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 h-full">
            <div className="flex-1 w-full flex items-center justify-center min-h-[50px]">
              <div className="w-full max-w-7xl mx-auto flex items-center justify-center gap-6 h-full">
                {/* History Sidebar - positioned to the left of preview */}
                <HistorySidebar
                  chatId={chatId}
                  selectedVersionIndex={selectedVersionIndex}
                  history={chat.history}
                  onSelectVersion={(version, index) => {
                    setSelectedVersionIndex(index)
                    // Update the current generation with the selected version
                    setChat({
                      ...chat,
                      generation: {
                        ...chat.generation,
                        id: version.id,
                        demoUrl: version.demoUrl,
                      },
                    })
                  }}
                />

                <div className="flex-1 h-full">
                  <Preview
                    generations={[chat.generation]}
                    selectedGenerationIndex={0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Prompt Bar */}
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleFollowUpPrompt}>
              <div className="flex items-center bg-black rounded-full pl-4 pr-4 py-2">
                <UserAvatar className="h-8 w-8 mr-3 flex-shrink-0" />

                <div className="w-px h-6 bg-gray-600 mr-3 flex-shrink-0"></div>

                <input
                  type="text"
                  value={followUpPrompt}
                  onChange={(e) => setFollowUpPrompt(e.target.value)}
                  placeholder="Make the text larger, add a title, or change colors."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleFollowUpPrompt(e as any)
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={!followUpPrompt.trim() || isLoading}
                  className="ml-3 flex-shrink-0 p-1 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <ModernSpinner className="h-4 w-4 text-white" />
                  ) : (
                    <CornerDownLeft className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
