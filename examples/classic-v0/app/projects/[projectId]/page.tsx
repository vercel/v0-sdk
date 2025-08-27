'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User, CornerDownLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Preview } from '@/components/layout/preview'
import { Thumbnails } from '@/components/layout/thumbnails'
import { GenerationsView } from '@/components/shared/generations-view'

interface Generation {
  id: string
  demoUrl: string
  label: string
}

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface Project {
  id: string
  name: string
  description: string
  generations: Generation[]
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [user, setUser] = useState<User | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [selectedGenerationIndex, setSelectedGenerationIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Regenerate dialog state
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {}
    }
    fetchUser()
  }, [])

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (response.ok) {
          const projectData = await response.json()
          setProject(projectData)
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }
    fetchProject()
  }, [projectId])

  const handleSelectGeneration = (index: number) => {
    setSelectedGenerationIndex(index)
    // Just update the selected index, don't navigate
  }

  const handleRegenerate = () => {
    setShowRegenerateDialog(true)
  }

  const confirmRegenerate = async () => {
    if (!project) return

    setIsRegenerating(true)
    setShowRegenerateDialog(false)

    try {
      // Get the current selected generation
      const selectedGeneration = project.generations[selectedGenerationIndex]
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: project.name, // Use project name as the prompt
          projectId: projectId,
        }),
      })

      if (response.ok) {
        const newChat = await response.json()

        // Update the project with the new generation
        const updatedGenerations = [...project.generations]
        updatedGenerations[selectedGenerationIndex] = {
          id: newChat.id,
          demoUrl: newChat.demo,
          label: selectedGeneration.label,
        }

        setProject({
          ...project,
          generations: updatedGenerations,
        })
      }
    } catch (error) {
    } finally {
      setIsRegenerating(false)
    }
  }

  // Helper function to get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Modern loading spinner component
  const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
    <div className={`${className} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
    </div>
  )

  // Component for user avatar
  const UserAvatar = ({ className = 'h-8 w-8' }: { className?: string }) => (
    <Avatar className={className}>
      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
      <AvatarFallback className="bg-gray-600 text-white">
        {user ? getUserInitials(user.name) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )

  const handleFollowUpPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!followUpPrompt.trim() || isSubmitting || !project) return

    const userPrompt = followUpPrompt.trim()
    const selectedGeneration = project.generations[selectedGenerationIndex]

    setIsSubmitting(true)

    try {
      // Use sendMessage to continue working on the selected generation
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          chatId: selectedGeneration.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const updatedChat = await response.json()

      // Navigate to the chat page for the NEW chat (not the old one)
      router.push(`/projects/${projectId}/chats/${updatedChat.id}`)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !project) {
    return (
      <TooltipProvider>
        <div className="h-screen flex flex-col bg-white">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
              </div>
              <p className="text-gray-600">Loading project...</p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <Header
          user={user}
          prompt={project.name}
          projectId={projectId}
          generations={project.generations.map((gen) => ({
            id: gen.id,
            label: gen.label,
          }))}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {/* Main Preview and Thumbnails Container */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 h-full">
            {/* Main Preview */}
            <div className="flex-1 w-full mb-6 flex items-center justify-center min-h-[50px]">
              <div className="w-full max-w-7xl mx-auto flex items-center justify-center h-full">
                <div className="flex-1 h-full">
                  <Preview
                    generations={project.generations}
                    selectedGenerationIndex={selectedGenerationIndex}
                  />
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="w-full max-w-7xl mx-auto">
              <Thumbnails
                generations={project.generations}
                selectedGenerationIndex={selectedGenerationIndex}
                onSelectGeneration={handleSelectGeneration}
                onRegenerate={handleRegenerate}
                projectId={projectId}
              />
            </div>
          </div>
        </div>

        {/* Bottom Prompt Bar */}
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleFollowUpPrompt}>
              <div className="flex items-center bg-black rounded-full pl-4 pr-4 py-2">
                <UserAvatar className="h-8 w-8 mr-3 flex-shrink-0" />

                <div className="w-px h-6 bg-gray-600 mr-3 flex-shrink-0"></div>

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
                      handleFollowUpPrompt(e as any)
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

        {/* Regenerate Confirmation Dialog */}
        <Dialog
          open={showRegenerateDialog}
          onOpenChange={setShowRegenerateDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Regenerate {String.fromCharCode(65 + selectedGenerationIndex)}
              </DialogTitle>
              <DialogDescription>
                This will create a new version of generation{' '}
                {String.fromCharCode(65 + selectedGenerationIndex)} and replace
                the current one. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRegenerateDialog(false)}
                disabled={isRegenerating}
              >
                Cancel
              </Button>
              <Button onClick={confirmRegenerate} disabled={isRegenerating}>
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
