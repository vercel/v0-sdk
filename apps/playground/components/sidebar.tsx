'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Settings, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAtom } from 'jotai'
import type { APICategory, APIEndpoint } from '../lib/openapi-parser'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { operationIdToRoute } from '../lib/route-utils'
import { expandedCategoriesAtom, apiKeyAtom, hasApiKeyAtom } from '../lib/atoms'

interface SidebarProps {
  categories: APICategory[]
  selectedEndpoint?: APIEndpoint
  onSelectEndpoint: (endpoint: APIEndpoint) => void
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
  isOpen?: boolean
  onClose?: () => void
  mobileFullWidth?: boolean
}

export function Sidebar({
  categories,
  selectedEndpoint,
  onSelectEndpoint,
  user,
  isOpen = true,
  onClose,
  mobileFullWidth = false,
}: SidebarProps) {
  const [expandedCategoriesArray, setExpandedCategoriesArray] = useAtom(
    expandedCategoriesAtom,
  )
  const [apiKey, setApiKey] = useAtom(apiKeyAtom)
  const [hasApiKey] = useAtom(hasApiKeyAtom)
  const expandedCategories = new Set(expandedCategoriesArray)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [dialogApiKey, setDialogApiKey] = useState('')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Save scroll position to sessionStorage
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const handleScroll = () => {
      sessionStorage.setItem('sidebar_scroll_position', String(nav.scrollTop))
    }

    nav.addEventListener('scroll', handleScroll)
    return () => nav.removeEventListener('scroll', handleScroll)
  }, [])

  // Restore scroll position on mount and after navigation
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const savedPosition = sessionStorage.getItem('sidebar_scroll_position')
    if (savedPosition) {
      nav.scrollTop = parseInt(savedPosition, 10)
    }
  }, [selectedEndpoint])

  // Auto-expand category containing selected endpoint
  useEffect(() => {
    if (selectedEndpoint) {
      const category = categories.find((cat) =>
        cat.endpoints.some((ep) => ep.id === selectedEndpoint.id),
      )
      if (category) {
        setExpandedCategoriesArray((prev) => {
          // Only add if not already in the array
          if (!prev.includes(category.id)) {
            return [...prev, category.id]
          }
          return prev
        })
      }
    }
  }, [selectedEndpoint, categories, setExpandedCategoriesArray])

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.has(categoryId)) {
      setExpandedCategoriesArray((prev) =>
        prev.filter((id) => id !== categoryId),
      )
    } else {
      setExpandedCategoriesArray((prev) => [...prev, categoryId])
    }
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'text-success-foreground bg-success/10',
      POST: 'text-info-foreground bg-info/10',
      PUT: 'text-warning-foreground bg-warning/10',
      PATCH: 'text-warning-foreground bg-warning/20',
      DELETE: 'text-destructive-foreground bg-destructive/10',
    }
    return colors[method] || 'text-muted-foreground bg-muted'
  }

  const handleSaveApiKey = () => {
    if (dialogApiKey) {
      setApiKey(dialogApiKey)
      setDialogApiKey('')
      setShowApiKeyDialog(false)
      window.location.reload()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200 ease-in-out animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`h-full border-r border-border bg-card flex flex-col ${
          mobileFullWidth
            ? 'w-full lg:w-80 relative'
            : `w-80 fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              }`
        }`}
      >
        {/* Header */}
        <div className="flex-none p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                v0 SDK Playground
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Try out the v0 Platform API
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <nav ref={navRef} className="p-2 flex-1 overflow-y-auto">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id)
            return (
              <div key={category.id} className="mb-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>{category.name}</span>
                </button>

                {isExpanded && (
                  <div className="ml-2 mt-1 space-y-1">
                    {category.endpoints.map((endpoint) => {
                      const { resource, action } = operationIdToRoute(
                        endpoint.id,
                      )
                      const href = `/${resource}/${action}`

                      return (
                        <Link
                          key={endpoint.id}
                          href={href}
                          onClick={() => onClose?.()}
                          className={`block w-full px-3 py-2 text-sm rounded-md transition-colors ${
                            selectedEndpoint?.id === endpoint.id
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <span className="truncate">{endpoint.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="flex-none border-t border-border p-3">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user?.avatar}
                      alt={user?.name || 'User'}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        'A'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {hasApiKey ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setApiKey('')
                      window.location.reload()
                    }}
                    className="cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => setShowApiKeyDialog(true)}
                    className="cursor-pointer"
                  >
                    Enter API Key
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || user?.email || 'Anonymous'}
              </p>
              {user?.email && user?.name && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center">
                  <Settings className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {mounted && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setTheme('light')}
                      className="cursor-pointer"
                    >
                      <span className="flex items-center gap-2 w-full">
                        <span className="w-4 flex items-center justify-center">
                          {theme === 'light' && (
                            <span className="text-primary">✓</span>
                          )}
                        </span>
                        <span>Light</span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('dark')}
                      className="cursor-pointer"
                    >
                      <span className="flex items-center gap-2 w-full">
                        <span className="w-4 flex items-center justify-center">
                          {theme === 'dark' && (
                            <span className="text-primary">✓</span>
                          )}
                        </span>
                        <span>Dark</span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('system')}
                      className="cursor-pointer"
                    >
                      <span className="flex items-center gap-2 w-full">
                        <span className="w-4 flex items-center justify-center">
                          {theme === 'system' && (
                            <span className="text-primary">✓</span>
                          )}
                        </span>
                        <span>System</span>
                      </span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* API Key Dialog */}
        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter API Key</DialogTitle>
              <DialogDescription>
                Please enter your v0 API key to make requests.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <input
                type="password"
                value={dialogApiKey}
                onChange={(e) => setDialogApiKey(e.target.value)}
                placeholder="Enter your v0 API key"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && dialogApiKey) {
                    handleSaveApiKey()
                  }
                }}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://v0.dev/chat/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  v0.dev/chat/settings/keys
                </a>
              </p>
            </div>
            <DialogFooter>
              <button
                onClick={() => setShowApiKeyDialog(false)}
                className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!dialogApiKey}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
