'use client'

import { createContext, useContext, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import type { getSidebarChats } from '@/lib/sidebar-chats'
import { SidebarToggleIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'

const SidebarContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function SidebarToggleButton({ className }: { className?: string }) {
  const sidebar = useContext(SidebarContext)

  if (!sidebar || sidebar.open) return null

  return (
    <Button
      aria-label="Expand sidebar"
      className={cn('size-8 shrink-0 text-muted-foreground', className)}
      onClick={() => sidebar.setOpen(true)}
      size="icon"
      variant="ghost"
    >
      <SidebarToggleIcon size={18} />
    </Button>
  )
}

export function AppShell({
  children,
  apiKeyStatus,
  sidebarChats,
}: {
  children: React.ReactNode
  apiKeyStatus: {
    hasBrowserApiKey: boolean
    hasEnvironmentApiKey: boolean
  }
  sidebarChats: ReturnType<typeof getSidebarChats>
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <SidebarContext.Provider value={{ open: sidebarOpen, setOpen: setSidebarOpen }}>
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar
          apiKeyStatus={apiKeyStatus}
          onToggle={() => setSidebarOpen((open) => !open)}
          open={sidebarOpen}
          sidebarChats={sidebarChats}
        />
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </SidebarContext.Provider>
  )
}
