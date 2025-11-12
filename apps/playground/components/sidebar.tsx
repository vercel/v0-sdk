'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import type { APICategory, APIEndpoint } from '../lib/openapi-parser'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarProps {
  categories: APICategory[]
  selectedEndpoint?: APIEndpoint
  onSelectEndpoint: (endpoint: APIEndpoint) => void
  user?: {
    name?: string
    email?: string
    image?: string
  }
}

export function Sidebar({
  categories,
  selectedEndpoint,
  onSelectEndpoint,
  user,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id)),
  )
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
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

  return (
    <div className="h-full border-r border-border bg-card flex flex-col">
      <nav className="p-2 flex-1 overflow-y-auto">
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
                  {category.endpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => onSelectEndpoint(endpoint)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedEndpoint?.id === endpoint.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="truncate">{endpoint.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="flex-none border-t border-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                'U'}
            </AvatarFallback>
          </Avatar>
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
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
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
                    <span className="flex items-center gap-2">
                      {theme === 'light' && (
                        <span className="text-accent">✓</span>
                      )}
                      <span className={theme !== 'light' ? 'ml-6' : ''}>
                        Light
                      </span>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className="cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {theme === 'dark' && (
                        <span className="text-accent">✓</span>
                      )}
                      <span className={theme !== 'dark' ? 'ml-6' : ''}>
                        Dark
                      </span>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className="cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {theme === 'system' && (
                        <span className="text-accent">✓</span>
                      )}
                      <span className={theme !== 'system' ? 'ml-6' : ''}>
                        System
                      </span>
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
