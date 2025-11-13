'use client'

import { useState, useEffect, useMemo } from 'react'
import { Sidebar } from '../components/sidebar'
import { parseOpenAPISpec } from '../lib/openapi-parser'
import { useRouter } from 'next/navigation'
import { createClient } from 'v0-sdk'
import type { APIEndpoint } from '../lib/openapi-parser'

const V0_API_BASE_URL =
  process.env.NEXT_PUBLIC_V0_API_BASE_URL || 'https://api.v0.dev/'

export default function Home() {
  const router = useRouter()
  const categories = useMemo(() => parseOpenAPISpec(), [])
  const [apiKey, setApiKey] = useState('')
  const [user, setUser] = useState<any>(null)

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('v0_api_key')
    if (savedKey) {
      setApiKey(savedKey)
      fetchUser(savedKey)
    }
  }, [])

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

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    localStorage.setItem('v0_api_key', value)
    if (value) {
      fetchUser(value)
    } else {
      setUser(null)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <div className="w-80 flex-shrink-0 h-full">
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
        />
      </div>
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-muted-foreground">
            Select an endpoint from the sidebar to begin
          </p>
        </div>
      </div>
    </div>
  )
}
