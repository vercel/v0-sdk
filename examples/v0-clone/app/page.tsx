'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Github } from 'lucide-react'

import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'

export default function Home() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      // Create a new chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          responseMode: 'sync',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create chat')
      }

      const chat = await response.json()

      // Redirect to the chat page
      if (chat.id) {
        router.push(`/chats/${chat.id}`)
      } else {
        throw new Error('No chat ID returned')
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      // Reset loading state on error
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-border dark:border-input">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              v0 Clone
            </h1>
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
            </div>
          </div>
        </div>
      </div>

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
