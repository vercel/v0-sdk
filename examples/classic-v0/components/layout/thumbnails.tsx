'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshCw, ExternalLink } from 'lucide-react'

interface Generation {
  id: string
  demoUrl: string
  label: string
  projectId?: string
}

interface ThumbnailsProps {
  generations: Generation[]
  selectedGenerationIndex: number
  onSelectGeneration: (index: number) => void
  onRegenerate?: () => void
  projectId?: string
}

// Modern loading spinner component
const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
  </div>
)

export function Thumbnails({
  generations,
  selectedGenerationIndex,
  onSelectGeneration,
  onRegenerate,
  projectId,
}: ThumbnailsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [refreshingIndex, setRefreshingIndex] = useState<number | null>(null)

  const handleRefreshThumbnail = async (
    index: number,
    generation: Generation,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation() // Prevent thumbnail selection
    setRefreshingIndex(index)

    try {
      // Force refresh by adding a cache-busting timestamp
      const timestamp = Date.now()
      const img = document.querySelector(
        `[data-thumbnail-index="${index}"] img`,
      ) as HTMLImageElement
      if (img) {
        const baseUrl = `/api/screenshot?chatId=${generation.id}&url=${encodeURIComponent(generation.demoUrl)}`
        img.src = `${baseUrl}&t=${timestamp}`
      }
    } catch (error) {
    } finally {
      // Clear refreshing state after a short delay to show the refresh happened
      setTimeout(() => setRefreshingIndex(null), 500)
    }
  }

  return (
    <div className="w-full mt-6">
      {/* Four items: 3 Generation Thumbnails + 1 Regenerate */}
      <div className="grid grid-cols-4 gap-6">
        {/* Three Generation Thumbnails */}
        {generations.map((generation, index) => (
          <div
            key={generation.id}
            data-thumbnail-index={index}
            className={`relative aspect-[16/9] border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedGenerationIndex === index
                ? 'border-blue-500'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => onSelectGeneration(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Use screenshot API for thumbnails */}
            {generation.demoUrl !== 'about:blank' ? (
              <img
                src={`/api/screenshot?chatId=${generation.id}&url=${encodeURIComponent(generation.demoUrl)}`}
                alt={`Generation ${generation.label}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a simple colored placeholder on error
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-blue-100 flex items-center justify-center">
                        <span class="text-blue-600 font-medium">${generation.label}</span>
                      </div>
                    `
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <ModernSpinner className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div
              className={`absolute bottom-1 left-1 text-white text-xs px-2 py-1 rounded ${
                selectedGenerationIndex === index
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              }`}
            >
              {generation.label}
            </div>

            {/* Action icons - only show on hover and when not loading */}
            {hoveredIndex === index && generation.demoUrl !== 'about:blank' && (
              <>
                {/* Refresh icon */}
                <div
                  className="absolute top-2 right-12 w-8 h-8 flex items-center justify-center cursor-pointer transition-all"
                  onClick={(e) => handleRefreshThumbnail(index, generation, e)}
                  title="Refresh screenshot"
                >
                  <RefreshCw
                    className={`h-4 w-4 text-black ${
                      refreshingIndex === index ? 'animate-spin' : ''
                    }`}
                  />
                </div>

                {/* Navigate to chat icon */}
                <Link
                  href={`/projects/${projectId || generation.projectId}/chats/${generation.id}`}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-pointer transition-all"
                  title="Open chat page"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4 text-black" />
                </Link>
              </>
            )}
          </div>
        ))}

        {/* Regenerate Box */}
        <div
          className="aspect-[16/9] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={onRegenerate}
        >
          <RefreshCw className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">Regenerate</span>
        </div>
      </div>
    </div>
  )
}
