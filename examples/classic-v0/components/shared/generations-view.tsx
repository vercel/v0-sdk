'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, CornerDownLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Preview } from '@/components/layout/preview'
import { Thumbnails } from '@/components/layout/thumbnails'
import { HistorySidebar } from '@/components/layout/history-sidebar'

interface Generation {
  id: string
  demoUrl: string
  label: string
}

interface HistoryItem {
  id: string
  prompt: string
  demoUrl: string
  timestamp: Date
}

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface GenerationsViewProps {
  user: User | null
  prompt: string
  generations: Generation[]
  selectedGenerationIndex: number
  onSelectGeneration: (index: number) => void
  onRegenerate?: () => void
  onFollowUpPrompt: (prompt: string) => Promise<void>
  isSubmitting: boolean
  showHistory?: boolean
  history?: HistoryItem[]
  onSelectVersion?: (index: number) => void
  projectId?: string
}

// Modern loading spinner component
const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
  </div>
)

export function GenerationsView({
  user,
  prompt,
  generations,
  selectedGenerationIndex,
  onSelectGeneration,
  onRegenerate,
  onFollowUpPrompt,
  isSubmitting,
  showHistory = false,
  history = [],
  onSelectVersion,
  projectId,
}: GenerationsViewProps) {
  const [followUpPrompt, setFollowUpPrompt] = useState('')

  // Helper function to get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Component for user avatar
  const UserAvatar = ({ className = 'h-8 w-8' }: { className?: string }) => (
    <Avatar className={className}>
      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
      <AvatarFallback className="bg-gray-600 text-white">
        {user ? getUserInitials(user.name) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )

  const handleFollowUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!followUpPrompt.trim() || isSubmitting) return

    const userPrompt = followUpPrompt.trim()
    setFollowUpPrompt('')

    await onFollowUpPrompt(userPrompt)
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <Header
          user={user}
          prompt={prompt}
          projectId={projectId}
          generations={generations.map((gen) => ({
            id: gen.id,
            label: gen.label,
          }))}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* History Sidebar - only show when requested */}
          {showHistory && (
            <HistorySidebar
              history={history}
              onSelectVersion={onSelectVersion}
            />
          )}

          {/* Main Preview and Thumbnails */}
          <div className="flex-1 flex flex-col p-8">
            {/* Main Preview */}
            <div className="flex-1 mb-6">
              <Preview
                generations={generations}
                selectedGenerationIndex={selectedGenerationIndex}
              />
            </div>

            {/* Thumbnails - hide when showing history */}
            {!showHistory && (
              <Thumbnails
                generations={generations}
                selectedGenerationIndex={selectedGenerationIndex}
                onSelectGeneration={onSelectGeneration}
                onRegenerate={onRegenerate}
                projectId={projectId}
              />
            )}
          </div>
        </div>

        {/* Bottom Prompt Bar */}
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleFollowUpSubmit}>
              <div className="flex items-center bg-black rounded-full pl-4 pr-4 py-2">
                <UserAvatar className="h-8 w-8 mr-3 flex-shrink-0" />

                <div className="w-px h-5 bg-gray-600 mr-3 flex-shrink-0"></div>

                <input
                  type="text"
                  value={followUpPrompt}
                  onChange={(e) => setFollowUpPrompt(e.target.value)}
                  placeholder="Make the text larger, add a title, or change colors."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleFollowUpSubmit(e as any)
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={!followUpPrompt.trim() || isSubmitting}
                  className="ml-3 flex-shrink-0 p-1 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <ModernSpinner className="h-4 w-4 text-white" />
                  ) : (
                    <CornerDownLeft className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
