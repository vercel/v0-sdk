'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Send,
  Plus,
  Settings,
  User,
  Bot,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
} from 'lucide-react'
import { Header } from '@/components/layout/header'

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
  prompt: string
  generations: Generation[]
  selectedGeneration?: Generation
  history: HistoryItem[]
  isIterating: boolean
}

export default function Home() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGenerationIndex, setSelectedGenerationIndex] = useState(0)
  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const [user, setUser] = useState<User | null>(null)

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        const userData = await response.json()
        console.log('Received user data:', userData) // Debug log
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        // Set a default user if fetch fails
        setUser({
          id: 'default',
          name: 'User',
          email: '',
          avatarUrl: undefined,
        })
      }
    }

    fetchUser()
  }, [])

  const handleSubmitPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    const userPrompt = prompt.trim()
    setIsLoading(true)

    // Immediately show the generations screen with placeholder data
    const placeholderChat: Chat = {
      id: 'temp-' + Date.now(),
      prompt: userPrompt,
      generations: [
        { id: 'temp-a', demoUrl: 'about:blank', label: 'A' },
        { id: 'temp-b', demoUrl: 'about:blank', label: 'B' },
        { id: 'temp-c', demoUrl: 'about:blank', label: 'C' },
      ],
      selectedGeneration: { id: 'temp-a', demoUrl: 'about:blank', label: 'A' },
      history: [],
      isIterating: false,
    }

    setCurrentChat(placeholderChat)
    setSelectedGenerationIndex(0)
    setPrompt('')

    try {
      // First create a project for this prompt
      const projectResponse = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userPrompt.slice(0, 50) + (userPrompt.length > 50 ? '...' : ''),
          description: `Project for: ${userPrompt}`,
        }),
      })

      const project = await projectResponse.json()
      const projectId = project.id

      // Get random style variations for B and C
      const styleVariations = getStyleVariations()

      // Create 3 generations simultaneously with style variations
      const responses = await Promise.all([
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userPrompt + styleVariations[0],
            projectId,
          }),
        }),
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userPrompt + styleVariations[1],
            projectId,
          }),
        }),
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userPrompt + styleVariations[2],
            projectId,
          }),
        }),
      ])

      const chats = await Promise.all(responses.map((r) => r.json()))

      const newChat: Chat = {
        id: chats[0].id,
        prompt: userPrompt,
        generations: chats.map((chat, index) => ({
          id: chat.id,
          demoUrl: chat.demo,
          label: String.fromCharCode(65 + index), // A, B, C
        })),
        selectedGeneration: chats[0]
          ? {
              id: chats[0].id,
              demoUrl: chats[0].demo,
              label: 'A',
            }
          : undefined,
        history: [
          {
            id: chats[0].id + '-initial',
            prompt: userPrompt,
            demoUrl: chats[0].demo,
            timestamp: new Date(),
          },
        ],
        isIterating: false,
      }

      setCurrentChat(newChat)
      setSelectedGenerationIndex(0)

      // Redirect to project page for better routing
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Error:', error)
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    setCurrentChat(null)
    setPrompt('')
    setFollowUpPrompt('')
    setSelectedGenerationIndex(0)
  }

  const handleFollowUpPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!followUpPrompt.trim() || isLoading || !currentChat) return

    const userPrompt = followUpPrompt.trim()
    const selectedGeneration = currentChat.generations[selectedGenerationIndex]

    setIsLoading(true)
    setFollowUpPrompt('')

    try {
      // Use sendMessage to continue working on the selected generation
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          chatId: selectedGeneration.id, // Continue with the selected generation's chat
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const updatedChat = await response.json()

      // Update the selected generation with the new result
      const updatedGenerations = [...currentChat.generations]
      updatedGenerations[selectedGenerationIndex] = {
        ...selectedGeneration,
        demoUrl: updatedChat.demo,
      }

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: updatedChat.id + '-' + Date.now(),
        prompt: userPrompt,
        demoUrl: updatedChat.demo,
        timestamp: new Date(),
      }

      setCurrentChat({
        ...currentChat,
        generations: updatedGenerations,
        selectedGeneration: {
          ...selectedGeneration,
          demoUrl: updatedChat.demo,
        },
        history: [...currentChat.history, newHistoryItem],
        isIterating: true,
      })
    } catch (error) {
      console.error('Error:', error)
      // Handle error - could show a toast or error message
    } finally {
      setIsLoading(false)
    }
  }

  const selectGeneration = (index: number) => {
    if (currentChat && currentChat.generations[index]) {
      setSelectedGenerationIndex(index)
      setCurrentChat({
        ...currentChat,
        selectedGeneration: currentChat.generations[index],
      })
    }
  }

  const suggestions = [
    'A hero section for an email client app',
    'Create a responsive navbar with Tailwind CSS',
    'Build a todo app with React hooks',
    'Make a landing page for a coffee shop',
    'Design a contact form with validation',
  ]

  // Helper function to get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to generate random style variations
  const getStyleVariations = () => {
    const styles = [
      '', // Generation A: Original prompt
      ' with a modern, minimalist design style',
      ' with a vibrant, colorful design approach',
      ' with a dark, professional theme',
      ' with playful, rounded elements',
      ' with a gradient background and glass morphism',
      ' with a retro, vintage aesthetic',
      ' with bold typography and geometric shapes',
      ' with soft shadows and subtle animations',
      ' with a clean, corporate look',
    ]

    // Always keep A as original, randomize B and C
    const shuffledStyles = styles.slice(1) // Remove the empty string
    const randomB =
      shuffledStyles[Math.floor(Math.random() * shuffledStyles.length)]
    const randomC =
      shuffledStyles[Math.floor(Math.random() * shuffledStyles.length)]

    return ['', randomB, randomC]
  }

  // Modern loading spinner component
  const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
    <div className={`${className} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
    </div>
  )

  // Component for user avatar
  const UserAvatar = ({ className = 'h-8 w-8' }: { className?: string }) => {
    console.log('UserAvatar rendering with user:', user) // Debug log
    return (
      <Avatar className={className}>
        {user?.avatarUrl && (
          <AvatarImage
            src={user.avatarUrl}
            alt={user.name}
            onError={(e) =>
              console.log('Avatar image failed to load:', user.avatarUrl)
            }
            onLoad={() =>
              console.log('Avatar image loaded successfully:', user.avatarUrl)
            }
          />
        )}
        <AvatarFallback className="bg-gray-600 text-white">
          {user ? getUserInitials(user.name) : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
    )
  }

  // Show initial prompt interface
  if (!currentChat) {
    return (
      <TooltipProvider>
        <div className="h-screen bg-white flex items-center justify-center">
          <div className="w-full max-w-2xl px-8">
            <form onSubmit={handleSubmitPrompt} className="relative">
              <div className="flex items-center bg-black rounded-full pl-4 pr-4 py-2">
                {/* Avatar */}
                <UserAvatar className="h-8 w-8 mr-3 flex-shrink-0" />

                {/* Divider */}
                <div className="w-px h-5 bg-gray-600 mr-3 flex-shrink-0"></div>

                {/* Input */}
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A hero for an email client app"
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
                  disabled={isLoading}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitPrompt(e as any)
                    }
                  }}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
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
      </TooltipProvider>
    )
  }

  // Show generations interface
  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <Header user={user} prompt={currentChat.prompt} />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* History Sidebar - only show when iterating */}
          {currentChat.isIterating && (
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="border-b border-gray-200 p-4">
                <h2 className="font-semibold text-gray-900">History</h2>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {currentChat.history.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      <div className="aspect-video relative">
                        <img
                          src={`/api/screenshot?chatId=${item.id}&url=${encodeURIComponent(item.demoUrl)}`}
                          alt={`Version ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          v{index + 1}
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate">
                          {item.prompt}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Preview and Thumbnails */}
          <div className="flex-1 flex flex-col p-8">
            {/* Main Preview */}
            <div className="flex-1 mb-6 relative">
              {currentChat.generations.map((generation, index) => (
                <div
                  key={generation.id}
                  className={`absolute inset-0 w-full h-full rounded-lg border border-gray-300 overflow-hidden bg-white transition-opacity duration-200 ${
                    selectedGenerationIndex === index
                      ? 'opacity-100 z-10'
                      : 'opacity-0 z-0'
                  }`}
                >
                  <iframe
                    src={generation.demoUrl}
                    className="w-full h-full border-0"
                    title={`Generation ${generation.label} Preview`}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Section - only show thumbnails when not iterating */}
            {!currentChat.isIterating && (
              <div className="w-full max-w-5xl mx-auto">
                {/* Four items: 3 Generation Thumbnails + 1 Regenerate */}
                <div className="grid grid-cols-4 gap-6">
                  {/* Three Generation Thumbnails */}
                  {currentChat.generations.map((generation, index) => (
                    <div
                      key={generation.id}
                      className={`relative aspect-video border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedGenerationIndex === index
                          ? 'border-blue-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => selectGeneration(index)}
                    >
                      {/* Use screenshot API for thumbnails */}
                      {generation.demoUrl !== 'about:blank' ? (
                        <img
                          src={`/api/screenshot?chatId=${generation.id}&url=${encodeURIComponent(generation.demoUrl)}`}
                          alt={`Generation ${generation.label}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ModernSpinner className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div
                        className={`absolute bottom-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                          selectedGenerationIndex === index
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                        }`}
                      >
                        {generation.label}
                      </div>
                    </div>
                  ))}

                  {/* Regenerate Box */}
                  <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <RefreshCw className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">
                      Regenerate
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Prompt Bar */}
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleFollowUpPrompt}>
              <div className="flex items-center bg-black rounded-full pl-4 pr-4 py-2">
                <UserAvatar className="h-8 w-8 mr-3 flex-shrink-0" />

                <div className="w-px h-5 bg-gray-600 mr-3 flex-shrink-0"></div>

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
