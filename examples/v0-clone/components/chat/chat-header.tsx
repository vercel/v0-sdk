'use client'

import { useDeployChat, useDownloadChatFiles, useDuplicateChat } from '@v0-sdk/react/swr'
import { useRouter } from 'next/navigation'
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

export type ChatView = 'preview' | 'code'

export function ChatHeader({
  chatId,
  title,
  view,
  onViewChange,
}: {
  chatId: string
  title: string
  view: ChatView
  onViewChange: (view: ChatView) => void
}) {
  const router = useRouter()
  const deployChat = useDeployChat(`/api/chats/${encodeURIComponent(chatId)}/deploy`)
  const duplicateChat = useDuplicateChat(`/api/chats/${encodeURIComponent(chatId)}/duplicate`)
  const downloadChat = useDownloadChatFiles(`/api/chats/${encodeURIComponent(chatId)}/download`)
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  const isPublishing = deployChat.isMutating
  const isDuplicating = duplicateChat.isMutating
  const isDownloading = downloadChat.isMutating

  const publish = async () => {
    setError(null)

    try {
      const result: unknown = await deployChat.trigger()
      const nextDeploymentUrl = readDeploymentUrl(result)
      if (!nextDeploymentUrl) {
        setError('The deployment did not return a URL.')
        return
      }

      setDeploymentUrl(nextDeploymentUrl)
    } catch (error) {
      setError(errorMessage(error, 'Failed to publish chat.'))
    }
  }

  const duplicate = async () => {
    setDuplicateError(null)

    try {
      const result = await duplicateChat.trigger({ privacy: 'private' })
      router.push(`/chats/${result.id}`)
      router.refresh()
    } catch (error) {
      setDuplicateError(errorMessage(error, 'Failed to duplicate chat.'))
    }
  }

  const download = async () => {
    setDuplicateError(null)

    try {
      const blob = await downloadChat.trigger()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${fileName(title || chatId)}.zip`
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch (error) {
      setDuplicateError(errorMessage(error, 'Failed to download chat.'))
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
              <DropdownMenuItem
                disabled={isDownloading}
                onSelect={(event) => {
                  event.preventDefault()
                  void download()
                }}
                title={duplicateError ?? undefined}
              >
                {isDownloading ? (
                  <SpinnerIcon className="size-4 animate-spin" />
                ) : (
                  <DownloadIcon className="size-4" />
                )}
                {isDownloading ? 'Downloading' : 'Download'}
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

function readDeploymentUrl(result: unknown) {
  if (
    !result ||
    typeof result !== 'object' ||
    !('deploymentUrl' in result) ||
    typeof result.deploymentUrl !== 'string'
  ) {
    return null
  }

  return result.deploymentUrl
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function fileName(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'v0-chat'
  )
}
