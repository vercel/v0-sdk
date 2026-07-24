'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Chat } from 'v0'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChatItem } from '@/components/layout/chat-item'
import { deleteChat, listRecentChats, renameChat, setChatFavorite } from '@/lib/sidebar-chats'
import type { getSidebarChats } from '@/lib/sidebar-chats'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, ChevronRightIcon, SidebarToggleIcon } from '@/lib/icons'

export function Sidebar({
  open,
  initialChats,
  onToggle,
}: {
  open: boolean
  initialChats: Awaited<ReturnType<typeof getSidebarChats>>
  onToggle: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [chats, setChats] = useState(initialChats)
  const [favoritesOpen, setFavoritesOpen] = useState(initialChats.favoriteChats.length > 0)
  const [isLoadingMore, startLoadingMore] = useTransition()

  useEffect(() => {
    setChats(initialChats)
  }, [initialChats])

  const renderItem = (chat: Chat) => (
    <ChatItem
      chat={chat}
      isActive={pathname === `/chats/${chat.id}`}
      key={chat.id}
      onDeleted={handleDeleted}
      onRenamed={handleRenamed}
      onToggleFavorite={handleToggleFavorite}
    />
  )

  async function handleRenamed(id: string, title: string) {
    setChats(await renameChat(id, title))
  }

  async function handleDeleted(id: string) {
    setChats(await deleteChat(id))
    if (pathname === `/chats/${id}`) router.push('/')
  }

  async function handleToggleFavorite(id: string, favorite: boolean) {
    const nextChats = await setChatFavorite(id, favorite)
    setChats(nextChats)
    if (nextChats.favoriteChats.length > 0) setFavoritesOpen(true)
  }

  const handleLoadMore = () => {
    if (!chats.recentChats.cursor) return

    startLoadingMore(async () => {
      const page = await listRecentChats(chats.recentChats.cursor ?? undefined)
      setChats((current) => ({
        ...current,
        recentChats: {
          chats: [...current.recentChats.chats, ...page.chats],
          cursor: page.cursor,
        },
      }))
    })
  }

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col gap-1 overflow-hidden bg-sidebar transition-[width] duration-200',
        open ? 'w-64 border-r border-sidebar-border' : 'w-0',
      )}
    >
      {open ? (
        <div className="flex w-64 flex-1 flex-col gap-1 overflow-y-auto p-2">
          <div className="mb-1 flex items-center gap-1">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium text-sidebar-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background">
                A
              </span>
              <span className="truncate">Acme Team</span>
              <ChevronDownIcon className="ml-auto size-3.5 text-muted-foreground" />
            </div>

            <Button
              aria-label="Collapse sidebar"
              className="size-8 shrink-0 text-muted-foreground"
              onClick={onToggle}
              size="icon"
              variant="ghost"
            >
              <SidebarToggleIcon size={18} />
            </Button>
          </div>

          <button
            className="flex items-center justify-center rounded-lg border border-sidebar-border bg-background px-3 py-1.5 text-sm font-medium text-sidebar-foreground shadow-sm transition-colors hover:bg-accent"
            onClick={() => window.location.assign('/')}
            type="button"
          >
            New Chat
          </button>

          {/* Favorites */}
          <Collapsible className="mt-4" onOpenChange={setFavoritesOpen} open={favoritesOpen}>
            <CollapsibleTrigger className="group flex w-full items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="flex-1 text-left">Favorites</span>
              <ChevronRightIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-0.5">
              {chats.favoriteChats.length === 0 ? (
                <p className="px-2.5 py-1 text-xs text-muted-foreground">No favorites yet</p>
              ) : (
                chats.favoriteChats.map(renderItem)
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Recent Chats */}
          <Collapsible className="mt-2" defaultOpen>
            <CollapsibleTrigger className="group flex w-full items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="flex-1 text-left">Recent Chats</span>
              <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-0.5">
              {chats.recentChats.chats.length === 0 ? (
                <p className="px-2.5 py-1 text-xs text-muted-foreground">No chats yet</p>
              ) : (
                chats.recentChats.chats.map(renderItem)
              )}
              {chats.recentChats.cursor ? (
                <button
                  className="px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:text-sidebar-foreground disabled:opacity-50"
                  disabled={isLoadingMore}
                  onClick={handleLoadMore}
                  type="button"
                >
                  {isLoadingMore ? 'Loading…' : 'Load more'}
                </button>
              ) : null}
            </CollapsibleContent>
          </Collapsible>

          <div className="flex-1" />
        </div>
      ) : null}
    </aside>
  )
}
