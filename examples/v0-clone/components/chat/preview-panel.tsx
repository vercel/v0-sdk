import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview'
import { RefreshCw, Maximize, Minimize } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

interface Chat {
  id: string
  demo?: string
  url?: string
  latestVersion?: {
    demoUrl?: string
  }
}

interface PreviewPanelProps {
  currentChat: Chat | null
  isFullscreen: boolean
  setIsFullscreen: (fullscreen: boolean) => void
  refreshKey: number
  setRefreshKey: (key: number | ((prev: number) => number)) => void
}

export function PreviewPanel({
  currentChat,
  isFullscreen,
  setIsFullscreen,
  refreshKey,
  setRefreshKey,
}: PreviewPanelProps) {
  const chatPreviewUrl =
    currentChat?.latestVersion?.demoUrl ||
    currentChat?.demo ||
    currentChat?.url ||
    ''
  const [previewUrl, setPreviewUrl] = useState(chatPreviewUrl)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setPreviewUrl(chatPreviewUrl)
  }, [chatPreviewUrl, currentChat?.id])

  const previewSrc = useMemo(() => {
    if (!previewUrl) return ''

    try {
      const url = new URL(previewUrl)
      url.searchParams.set('_refresh', String(refreshKey))
      return url.toString()
    } catch {
      const separator = previewUrl.includes('?') ? '&' : '?'
      return `${previewUrl}${separator}_refresh=${refreshKey}`
    }
  }, [previewUrl, refreshKey])

  const handleRefresh = async () => {
    if (isRefreshing) {
      return
    }

    if (!currentChat?.id) {
      setRefreshKey((prev) => prev + 1)
      return
    }

    setIsRefreshing(true)

    try {
      const response = await fetch(`/api/chats/${currentChat.id}`)
      if (!response.ok) {
        console.warn('Failed to refresh chat details:', response.status)
      } else {
        const chatDetails = await response.json()
        const latestPreviewUrl =
          chatDetails?.latestVersion?.demoUrl ||
          chatDetails?.demo ||
          chatDetails?.url ||
          ''

        if (latestPreviewUrl) {
          setPreviewUrl(latestPreviewUrl)
        }
      }
    } catch (error) {
      console.error('Error refreshing preview URL:', error)
    } finally {
      setRefreshKey((prev) => prev + 1)
      setIsRefreshing(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full transition-all duration-300 p-8',
        isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-black' : 'flex-1',
      )}
    >
      <WebPreview
        defaultUrl={previewUrl}
        onUrlChange={(url) => {
          // Optional: Handle URL changes if needed
          console.log('Preview URL changed:', url)
        }}
      >
        <WebPreviewNavigation>
          <WebPreviewNavigationButton
            className="text-muted-foreground"
            onClick={() => void handleRefresh()}
            tooltip="Refresh preview"
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </WebPreviewNavigationButton>
          <WebPreviewUrl
            readOnly
            placeholder="Your app will appear here..."
            value={previewUrl}
          />
          <WebPreviewNavigationButton
            onClick={() => setIsFullscreen(!isFullscreen)}
            tooltip={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </WebPreviewNavigationButton>
        </WebPreviewNavigation>
        {previewUrl ? (
          <WebPreviewBody key={refreshKey} src={previewSrc} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-black">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                No preview available
              </p>
              <p className="text-xs text-gray-700/50 dark:text-gray-200/50">
                Start a conversation to see your app here
              </p>
            </div>
          </div>
        )}
      </WebPreview>
    </div>
  )
}
