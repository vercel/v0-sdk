'use client'

import type { Chat } from '@v0-sdk/react'
import { useDeleteChat, useUpdateChat } from '@v0-sdk/react/swr'
import { useState } from 'react'
import Link from 'next/link'
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
  onChanged,
  onDeleted,
}: {
  chat: Chat
  isActive: boolean
  onChanged: () => Promise<void>
  onDeleted: (id: string) => Promise<void>
}) {
  const isFavorite = chat.metadata.favorite === 'true'
  const chatUrl = `/api/chats/${encodeURIComponent(chat.id)}`
  const deleteChat = useDeleteChat(chatUrl)
  const updateChat = useUpdateChat(chatUrl)
  const [menuOpen, setMenuOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(chat.title || '')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busy = isRefreshing || deleteChat.isMutating || updateChat.isMutating

  const handleRename = async () => {
    const title = renameValue.trim()
    if (!title || title === chat.title) {
      setRenameOpen(false)
      return
    }

    setError(null)
    try {
      await updateChat.trigger({ title })
      setIsRefreshing(true)
      await onChanged()
      setRenameOpen(false)
    } catch (error) {
      setError(errorMessage(error, 'Failed to rename chat.'))
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDelete = async () => {
    setError(null)
    try {
      await deleteChat.trigger()
      setIsRefreshing(true)
      await onDeleted(chat.id)
      setDeleteOpen(false)
    } catch (error) {
      setError(errorMessage(error, 'Failed to delete chat.'))
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleToggleFavorite = async () => {
    setError(null)
    try {
      await updateChat.trigger({
        metadata: { favorite: isFavorite ? null : 'true' },
      })
      setIsRefreshing(true)
      await onChanged()
    } catch (error) {
      setError(errorMessage(error, 'Failed to update favorite.'))
    } finally {
      setIsRefreshing(false)
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
            <DropdownMenuItem disabled={busy} onSelect={() => void handleToggleFavorite()}>
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
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
            {error ? <p className="mr-auto text-sm text-destructive">{error}</p> : null}
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

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
