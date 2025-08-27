'use client'

import { RefreshCw } from 'lucide-react'

interface Generation {
  id: string
  demoUrl: string
  label: string
}

interface ThumbnailsProps {
  generations: Generation[]
  selectedGenerationIndex: number
  onSelectGeneration: (index: number) => void
  onRegenerate?: () => void
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
}: ThumbnailsProps) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Four items: 3 Generation Thumbnails + 1 Regenerate */}
      <div className="grid grid-cols-4 gap-6">
        {/* Three Generation Thumbnails */}
        {generations.map((generation, index) => (
          <div
            key={generation.id}
            className={`relative aspect-video border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedGenerationIndex === index
                ? 'border-blue-500'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => onSelectGeneration(index)}
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
        <div
          className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={onRegenerate}
        >
          <RefreshCw className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">Regenerate</span>
        </div>
      </div>
    </div>
  )
}
