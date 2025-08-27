'use client'

import { useEffect, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { PromptInput } from '@/components/ui/prompt-input'
import { User, CornerDownLeft } from 'lucide-react'
import { GenerationsView } from '@/components/shared/generations-view'
import {
  userAtom,
  currentChatAtom,
  isLoadingAtom,
  selectedGenerationIndexAtom,
  isSubmittingFollowUpAtom,
  currentPromptAtom,
  showInitialScreenAtom,
  userInitialsAtom,
  fetchUserAtom,
  submitInitialPromptAtom,
  submitFollowUpPromptAtom,
  type User as UserType,
  type Chat,
  type Generation,
  type HistoryItem,
} from '@/lib/atoms'

export default function Home() {
  // Jotai atoms
  const [prompt, setPrompt] = useAtom(currentPromptAtom)
  const [currentChat, setCurrentChat] = useAtom(currentChatAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const [selectedGenerationIndex, setSelectedGenerationIndex] = useAtom(
    selectedGenerationIndexAtom,
  )
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useAtom(
    isSubmittingFollowUpAtom,
  )
  const [showInitialScreen, setShowInitialScreen] = useAtom(
    showInitialScreenAtom,
  )
  const user = useAtomValue(userAtom)
  const userInitials = useAtomValue(userInitialsAtom)

  // Local state for regenerate dialog
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Jotai actions
  const fetchUser = useSetAtom(fetchUserAtom)
  const submitInitialPrompt = useSetAtom(submitInitialPromptAtom)
  const submitFollowUpPrompt = useSetAtom(submitFollowUpPromptAtom)

  // Fetch user data on component mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleSubmitPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    await submitInitialPrompt(prompt.trim())
    setPrompt('')
  }

  const startNewChat = () => {
    setCurrentChat(null)
    setPrompt('')
    setSelectedGenerationIndex(0)
    setShowInitialScreen(true)
  }

  const selectGeneration = (index: number) => {
    setSelectedGenerationIndex(index)
  }

  const suggestions = [
    'A hero section for an email client app',
    'Create a responsive navbar with Tailwind CSS',
    'Build a todo app with React hooks',
    'Make a landing page for a coffee shop',
    'Design a contact form with validation',
  ]

  // Helper function to generate random style variations
  const getStyleVariations = () => {
    const styles = [
      '', // Generation A: Original prompt
      ' with a modern, minimalist design style',
      ' with a vibrant, colorful design approach',
      ' with a dark, professional theme',
      ' with playful, rounded elements',
      ' with a gradient background and glass morphism',
      ' with a retro, vintage aesthetic',
      ' with bold typography and geometric shapes',
      ' with soft shadows and subtle animations',
      ' with a clean, corporate look',
    ]

    // Always keep A as original, randomize B and C
    const shuffledStyles = styles.slice(1) // Remove the empty string
    const randomB =
      shuffledStyles[Math.floor(Math.random() * shuffledStyles.length)]
    const randomC =
      shuffledStyles[Math.floor(Math.random() * shuffledStyles.length)]

    return ['', randomB, randomC]
  }

  // Modern loading spinner component
  const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
    <div className={`${className} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
    </div>
  )

  // Component for user avatar
  const UserAvatar = ({ className = 'h-8 w-8' }: { className?: string }) => {
    return (
      <Avatar className={className}>
        {user?.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={user.name} />
        )}
        <AvatarFallback className="bg-gray-600 text-white">
          {user ? userInitials : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
    )
  }

  // Show initial prompt interface
  if (showInitialScreen) {
    return (
      <TooltipProvider>
        <div className="h-screen bg-white flex items-center justify-center">
          <div className="w-full px-8">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmitPrompt}
              placeholder="A hero for an email client app"
              disabled={isLoading}
              loading={isLoading}
              user={user}
              autoFocus
            />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Handler functions for the GenerationsView
  const handleSelectGeneration = (index: number) => {
    setSelectedGenerationIndex(index)
  }

  const handleRegenerate = () => {
    setShowRegenerateDialog(true)
  }

  const confirmRegenerate = async () => {
    if (!currentChat) return

    setIsRegenerating(true)
    setShowRegenerateDialog(false)

    try {
      // Get the selected generation to regenerate
      const selectedGeneration =
        currentChat.generations[selectedGenerationIndex]

      // Call the chat API to regenerate the selected chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentChat.prompt + ' (regenerated)',
          projectId: currentChat.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate')
      }

      const newChat = await response.json()

      // Update the selected generation with the new data
      setCurrentChat((prevChat) => {
        if (!prevChat) return null

        const updatedGenerations = [...prevChat.generations]
        updatedGenerations[selectedGenerationIndex] = {
          ...updatedGenerations[selectedGenerationIndex],
          id: newChat.id,
          demoUrl: newChat.demo,
        }

        return {
          ...prevChat,
          generations: updatedGenerations,
          selectedGeneration: updatedGenerations[selectedGenerationIndex],
        }
      })
    } catch (error) {
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleFollowUpPrompt = async (userPrompt: string) => {
    await submitFollowUpPrompt(userPrompt)
  }

  // Show generations interface using shared component
  if (!currentChat) {
    return <div>Loading...</div>
  }

  return (
    <>
      <GenerationsView
        user={user}
        prompt={currentChat.prompt}
        generations={currentChat.generations}
        selectedGenerationIndex={selectedGenerationIndex}
        onSelectGeneration={handleSelectGeneration}
        onRegenerate={handleRegenerate}
        onFollowUpPrompt={handleFollowUpPrompt}
        isSubmitting={isSubmittingFollowUp}
        showHistory={currentChat.isIterating}
        history={currentChat.history}
        projectId={currentChat.id}
        chatId={currentChat.generations[selectedGenerationIndex]?.id}
      />

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
    </>
  )
}
