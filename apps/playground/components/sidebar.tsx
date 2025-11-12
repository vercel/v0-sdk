'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { APICategory, APIEndpoint } from '../lib/openapi-parser'

interface SidebarProps {
  categories: APICategory[]
  selectedEndpoint?: APIEndpoint
  onSelectEndpoint: (endpoint: APIEndpoint) => void
}

export function Sidebar({
  categories,
  selectedEndpoint,
  onSelectEndpoint,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id)),
  )

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
    <div className="h-full overflow-y-auto border-r border-gray-200 bg-white">
      <nav className="p-2">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          return (
            <div key={category.id} className="mb-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
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
    </div>
  )
}
