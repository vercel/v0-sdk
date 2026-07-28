'use client'

import type { Chat } from '@v0-sdk/react'
import { useChats, useChatsInfinite } from '@v0-sdk/react/swr'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChatItem } from '@/components/layout/chat-item'
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
  const [favoritesOpen, setFavoritesOpen] = useState(initialChats.favoriteChats.length > 0)
  const favoritesQuery = useChats(
    '/api/chats',
    {
      limit: 5,
      metadata: { favorite: 'true' },
    },
    {
      fallbackData: {
        chats: initialChats.favoriteChats,
        cursor: null,
      },
      revalidateOnMount: false,
    },
  )
  const recentQuery = useChatsInfinite(
    '/api/chats',
    { limit: 5 },
    {
      fallbackData: [initialChats.recentChats],
      revalidateOnMount: false,
    },
  )
  const favoriteChats = favoritesQuery.data?.chats ?? initialChats.favoriteChats
  const recentPages = recentQuery.data ?? [initialChats.recentChats]
  const recentChats = recentPages
    .flatMap((page) => page.chats)
    .filter((chat) => chat.metadata.favorite !== 'true')
  const recentCursor = recentPages.at(-1)?.cursor
  const isLoadingMore = recentQuery.isValidating

  useEffect(() => {
    void favoritesQuery.mutate(
      { chats: initialChats.favoriteChats, cursor: null },
      { revalidate: false },
    )
    void recentQuery.mutate([initialChats.recentChats], {
      revalidate: false,
    })
  }, [initialChats])

  const renderItem = (chat: Chat) => (
    <ChatItem
      chat={chat}
      isActive={pathname === `/chats/${chat.id}`}
      key={chat.id}
      onChanged={refreshChats}
      onDeleted={handleDeleted}
    />
  )

  async function refreshChats() {
    const [favorites] = await Promise.all([favoritesQuery.mutate(), recentQuery.mutate()])
    if (favorites?.chats.length) setFavoritesOpen(true)
  }

  async function handleDeleted(id: string) {
    await refreshChats()
    if (pathname === `/chats/${id}`) router.push('/')
  }

  const handleLoadMore = () => {
    if (!recentCursor) return
    void recentQuery.setSize((size) => size + 1)
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
              {favoriteChats.length === 0 ? (
                <p className="px-2.5 py-1 text-xs text-muted-foreground">No favorites yet</p>
              ) : (
                favoriteChats.map(renderItem)
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
              {recentChats.length === 0 ? (
                <p className="px-2.5 py-1 text-xs text-muted-foreground">No chats yet</p>
              ) : (
                recentChats.map(renderItem)
              )}
              {recentCursor ? (
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
