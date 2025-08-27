'use client'

interface Generation {
  id: string
  demoUrl: string
  label: string
}

interface PreviewProps {
  generations: Generation[]
  selectedGenerationIndex: number
}

export function Preview({
  generations,
  selectedGenerationIndex,
}: PreviewProps) {
  return (
    <div className="flex-1 relative min-h-[600px] max-w-7xl mx-auto">
      {generations.map((generation, index) => (
        <div
          key={generation.id}
          className={`absolute inset-0 w-full h-full rounded-lg border border-gray-300 overflow-hidden bg-white transition-opacity duration-200 ${
            selectedGenerationIndex === index
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0'
          }`}
        >
          <iframe
            src={generation.demoUrl}
            className="w-full h-full border-0"
            title={`Generation ${generation.label} Preview`}
            loading="eager"
          />
        </div>
      ))}
    </div>
  )
}
