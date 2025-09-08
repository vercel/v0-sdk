import { execSync } from 'node:child_process'

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export function getPkgManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent

  if (userAgent) {
    if (userAgent.startsWith('yarn')) {
      return 'yarn'
    } else if (userAgent.startsWith('pnpm')) {
      return 'pnpm'
    } else if (userAgent.startsWith('bun')) {
      return 'bun'
    }
  }

  try {
    execSync('pnpm --version', { stdio: 'ignore' })
    return 'pnpm'
  } catch {
    try {
      execSync('yarn --version', { stdio: 'ignore' })
      return 'yarn'
    } catch {
      try {
        execSync('bun --version', { stdio: 'ignore' })
        return 'bun'
      } catch {
        return 'npm'
      }
    }
  }
}
