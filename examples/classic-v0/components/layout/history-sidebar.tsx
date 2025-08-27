'use client'

import { ScrollArea } from '@/components/ui/scroll-area'

interface HistoryItem {
  id: string
  prompt: string
  demoUrl: string
  timestamp: Date
}

interface HistorySidebarProps {
  history: HistoryItem[]
  onSelectVersion?: (index: number) => void
}

export function HistorySidebar({
  history,
  onSelectVersion,
}: HistorySidebarProps) {
  return (
    <div className="w-80 border-r border-gray-200 flex flex-col">
      <div className="border-b border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900">History</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => onSelectVersion?.(index)}
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
                <p className="text-xs text-gray-600 truncate">{item.prompt}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
