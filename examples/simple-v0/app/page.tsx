'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PromptComponent from './components/prompt-component'
import ApiKeyError from './components/api-key-error'
import RateLimitDialog from './components/rate-limit-dialog'
import ErrorDialog from './components/error-dialog'
import ThinkingTraces from './components/thinking-traces'
import { useApiValidation } from '../lib/hooks/useApiValidation'
import { readGenerationStream, type GenerationActivity } from '../lib/generation-stream'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chats, setChats] = useState<any[]>([])
  const [chatsLoaded, setChatsLoaded] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState('new')
  const [showRateLimitDialog, setShowRateLimitDialog] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    resetTime?: string
    remaining?: number
  }>({})
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [streamActivities, setStreamActivities] = useState<GenerationActivity[]>([])
  const [showThinkingTraces, setShowThinkingTraces] = useState(false)

  const { isValidating, showApiKeyError } = useApiValidation()

  useEffect(() => {
    if (!isValidating && !showApiKeyError) {
      loadChatsWithCache()
    }
  }, [isValidating, showApiKeyError])

  const loadChatsWithCache = async () => {
    try {
      const cachedChats = sessionStorage.getItem('chats')
      if (cachedChats) {
        setChats(JSON.parse(cachedChats))
        setChatsLoaded(true)
      }
    } catch (err) {
      // Silently handle cache loading errors
    }

    loadChats()
  }

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats')
      if (response.ok) {
        const data = await response.json()
        const chatsData = data.chats || []
        setChats(chatsData)
        setChatsLoaded(true)

        try {
          sessionStorage.setItem('chats', JSON.stringify(chatsData))
        } catch (err) {
          // Silently handle cache storage errors
        }
      } else if (response.status === 401) {
        const errorData = await response.json()
        if (errorData.error === 'API_KEY_MISSING') {
          return
        }
      }
    } catch (err) {
      // Silently handle chat loading errors
    } finally {
      setChatsLoaded(true)
    }
  }

  const handleChatChange = (newChatId: string) => {
    if (newChatId === 'new') {
      setSelectedChatId('new')
      return
    }

    setSelectedChatId(newChatId)
    router.push(`/chats/${newChatId}`)
  }

  const handleSubmit = async (
    prompt: string,
    settings: { modelId: string; imageGenerations: boolean; thinking: boolean },
    attachments?: { url: string; name?: string; type?: string }[],
  ) => {
    setIsLoading(true)
    setError(null)
    setStreamActivities([])
    setShowThinkingTraces(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          modelId: settings.modelId,
          imageGenerations: settings.imageGenerations,
          thinking: settings.thinking,
          ...(attachments && attachments.length > 0 && { attachments }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 401 && errorData.error === 'API_KEY_MISSING') {
          return Promise.reject(new Error(errorData.message || 'API key is missing'))
        }

        if (response.status === 429 && errorData.error === 'RATE_LIMIT_EXCEEDED') {
          setRateLimitInfo({
            resetTime: errorData.resetTime,
            remaining: errorData.remaining,
          })
          setShowRateLimitDialog(true)
          return Promise.reject(new Error(errorData.message || 'Rate limit exceeded'))
        }

        const message = errorData.error || 'Failed to generate app'
        setErrorMessage(message)
        setShowErrorDialog(true)
        return Promise.reject(new Error(message))
      }

      let latestChat: any = null
      let latestActivities: GenerationActivity[] = []
      const result = await readGenerationStream(response, {
        onActivities: (activities) => {
          latestActivities = activities
          setStreamActivities(activities)
        },
        onChat: (chat) => {
          latestChat = chat
        },
      })
      const data = result.chat || latestChat
      const activities =
        result.activities && result.activities.length > 0 ? result.activities : latestActivities
      const newChatId = data?.id || data?.chatId

      if (newChatId) {
        try {
          sessionStorage.removeItem('chats')
          sessionStorage.setItem(getPendingChatStorageKey(newChatId), JSON.stringify(data))
          sessionStorage.setItem(
            getPendingChatActivitiesStorageKey(newChatId),
            JSON.stringify(activities),
          )
          sessionStorage.setItem(getPendingChatThinkingOpenStorageKey(newChatId), 'true')
        } catch (err) {
          // Silently handle cache clearing errors
        }

        router.push(`/chats/${newChatId}`)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate app. Please try again.'
      setErrorMessage(message)
      setShowErrorDialog(true)
      throw err instanceof Error ? err : new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (showApiKeyError) {
    return <ApiKeyError />
  }

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4 sm:px-6" style={{ transform: 'translateY(-25%)' }}>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-pretty">
            Simple v0
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            This is a demo of the{' '}
            <a
              href="https://v0.app/docs/api/platform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-muted-foreground underline"
            >
              v0 Platform API
            </a>
            . Build your own AI app builder with programmatic access to v0's app generation
            pipeline.
          </p>
        </div>
      </div>

      <ThinkingTraces
        activities={streamActivities}
        isLoading={isLoading}
        isOpen={showThinkingTraces}
        onToggle={() => setShowThinkingTraces((open) => !open)}
      />

      <PromptComponent
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder="Describe your app..."
        showDropdowns={chatsLoaded}
        chats={chats}
        currentChatId={selectedChatId}
        onChatChange={handleChatChange}
      />

      <RateLimitDialog
        isOpen={showRateLimitDialog}
        onClose={() => setShowRateLimitDialog(false)}
        resetTime={rateLimitInfo.resetTime}
        remaining={rateLimitInfo.remaining}
      />

      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        message={errorMessage}
      />
    </div>
  )
}

function getPendingChatStorageKey(chatId: string) {
  return `simple-v0-pending-chat:${chatId}`
}

function getPendingChatActivitiesStorageKey(chatId: string) {
  return `simple-v0-pending-activities:${chatId}`
}

function getPendingChatThinkingOpenStorageKey(chatId: string) {
  return `simple-v0-pending-thinking-open:${chatId}`
}
