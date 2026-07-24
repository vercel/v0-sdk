'use client'

import { useState } from 'react'
import { WebPreviewNavigationButton } from '@/components/ai-elements/web-preview'
import { SidebarToggleButton } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  ExternalIcon,
  EyeIcon,
  RefreshIcon,
  SettingsIcon,
  SpinnerIcon,
  VercelLogoIcon,
} from '@/lib/icons'
import { cn } from '@/lib/utils'

export type DeployChatAction = () => Promise<{ deploymentUrl: string } | { error: string }>
export type DuplicateChatAction = () => Promise<{ error: string } | void>
export type ChatView = 'preview' | 'code'

export function ChatHeader({
  chatId,
  title,
  deployChatAction,
  duplicateChatAction,
  view,
  onViewChange,
}: {
  chatId: string
  title: string
  deployChatAction: DeployChatAction
  duplicateChatAction: DuplicateChatAction
  view: ChatView
  onViewChange: (view: ChatView) => void
}) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  const publish = async () => {
    setError(null)
    setIsPublishing(true)

    try {
      const result = await deployChatAction()
      if ('error' in result) {
        setError(result.error)
        return
      }

      setDeploymentUrl(result.deploymentUrl)
    } catch {
      setError('Failed to publish chat.')
    } finally {
      setIsPublishing(false)
    }
  }

  const duplicate = async () => {
    setDuplicateError(null)
    setIsDuplicating(true)

    try {
      const result = await duplicateChatAction()
      if (result?.error) {
        setDuplicateError(result.error)
      }
    } catch {
      setDuplicateError('Failed to duplicate chat.')
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border">
      <div className="flex w-full shrink-0 items-center gap-2 px-3 md:w-80 md:max-w-[42%]">
        <SidebarToggleButton />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{title}</span>
      </div>

      <div className="hidden h-full min-w-0 flex-1 items-center justify-between gap-3 px-3 md:flex">
        <div className="flex shrink-0 items-center rounded-md bg-muted p-0.5">
          <Button
            aria-label="Preview"
            aria-pressed={view === 'preview'}
            className={cn('size-6 rounded-sm p-0', view === 'preview' && 'bg-background shadow-xs')}
            onClick={() => onViewChange('preview')}
            size="icon-xs"
            variant="ghost"
          >
            <EyeIcon className="size-3.5" />
          </Button>
          <Button
            aria-label="Code"
            aria-pressed={view === 'code'}
            className={cn('size-6 rounded-sm p-0', view === 'code' && 'bg-background shadow-xs')}
            onClick={() => onViewChange('code')}
            size="icon-xs"
            variant="ghost"
          >
            <CodeIcon className="size-3.5" />
          </Button>
        </div>

        <div className="hidden h-7 min-w-[150px] max-w-[420px] flex-1 items-center rounded-md border border-border px-0.5 lg:flex">
          <Button
            aria-label="Back"
            className="size-6 text-muted-foreground"
            disabled
            size="icon-xs"
            variant="ghost"
          >
            <ChevronLeftIcon className="size-3.5" />
          </Button>
          <Button
            aria-label="Forward"
            className="size-6 text-muted-foreground"
            disabled
            size="icon-xs"
            variant="ghost"
          >
            <ChevronRightIcon className="size-3.5" />
          </Button>
          <span className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">/</span>
          <WebPreviewNavigationButton className="size-6 p-0" disabled tooltip="Refresh preview">
            <RefreshIcon className="size-3.5" />
          </WebPreviewNavigationButton>
          <WebPreviewNavigationButton
            className="size-6 p-0"
            disabled
            tooltip="Open preview in new tab"
          >
            <ExternalIcon className="size-3.5" />
          </WebPreviewNavigationButton>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Project menu" className="size-7" size="icon-sm" variant="ghost">
                <SettingsIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={isDuplicating}
                onSelect={(event) => {
                  event.preventDefault()
                  void duplicate()
                }}
                title={duplicateError ?? undefined}
              >
                {isDuplicating ? (
                  <SpinnerIcon className="size-4 animate-spin" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
                {isDuplicating ? 'Duplicating' : 'Duplicate'}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/chats/${chatId}/download`}>
                  <DownloadIcon className="size-4" />
                  Download
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {deploymentUrl ? (
            <Button asChild className="h-7 gap-1.5 rounded-md px-2 text-xs" size="sm">
              <a href={deploymentUrl} rel="noreferrer" target="_blank">
                <VercelLogoIcon className="size-3.5" />
                View
              </a>
            </Button>
          ) : (
            <Button
              aria-label={error ?? 'Publish chat'}
              className="h-7 min-w-[72px] gap-1.5 rounded-md px-2 text-xs"
              disabled={isPublishing}
              onClick={publish}
              size="sm"
              title={error ?? undefined}
            >
              {isPublishing ? (
                <SpinnerIcon className="size-3.5 animate-spin" />
              ) : (
                <VercelLogoIcon className="size-3.5" />
              )}
              {isPublishing ? 'Publishing' : 'Publish'}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
