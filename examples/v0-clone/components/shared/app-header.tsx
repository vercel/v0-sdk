'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChatSelector } from './chat-selector'
import { useSession } from 'next-auth/react'
import { UserNav } from '@/components/user-nav'
import { Button } from '@/components/ui/button'
import { VercelIcon, GitHubIcon } from '@/components/ui/icons'

interface AppHeaderProps {
  className?: string
}

export function AppHeader({ className = '' }: AppHeaderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isHomepage = pathname === '/'

  // Handle logo click - reset UI if on homepage, otherwise navigate to homepage
  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomepage) {
      e.preventDefault()
      // Add reset parameter to trigger UI reset
      window.location.href = '/?reset=true'
    }
    // If not on homepage, let the Link component handle navigation normally
  }

  return (
    <div className={`border-b border-border dark:border-input ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Selector */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
            >
              v0 Clone
            </Link>
            <ChatSelector />
          </div>

          {/* Right side - GitHub, Deploy, and User */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="py-1.5 px-2 h-fit text-sm"
              asChild
            >
              <Link
                href="https://github.com/vercel/v0-sdk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon size={16} />
                <span className="ml-2">vercel/v0-sdk</span>
              </Link>
            </Button>

            {/* Deploy with Vercel button - hidden on mobile */}
            <Button
              className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit text-sm"
              asChild
            >
              <Link
                href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fv0-sdk&env=V0_API_KEY,AUTH_SECRET,POSTGRES_URL&envDescription=Learn+more+about+how+to+get+the+required+environment+variables&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fv0-sdk%2Fblob%2Fmain%2Fexamples%2Fv0-clone%2FREADME.md%23environment-variables&project-name=v0-clone&repository-name=v0-clone&demo-title=v0+Clone&demo-description=A+full-featured+v0+clone+built+with+Next.js%2C+AI+Elements%2C+and+the+v0+SDK&demo-url=https%3A%2F%2Fv0.dev&root-directory=examples%2Fv0-clone"
                target="_blank"
                rel="noopener noreferrer"
              >
                <VercelIcon size={16} />
                Deploy with Vercel
              </Link>
            </Button>
            {session && <UserNav session={session} />}
          </div>
        </div>
      </div>
    </div>
  )
}
