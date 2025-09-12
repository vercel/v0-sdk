import { Suspense } from 'react'
import { HomeClient } from '@/components/home/home-client'
import { EnvSetup } from '@/components/env-setup'
import { hasEnvVars, checkRequiredEnvVars } from '@/lib/env-check'

export default function Home() {
  // If environment variables are missing, show setup screen
  if (!hasEnvVars) {
    const missingVars = checkRequiredEnvVars()
    return <EnvSetup missingVars={missingVars} />
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient />
    </Suspense>
  )
}
