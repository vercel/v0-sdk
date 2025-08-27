'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { User, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface HeaderProps {
  user: User | null
  prompt: string
  projectId?: string
  generations?: Array<{ id: string; label: string }>
}

export function Header({ user, prompt, projectId, generations }: HeaderProps) {
  const router = useRouter()
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)

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

  const handleDuplicate = async () => {
    if (!projectId || !generations) return

    setIsDuplicating(true)
    setShowDuplicateDialog(false)

    try {
      // Create a new project
      const projectResponse = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${prompt} (Copy)`,
          description: `Duplicate of: ${prompt}`,
        }),
      })

      const newProject = await projectResponse.json()
      const newProjectId = newProject.id

      // Fork each chat to the new project
      const forkPromises = generations.map(async (generation) => {
        const response = await fetch('/api/chat/fork', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: generation.id,
            projectId: newProjectId,
          }),
        })
        return response.json()
      })

      await Promise.all(forkPromises)

      // Navigate to the new project
      router.push(`/projects/${newProjectId}`)
    } catch (error) {
      // Handle error - could show a toast
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <UserAvatar />
          <div className="bg-gray-100 text-gray-900 font-medium px-4 py-2 rounded-full">
            {prompt}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" className="text-gray-700">
              New +
            </Button>
          </Link>

          {/* Duplicate Button - always show but disabled if no project */}
          {projectId && generations ? (
            <Dialog
              open={showDuplicateDialog}
              onOpenChange={setShowDuplicateDialog}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-700">
                  Duplicate
                  <Copy className="h-4 w-4 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Duplicate Project</DialogTitle>
                  <DialogDescription>
                    This will create a copy of this project with all 3
                    generations (A, B, C). You can then iterate on the
                    duplicated versions independently.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDuplicateDialog(false)}
                    disabled={isDuplicating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDuplicate} disabled={isDuplicating}>
                    {isDuplicating ? 'Duplicating...' : 'Duplicate Project'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-700"
                  disabled
                >
                  Duplicate
                  <Copy className="h-4 w-4 ml-2" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save project first to enable duplication</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}
