'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface RateLimitDialogProps {
  isOpen: boolean
  onClose: () => void
  resetTime?: string
  remaining?: number
}

export default function RateLimitDialog({
  isOpen,
  onClose,
  resetTime,
  remaining = 0
}: RateLimitDialogProps) {
  const deployUrl = "https://vercel.com/new/clone?demo-description=A%20Next.js%20application%20demonstrating%20the%20v0%20Platform%20API&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F28EABpFanXbK3bENHYGPe7%2F2b37a0cf17f3f8f9a19ee23e539b62eb%2Fscreenshot.png&demo-title=v0%20Platform%20API%20Demo&demo-url=https%3A%2F%2Fv0-centered-text-om.vercel.sh%2F&from=templates&project-name=v0%20Platform%20API%20Demo&repository-name=v0-platform-api-demo&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fv0-platform-api-demo&skippable-integrations=1"

  const formatResetTime = (timeStr?: string) => {
    if (!timeStr) return ''
    try {
      const date = new Date(timeStr)
      return date.toLocaleString()
    } catch {
      return timeStr
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Rate Limit Reached
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            You've reached the rate limit. Deploy your own copy of this demo to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 76 76" fill="none">
                <path d="M38 1L74 74H2L38 1Z" fill="currentColor" />
              </svg>
              Deploy with Vercel
            </a>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 