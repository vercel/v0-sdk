'use client'

import { useEffect, useState } from 'react'
import { EnvSetup } from '@/components/env-setup'
import { type MissingEnvVar } from '@/lib/env-check'

interface EnvGuardProps {
  children: React.ReactNode
}

/**
 * Alternative EnvGuard implementation that skips environment variable checking
 * on Vercel deployments to avoid SSR issues. This assumes that if the app is
 * deployed on Vercel, the environment variables are properly configured.
 */
export function EnvGuardSimple({ children }: EnvGuardProps) {
  const [missingVars, setMissingVars] = useState<MissingEnvVar[]>([])
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkEnvVars = async () => {
      // Skip environment variable checking on Vercel deployments
      // This prevents the "Setup Required" screen from showing when env vars are actually configured
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        // In production (like Vercel), assume environment variables are configured
        setMissingVars([])
        setIsChecking(false)
        return
      }

      try {
        // Only check environment variables in development or when specifically needed
        const response = await fetch('/api/env-check')
        if (response.ok) {
          const data = await response.json()
          setMissingVars(data.missingVars || [])
        } else {
          // Assume environment variables are configured if check fails
          setMissingVars([])
        }
      } catch (error) {
        console.error('Error checking environment variables:', error)
        // Assume environment variables are configured if check fails
        setMissingVars([])
      } finally {
        setIsChecking(false)
      }
    }

    checkEnvVars()
  }, [])

  // Show minimal loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  if (missingVars.length > 0) {
    return <EnvSetup missingVars={missingVars} />
  }

  return <>{children}</>
}
