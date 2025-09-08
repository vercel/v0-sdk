import { EnvSetup } from '@/components/env-setup'
import { checkRequiredEnvVars } from '@/lib/env-check'

interface EnvGuardProps {
  children: React.ReactNode
}

export function EnvGuard({ children }: EnvGuardProps) {
  const missingVars = checkRequiredEnvVars()

  if (missingVars.length > 0) {
    return <EnvSetup missingVars={missingVars} />
  }

  return <>{children}</>
}
