import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview'
import { RefreshCw, Monitor, Maximize, Minimize } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  demo?: string
  url?: string
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
  return (
    <div
      className={cn(
        'flex flex-col h-full transition-all duration-300',
        isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-black' : 'flex-1',
      )}
    >
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
          <WebPreviewNavigationButton
            onClick={() => setIsFullscreen(!isFullscreen)}
            tooltip={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            disabled={!currentChat?.demo}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </WebPreviewNavigationButton>
        </WebPreviewNavigation>
        {currentChat?.demo ? (
          <WebPreviewBody key={refreshKey} src={currentChat.demo} />
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
