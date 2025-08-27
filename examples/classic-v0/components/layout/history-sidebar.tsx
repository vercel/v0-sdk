'use client'

import { useEffect, useState, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

// Modern loading spinner component
const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
  </div>
)

interface HistoryItem {
  id: string
  prompt: string
  demoUrl: string
  timestamp: Date
}

interface HistorySidebarProps {
  chatId: string
  selectedVersionIndex?: number
  history?: HistoryItem[] // Optional: if provided, use this instead of fetching
  onSelectVersion?: (version: HistoryItem, index: number) => void
  onVersionsLoaded?: (versions: HistoryItem[], latestIndex: number) => void
}

export function HistorySidebar({
  chatId,
  selectedVersionIndex = 0,
  history: externalHistory,
  onSelectVersion,
  onVersionsLoaded,
}: HistorySidebarProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [refreshingIndex, setRefreshingIndex] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (externalHistory) {
      // Use externally provided history (for progressive loading)
      setHistory(externalHistory)
      setLoading(false)

      // Notify parent component with latest version index (last in sorted array)
      if (externalHistory.length > 0) {
        const latestIndex = externalHistory.length - 1
        onVersionsLoaded?.(externalHistory, latestIndex)
      }
    } else {
      // Fetch versions from API (fallback behavior)
      const fetchVersions = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/chats/${chatId}/versions`)
          if (response.ok) {
            const versions = await response.json()
            setHistory(versions)

            // Notify parent component with latest version index (last in sorted array)
            if (versions.length > 0) {
              const latestIndex = versions.length - 1
              onVersionsLoaded?.(versions, latestIndex)
            }
          }
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }

      if (chatId) {
        fetchVersions()
      }
    }
  }, [chatId, externalHistory, onVersionsLoaded])

  // Auto-scroll to bottom when history loads or selection changes
  useEffect(() => {
    if (history.length > 0 && scrollContainerRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop =
            scrollContainerRef.current.scrollHeight
        }
      }, 100)
    }
  }, [history, selectedVersionIndex])

  const handleRefreshThumbnail = (
    index: number,
    item: HistoryItem,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation() // Prevent version selection

    setRefreshingIndex(index)

    // Force refresh by updating the image src with a cache-busting timestamp
    const img = document.querySelector(
      `[data-history-thumbnail-index="${index}"] img`,
    ) as HTMLImageElement
    if (img) {
      const originalSrc = img.src.split('&t=')[0] // Remove existing timestamp if any
      img.src = `${originalSrc}&t=${Date.now()}`
    }

    // Clear refreshing state after a short delay to show the refresh happened
    setTimeout(() => setRefreshingIndex(null), 500)
  }
  return (
    <div className="w-80 h-full max-h-full border border-gray-200 rounded-lg flex flex-col bg-white overflow-hidden">
      <div className="border-b border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900">History</h2>
      </div>
      <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading versions...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">No versions found</div>
            </div>
          ) : (
            history.map((item, index) => (
              <div
                key={item.id}
                data-history-thumbnail-index={index}
                className={`relative aspect-[16/9] border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedVersionIndex === index
                    ? 'border-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => onSelectVersion?.(item, index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.demoUrl !== 'about:blank' ? (
                  <img
                    src={`/api/screenshot?chatId=${item.id}&url=${encodeURIComponent(item.demoUrl)}`}
                    alt={`Version ${index}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ModernSpinner className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div
                  className={`absolute bottom-1 left-1 text-white text-xs px-2 py-1 rounded ${
                    selectedVersionIndex === index
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                  }`}
                >
                  v{index}
                </div>

                {/* Refresh icon - only show on hover and when item has valid demoUrl */}
                {hoveredIndex === index && item.demoUrl !== 'about:blank' && (
                  <div
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-pointer transition-all"
                    onClick={(e) => handleRefreshThumbnail(index, item, e)}
                    title="Refresh screenshot"
                  >
                    <RefreshCw
                      className={`h-4 w-4 text-black ${
                        refreshingIndex === index ? 'animate-spin' : ''
                      }`}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
