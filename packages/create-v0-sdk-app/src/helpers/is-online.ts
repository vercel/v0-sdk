import { execSync } from 'node:child_process'

export function getOnline(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      execSync('ping -c 1 8.8.8.8', { stdio: 'ignore' })
      resolve(true)
    } catch {
      resolve(false)
    }
  })
}
