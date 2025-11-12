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
      GET: 'text-green-600 bg-green-50',
      POST: 'text-blue-600 bg-blue-50',
      PUT: 'text-orange-600 bg-orange-50',
      PATCH: 'text-yellow-600 bg-yellow-50',
      DELETE: 'text-red-600 bg-red-50',
    }
    return colors[method] || 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
      <nav className="p-2 flex-1 overflow-y-auto">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          return (
            <div key={category.id} className="mb-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
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
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
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
      <div className="flex-none border-t border-gray-200 dark:border-gray-800 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {user?.name?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.name || user?.email || 'Anonymous'}
            </p>
            {user?.email && user?.name && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
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
                        <span className="text-blue-600">✓</span>
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
                        <span className="text-blue-600">✓</span>
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
                        <span className="text-blue-600">✓</span>
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
