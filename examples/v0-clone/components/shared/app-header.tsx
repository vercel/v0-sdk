import Link from 'next/link'
import { Github } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface AppHeaderProps {
  className?: string
}

export function AppHeader({ className = '' }: AppHeaderProps) {
  const pathname = usePathname()
  const isProjectsActive = pathname?.startsWith('/projects')
  const isChatsActive = pathname === '/chats'

  return (
    <div className={`border-b border-border dark:border-input ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Always v0 Clone */}
          <Link
            href="/"
            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
          >
            v0 Clone
          </Link>

          {/* Right side - Chats, Projects and GitHub */}
          <div className="flex items-center gap-4">
            <Link
              href="/chats"
              className={`text-sm transition-colors ${
                isChatsActive
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Chats
            </Link>
            <Link
              href="/projects"
              className={`text-sm transition-colors ${
                isProjectsActive
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Projects
            </Link>
            <Link
              href="https://github.com/vercel/v0-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="View v0 SDK on GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
