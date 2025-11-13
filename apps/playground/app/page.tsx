'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import { Menu } from 'lucide-react'
import { Sidebar } from '../components/sidebar'
import { parseOpenAPISpec } from '../lib/openapi-parser'
import { useRouter } from 'next/navigation'
import { createClient } from 'v0-sdk'
import type { APIEndpoint } from '../lib/openapi-parser'
import { apiKeyAtom, userAtom } from '../lib/atoms'

const V0_API_BASE_URL =
  process.env.NEXT_PUBLIC_V0_API_BASE_URL || 'https://api.v0.dev/'

export default function Home() {
  const router = useRouter()
  const categories = useMemo(() => parseOpenAPISpec(), [])
  const [apiKey] = useAtom(apiKeyAtom)
  const [user, setUser] = useAtom(userAtom)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Load user when API key changes
  useEffect(() => {
    if (apiKey) {
      fetchUser(apiKey)
    } else {
      setUser(null)
    }
  }, [apiKey])

  const fetchUser = async (key: string) => {
    try {
      const v0 = createClient({
        apiKey: key,
        baseUrl: V0_API_BASE_URL,
      })
      const userResponse = await v0.user.get()
      setUser(userResponse)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  return (
    <div className="h-[100dvh] lg:h-screen flex overflow-hidden bg-background">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-card border border-border rounded-md shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar wrapper - only takes space on desktop */}
      <div className="hidden lg:block w-80 flex-shrink-0 h-full">
        <Sidebar
          categories={categories}
          selectedEndpoint={undefined}
          onSelectEndpoint={(endpoint: APIEndpoint) => {
            // Navigate to the endpoint route
            const parts = endpoint.id.split('.')
            const resource = parts.slice(0, -1).join('/')
            const action = parts[parts.length - 1]
              .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
              .toLowerCase()
            router.push(`/${resource}/${action}`)
          }}
          user={user}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Mobile sidebar - overlays content */}
      <div className="lg:hidden">
        <Sidebar
          categories={categories}
          selectedEndpoint={undefined}
          onSelectEndpoint={(endpoint: APIEndpoint) => {
            // Navigate to the endpoint route
            const parts = endpoint.id.split('.')
            const resource = parts.slice(0, -1).join('/')
            const action = parts[parts.length - 1]
              .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
              .toLowerCase()
            router.push(`/${resource}/${action}`)
            setIsSidebarOpen(false)
          }}
          user={user}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center px-4">
          <p className="text-muted-foreground">
            Select an endpoint from the sidebar to begin
          </p>
        </div>
      </div>
    </div>
  )
}
