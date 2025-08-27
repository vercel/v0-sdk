'use client'

// Modern loading spinner component
const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
  </div>
)

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
    <div className="w-full h-full relative">
      {generations.map((generation, index) => (
        <div
          key={generation.id}
          className={`absolute inset-0 w-full h-full rounded-lg border border-gray-300 overflow-hidden bg-white transition-opacity duration-200 ${
            selectedGenerationIndex === index
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0'
          }`}
        >
          {generation.demoUrl !== 'about:blank' ? (
            <iframe
              src={generation.demoUrl}
              className="w-full h-full border-0"
              title={`Generation ${generation.label} Preview`}
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <ModernSpinner className="h-12 w-12 text-blue-500" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
