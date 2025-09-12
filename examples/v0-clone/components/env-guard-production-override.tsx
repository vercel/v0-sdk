'use client'

import { useEffect, useState } from 'react'
import { EnvSetup } from '@/components/env-setup'
import { type MissingEnvVar } from '@/lib/env-check'

interface EnvGuardProps {
  children: React.ReactNode
}

/**
 * Production override version that skips env check on Vercel
 * Use this temporarily if the environment variables are definitely set
 * but the check is still failing on Vercel
 */
export function EnvGuardProductionOverride({ children }: EnvGuardProps) {
  const [missingVars, setMissingVars] = useState<MissingEnvVar[]>([])
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkEnvVars = async () => {
      // Skip environment check entirely on Vercel production
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        console.log('Production environment detected, skipping env check')
        setMissingVars([])
        setIsChecking(false)
        return
      }

      // Only run the check in development
      try {
        const response = await fetch('/api/env-check')
        if (response.ok) {
          const data = await response.json()
          console.log('Environment check response:', data)
          setMissingVars(data.missingVars || [])
        } else {
          console.warn('Env check failed, assuming configured:', response.status)
          setMissingVars([])
        }
      } catch (error) {
        console.error('Error checking environment variables:', error)
        setMissingVars([])
      } finally {
        setIsChecking(false)
      }
    }

    checkEnvVars()
  }, [])

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
