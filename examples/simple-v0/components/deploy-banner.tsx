'use client'

import { useState, useEffect } from 'react'
import { XIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DeployBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)

  useEffect(() => {
    // Check if banner was previously minimized in this session
    const isMinimizedSession = sessionStorage.getItem('deploy-banner-minimized')
    if (isMinimizedSession === 'true') {
      setIsMinimized(true)
    }
    // Show banner after determining state
    setIsVisible(true)
  }, [])

  const handleToggle = () => {
    const newMinimized = !isMinimized

    if (!newMinimized) {
      // Expanding - animate down
      setIsMinimized(false)
      setIsExpanding(true)
      sessionStorage.setItem('deploy-banner-minimized', 'false')

      // After animation completes, clear expanding state
      setTimeout(() => {
        setIsExpanding(false)
      }, 300) // Match animation duration
    } else {
      // Minimizing - animate up first
      setIsAnimating(true)

      // After animation completes, actually minimize
      setTimeout(() => {
        setIsMinimized(true)
        setIsAnimating(false)
        sessionStorage.setItem('deploy-banner-minimized', 'true')
      }, 300) // Match animation duration
    }
  }

  if (!isVisible) return null

  return (
    <>
      {isMinimized ? (
        // Minimized state - floating toggle button
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0 bg-background border-border shadow-lg hover:bg-muted"
          >
            <ChevronDownIcon className="h-4 w-4 rotate-180" />
            <span className="sr-only">Expand banner</span>
          </Button>
        </div>
      ) : (
        // Expanded state - full banner
        <div
          className={`fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border text-foreground ${
            isAnimating
              ? 'animate-slide-out-up'
              : isExpanding
                ? 'animate-slide-in-down'
                : ''
          }`}
        >
          <div className="py-3 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <div className="text-sm text-muted-foreground">
                  Deploy your own copy of this demo to get started building with
                  the v0 Platform API.
                </div>
              </div>

              <div className="flex items-center gap-3 sm:flex-shrink-0">
                <Button variant="default" size="sm" asChild>
                  <a
                    href="https://vercel.com/new/clone?demo-description=The%20simplest%20way%20to%20use%20v0%20-%20just%20prompt%20and%20see%20your%20app&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F28EABpFanXbK3bENHYGPe7%2F2b37a0cf17f3f8f9a19ee23e539b62eb%2Fscreenshot.png&demo-title=Simple%20v0&demo-url=https%3A%2F%2Fsimple-demo.v0-sdk.dev&from=templates&project-name=Simple%20v0&repository-name=simple-v0&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fv0-sdk%2Ftree%2Fmain%2Fexamples%2Fsimple-v0&env=V0_API_KEY&envDescription=Get+your+v0+API+key&envLink=https%3A%2F%2Fv0.app%2Fchat%2Fsettings%2Fkeys&skippable-integrations=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 76 76" fill="none">
                      <path d="M38 1L74 74H2L38 1Z" fill="currentColor" />
                    </svg>
                    <span className="hidden sm:inline">Deploy with Vercel</span>
                    <span className="sm:hidden">Deploy</span>
                  </a>
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://github.com/vercel/v0-sdk/tree/main/examples/simple-v0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden sm:inline">View Source</span>
                    <span className="sm:hidden">Source</span>
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                  <span className="sr-only">Minimize banner</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
