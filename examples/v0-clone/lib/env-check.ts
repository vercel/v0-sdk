export interface MissingEnvVar {
  name: string
  description: string
  example: string
  required: boolean
}

export function checkRequiredEnvVars(): MissingEnvVar[] {
  const requiredVars: MissingEnvVar[] = [
    {
      name: 'V0_API_KEY',
      description: 'Your v0 API key for generating apps',
      example: 'v0_sk_...',
      required: true,
    },
    {
      name: 'AUTH_SECRET',
      description: 'Secret key for NextAuth.js authentication',
      example: 'your-secret-key-here',
      required: true,
    },
    {
      name: 'POSTGRES_URL',
      description: 'PostgreSQL database connection string',
      example: '', // No example - user needs to provide their own
      required: true,
    },
  ]

  const missing = requiredVars.filter((envVar) => {
    const value = process.env[envVar.name]
    return !value || value.trim() === ''
  })

  return missing
}

export function hasAllRequiredEnvVars(): boolean {
  return checkRequiredEnvVars().length === 0
}

export const hasEnvVars = !!(
  process.env.V0_API_KEY &&
  process.env.AUTH_SECRET &&
  process.env.POSTGRES_URL
)
