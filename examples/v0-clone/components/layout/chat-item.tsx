'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Chat } from 'v0'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreHorizontalIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'

export function ChatItem({
  chat,
  isActive,
  onRenamed,
  onDeleted,
  onToggleFavorite,
}: {
  chat: Chat
  isActive: boolean
  onRenamed: (id: string, title: string) => Promise<void>
  onDeleted: (id: string) => Promise<void>
  onToggleFavorite: (id: string, favorite: boolean) => Promise<void>
}) {
  const isFavorite = chat.metadata.favorite === 'true'
  const [menuOpen, setMenuOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(chat.title || '')
  const [busy, setBusy] = useState(false)

  const handleRename = async () => {
    const title = renameValue.trim()
    if (!title || title === chat.title) {
      setRenameOpen(false)
      return
    }

    setBusy(true)
    try {
      await onRenamed(chat.id, title)
      setRenameOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await onDeleted(chat.id)
      setDeleteOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'group/item relative flex items-center rounded-md text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent',
          (isActive || menuOpen) && 'bg-sidebar-accent',
        )}
      >
        <Link
          className={cn('min-w-0 flex-1 truncate py-1.5 pr-7 pl-2.5', isActive && 'font-medium')}
          href={`/chats/${chat.id}`}
        >
          {chat.title || 'Untitled'}
        </Link>

        <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Chat options"
              className={cn(
                'absolute right-1 flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-accent focus-visible:opacity-100 group-hover/item:opacity-100',
                menuOpen && 'opacity-100',
              )}
              type="button"
            >
              <MoreHorizontalIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44" side="right">
            <DropdownMenuItem onSelect={() => onToggleFavorite(chat.id, !isFavorite)}>
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setRenameValue(chat.title || '')
                setRenameOpen(true)
              }}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setDeleteOpen(true)
              }}
              variant="destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog onOpenChange={setRenameOpen} open={renameOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`rename-${chat.id}`}>New chat title</Label>
            <Input
              autoFocus
              id={`rename-${chat.id}`}
              onChange={(event) => setRenameValue(event.target.value)}
              onFocus={(event) => event.target.select()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleRename()
              }}
              value={renameValue}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setRenameOpen(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={busy} onClick={handleRename} type="button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              This permanently deletes the chat and its messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteOpen(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={busy} onClick={handleDelete} type="button" variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
