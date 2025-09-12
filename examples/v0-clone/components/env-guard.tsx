import { EnvSetup } from '@/components/env-setup'
import { checkRequiredEnvVars } from '@/lib/env-check'

interface EnvGuardProps {
  children: React.ReactNode
}

export async function EnvGuard({ children }: EnvGuardProps) {
  // This runs on the server where environment variables are available
  const missingVars = checkRequiredEnvVars()

  if (missingVars.length > 0) {
    return <EnvSetup missingVars={missingVars} />
  }

  return <>{children}</>
}
