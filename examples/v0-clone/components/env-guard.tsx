'use client'

import { useEffect, useState } from 'react'
import { EnvSetup } from '@/components/env-setup'
import { type MissingEnvVar } from '@/lib/env-check'

interface EnvGuardProps {
  children: React.ReactNode
}

export function EnvGuard({ children }: EnvGuardProps) {
  const [missingVars, setMissingVars] = useState<MissingEnvVar[]>([])
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check environment variables on the client side
    const checkEnvVars = async () => {
      try {
        // Make an API call to check environment variables server-side
        const response = await fetch('/api/env-check')
        if (response.ok) {
          const data = await response.json()
          console.log('Environment check response:', data)
          setMissingVars(data.missingVars || [])
        } else {
          // If API call fails, assume all environment variables are present
          // This prevents showing the setup screen when env vars are actually configured
          console.warn(
            'Failed to check environment variables from server, assuming they are configured',
            response.status,
            response.statusText,
          )
          setMissingVars([])
        }
      } catch (error) {
        console.error('Error checking environment variables:', error)
        // If there's an error, assume environment variables are configured
        // This is better for production deployments where the check might fail
        // but the actual environment variables are properly set
        setMissingVars([])
      } finally {
        setIsChecking(false)
      }
    }

    checkEnvVars()
  }, [])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (missingVars.length > 0) {
    return <EnvSetup missingVars={missingVars} />
  }

  return <>{children}</>
}
