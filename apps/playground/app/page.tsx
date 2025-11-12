'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { parseOpenAPISpec } from '../lib/openapi-parser'

const V0_API_BASE_URL =
  process.env.NEXT_PUBLIC_V0_API_BASE_URL || 'https://api.v0.dev/'

export default function Home() {
  const router = useRouter()
  const categories = parseOpenAPISpec()

  useEffect(() => {
    // Redirect to the first endpoint
    if (categories.length > 0 && categories[0].endpoints.length > 0) {
      const firstEndpoint = categories[0].endpoints[0]
      const parts = firstEndpoint.id.split('.')
      const resource = parts.slice(0, -1).join('/')
      const action = parts[parts.length - 1]
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase()
      router.push(`/${resource}/${action}`)
    }
  }, [categories, router])

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          v0 SDK Playground
        </h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
