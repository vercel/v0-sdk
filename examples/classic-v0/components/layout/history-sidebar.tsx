'use client'

import { useEffect, useState } from 'react'

interface HistoryItem {
  id: string
  prompt: string
  demoUrl: string
  timestamp: Date
}

interface HistorySidebarProps {
  chatId: string
  onSelectVersion?: (version: HistoryItem, index: number) => void
}

export function HistorySidebar({
  chatId,
  onSelectVersion,
}: HistorySidebarProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/chats/${chatId}/versions`)
        if (response.ok) {
          const versions = await response.json()
          setHistory(versions)
        }
      } catch (error) {
        console.error('Failed to fetch chat versions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (chatId) {
      fetchVersions()
    }
  }, [chatId])
  return (
    <div className="w-80 h-full max-h-full border border-gray-200 rounded-lg flex flex-col bg-white overflow-hidden">
      <div className="border-b border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900">History</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
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
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => onSelectVersion?.(item, index)}
              >
                <div className="aspect-[16/9] relative">
                  <img
                    src={`/api/screenshot?chatId=${item.id}&url=${encodeURIComponent(item.demoUrl)}`}
                    alt={`Version ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    v{index}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
