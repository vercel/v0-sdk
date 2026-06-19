'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PromptComponent from '../../components/prompt-component'
import ApiKeyError from '../../components/api-key-error'
import RateLimitDialog from '../../components/rate-limit-dialog'
import ErrorDialog from '../../components/error-dialog'
import ThinkingTraces from '../../components/thinking-traces'
import { useApiValidation } from '../../../lib/hooks/useApiValidation'
import { readGenerationStream, type GenerationActivity } from '../../../lib/generation-stream'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.chatId as string

  const [isLoading, setIsLoading] = useState(false)
  const [generatedApp, setGeneratedApp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatData, setChatData] = useState<any>(null)
  const [chats, setChats] = useState<any[]>([])
  const [chatsLoaded, setChatsLoaded] = useState(false)
  const [showRateLimitDialog, setShowRateLimitDialog] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    resetTime?: string
    remaining?: number
  }>({})
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [streamActivities, setStreamActivities] = useState<GenerationActivity[]>([])
  const [showThinkingTraces, setShowThinkingTraces] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState(chatId === 'new-chat' ? 'new' : chatId)

  const { isValidating, showApiKeyError } = useApiValidation()

  useEffect(() => {
    setSelectedChatId(chatId === 'new-chat' ? 'new' : chatId)
  }, [chatId])

  useEffect(() => {
    if (!isValidating && !showApiKeyError) {
      if (chatId && chatId !== 'new' && chatId !== 'new-chat') {
        const hasPendingChatData = loadPendingChatData(chatId)
        if (!hasPendingChatData) {
          loadChatData()
        }
      }

      loadChatsWithCache()
    }
  }, [chatId, isValidating, showApiKeyError])

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
      }
    } catch (err) {
      // Silently handle chat loading errors
    } finally {
      setChatsLoaded(true)
    }
  }

  const handleChatChange = (newChatId: string) => {
    if (newChatId === 'new') {
      router.push('/chats/new-chat')
      setSelectedChatId('new')
      setChatData(null)
      setGeneratedApp(null)
      setError(null)
      setStreamActivities([])
      setShowThinkingTraces(false)
      return
    }

    setSelectedChatId(newChatId)
    setStreamActivities([])
    setShowThinkingTraces(false)
    router.push(`/chats/${newChatId}`)
  }

  const handleDeleteChat = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        try {
          sessionStorage.removeItem('chats')
        } catch (err) {
          // Silently handle cache clearing errors
        }

        router.push('/')
      } else {
        setError('Failed to delete chat. Please try again.')
      }
    } catch (error) {
      setError('Failed to delete chat. Please try again.')
    }
  }

  const handleRenameChat = async (newName: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })

      if (response.ok) {
        setChatData((prev: any) => (prev ? { ...prev, name: newName } : prev))

        try {
          sessionStorage.removeItem('chats')
        } catch (err) {
          // Silently handle cache clearing errors
        }

        loadChats()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to rename chat')
      }
    } catch (error) {
      throw error
    }
  }

  const loadPendingChatData = (targetChatId: string) => {
    try {
      const cachedChat = sessionStorage.getItem(getPendingChatStorageKey(targetChatId))

      if (!cachedChat) return false

      const data = JSON.parse(cachedChat)
      sessionStorage.removeItem(getPendingChatStorageKey(targetChatId))
      setChatData(data)

      const activities = loadPendingActivities(targetChatId)
      const shouldKeepThinkingOpen = loadPendingThinkingOpen(targetChatId)
      setStreamActivities(activities)
      setShowThinkingTraces(shouldKeepThinkingOpen || activities.length > 0)

      if (data.demo) {
        setGeneratedApp(data.demo)
      } else if (data.id || data.chatId) {
        void loadPreview(data.id || data.chatId, data.url)
      }

      return true
    } catch (err) {
      // Silently handle cache loading errors
      return false
    }
  }

  const loadChatData = async () => {
    try {
      const response = await fetch(`/api/chats/${encodeURIComponent(chatId)}`, {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        setChatData(data)

        if (data.demo) {
          setGeneratedApp(data.demo)
        } else if (data.id) {
          void loadPreview(data.id, data.url)
        }
      }
    } catch (err) {
      // Silently handle chat loading errors
    }
  }

  const loadPreview = async (targetChatId: string, chatUrl?: string) => {
    const startedAt = Date.now()
    console.info('[simple-v0 preview] polling started', {
      chatId: targetChatId,
      chatUrl,
    })
    setGeneratedApp(getPreviewStartingHtml(chatUrl))

    const deadline = Date.now() + 180_000
    let attempt = 0

    while (Date.now() < deadline) {
      attempt += 1

      try {
        const response = await fetch(`/api/chats/${encodeURIComponent(targetChatId)}/preview`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          const body = await response.text().catch(() => '')
          console.warn('[simple-v0 preview] poll failed', {
            chatId: targetChatId,
            attempt,
            status: response.status,
            statusText: response.statusText,
            body,
          })
        } else {
          const data = await response.json()
          console.info('[simple-v0 preview] poll response', {
            chatId: targetChatId,
            attempt,
            elapsedMs: Date.now() - startedAt,
            previewUrl: redactPreviewUrl(data.previewUrl),
            rawPreviewUrl: redactPreviewUrl(data.rawPreviewUrl),
            authenticated: data.authenticated,
            debug: data.debug,
          })

          if (typeof data.previewUrl === 'string' && data.previewUrl.length > 0) {
            console.info('[simple-v0 preview] preview URL ready', {
              chatId: targetChatId,
              attempt,
              elapsedMs: Date.now() - startedAt,
              previewUrl: redactPreviewUrl(data.previewUrl),
              authenticated: data.authenticated,
            })
            setGeneratedApp(data.previewUrl)
            return
          }
        }
      } catch (error) {
        console.warn('[simple-v0 preview] poll threw', {
          chatId: targetChatId,
          attempt,
          error,
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 1_500))
    }

    console.warn('[simple-v0 preview] polling timed out', {
      chatId: targetChatId,
      elapsedMs: Date.now() - startedAt,
    })
    setGeneratedApp(getPreviewPendingHtml(chatUrl))
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
          chatId: selectedChatId !== 'new' ? selectedChatId : undefined,
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
          setChatData(chat)
        },
      })
      const data = result.chat || latestChat
      const activities =
        result.activities && result.activities.length > 0 ? result.activities : latestActivities

      if (!data) {
        throw new Error('Generation completed without returning a chat')
      }

      setChatData(data)

      try {
        sessionStorage.removeItem('chats')
      } catch (err) {
        // Silently handle cache clearing errors
      }

      if (selectedChatId === 'new' && (data.id || data.chatId)) {
        const newChatId = data.id || data.chatId
        try {
          sessionStorage.setItem(getPendingChatStorageKey(newChatId), JSON.stringify(data))
          sessionStorage.setItem(
            getPendingChatActivitiesStorageKey(newChatId),
            JSON.stringify(activities),
          )
          sessionStorage.setItem(getPendingChatThinkingOpenStorageKey(newChatId), 'true')
        } catch (err) {
          // Silently handle cache storage errors
        }

        if (data.demo) {
          setGeneratedApp(data.demo)
        } else {
          void loadPreview(newChatId, data.url)
        }

        router.replace(`/chats/${newChatId}`)
        return
      }

      if (data.demo) {
        setGeneratedApp(data.demo)
      } else if (data.id || data.chatId) {
        void loadPreview(data.id || data.chatId, data.url)
      }

      loadChats()
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-full bg-white">
          {isPreviewUrl(generatedApp) ? (
            <iframe
              key="preview"
              src={generatedApp}
              title="Generated app preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups allow-top-navigation-by-user-activation allow-pointer-lock"
              onLoad={() => {
                console.info('[simple-v0 preview iframe] loaded', {
                  url: redactPreviewUrl(generatedApp),
                })
                setShowThinkingTraces(false)
              }}
              onError={() => {
                console.error('[simple-v0 preview iframe] failed to load', {
                  url: redactPreviewUrl(generatedApp),
                })
              }}
            />
          ) : (
            <iframe
              key="preview-status"
              srcDoc={generatedApp || getPreviewIdleHtml()}
              title="Generated app preview status"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-pointer-lock"
              onLoad={() => {
                console.info('[simple-v0 preview status iframe] loaded', {
                  hasStatusHtml: Boolean(generatedApp),
                })
              }}
            />
          )}
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
        placeholder={
          chatId !== 'new' && chatId !== 'new-chat' ? 'Refine your app...' : 'Describe your app...'
        }
        showDropdowns={chatsLoaded}
        chats={chats}
        currentChatId={chatId}
        chatData={chatData}
        onChatChange={handleChatChange}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
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

function loadPendingActivities(chatId: string): GenerationActivity[] {
  try {
    const key = getPendingChatActivitiesStorageKey(chatId)
    const cachedActivities = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)

    if (!cachedActivities) return []

    const activities = JSON.parse(cachedActivities)
    return Array.isArray(activities) ? activities : []
  } catch (error) {
    console.warn('[simple-v0 thinking] failed to load pending activities', {
      chatId,
      error,
    })
    return []
  }
}

function loadPendingThinkingOpen(chatId: string) {
  try {
    const key = getPendingChatThinkingOpenStorageKey(chatId)
    const value = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)

    return value === 'true'
  } catch (error) {
    console.warn('[simple-v0 thinking] failed to load pending open state', {
      chatId,
      error,
    })
    return false
  }
}

function isPreviewUrl(value: string | null): value is string {
  return typeof value === 'string' && /^(https?:)?\/\//.test(value)
}

function redactPreviewUrl(value: unknown) {
  if (typeof value !== 'string') return value

  try {
    const url = new URL(value)
    const redactedParams = new Set(['__v0_s', 'token'])

    for (const param of redactedParams) {
      if (url.searchParams.has(param)) {
        url.searchParams.set(param, '[redacted]')
      }
    }

    return url.toString()
  } catch {
    return value
  }
}

function getPreviewStartingHtml(chatUrl?: string) {
  return getPreviewStatusHtml({
    title: 'Starting preview',
    description: 'The v0 preview VM is starting.',
    chatUrl,
    showSpinner: true,
  })
}

function getPreviewIdleHtml() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${getPreviewStatusCss()}</style>
    </head>
    <body class="idle"></body>
    </html>
  `
}

function getPreviewPendingHtml(chatUrl?: string) {
  return getPreviewStatusHtml({
    title: 'Preview is still starting',
    description: 'The app was generated, but the preview VM has not returned a URL yet.',
    chatUrl,
  })
}

function getPreviewStatusHtml({
  title,
  description,
  chatUrl,
  showSpinner = false,
}: {
  title: string
  description: string
  chatUrl?: string
  showSpinner?: boolean
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${getPreviewStatusCss()}</style>
    </head>
    <body>
      <main class="card">
        ${showSpinner ? '<div class="spinner" aria-hidden="true"></div>' : ''}
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        ${
          chatUrl
            ? `<a href="${escapeAttribute(chatUrl)}" target="_blank" rel="noopener noreferrer">View on v0.app</a>`
            : ''
        }
      </main>
    </body>
    </html>
  `
}

function getPreviewStatusCss() {
  return `
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #f9fafb;
      color: #111827;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    body.idle { display: block; padding: 0; background: #fff; }
    .card { width: 100%; max-width: 28rem; text-align: center; }
    .spinner {
      width: 2rem;
      height: 2rem;
      margin: 0 auto 1rem;
      border-radius: 9999px;
      border: 2px solid #111827;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
    }
    h1 { margin: 0 0 0.75rem; font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; }
    p { margin: 0 0 1rem; color: #4b5563; line-height: 1.5rem; }
    a { color: #111827; text-decoration: underline; text-underline-offset: 3px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, '&#96;')
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
