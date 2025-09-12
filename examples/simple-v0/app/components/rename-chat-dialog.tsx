'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { EditIcon } from 'lucide-react'

interface RenameChatDialogProps {
  chatId: string
  currentName: string
  onRename: (newName: string) => Promise<void>
  trigger?: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

export default function RenameChatDialog({
  chatId,
  currentName,
  onRename,
  trigger,
  onOpenChange,
}: RenameChatDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
    if (newOpen) {
      // Reset name and error when opening
      setName(currentName)
      setError(null)
    }
  }

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Chat name cannot be empty')
      return
    }

    if (trimmedName === currentName) {
      setOpen(false)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onRename(trimmedName)
      setOpen(false)
      onOpenChange?.(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename chat')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setName(currentName)
    setError(null)
    setOpen(false)
    onOpenChange?.(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const defaultTrigger = (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <EditIcon className="mr-2 h-4 w-4" />
      Rename Chat
    </DropdownMenuItem>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
          <DialogDescription>Enter a new name for this chat.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="chat-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Chat Name
            </label>
            <input
              id="chat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter chat name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
