'use client'

import { useFiles, useMessages } from '@v0-sdk/react/swr'
import type { Message } from '@v0-sdk/react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import {
  createDesignModeBridge,
  readV0Stream,
  type DesignModeBridge,
  type DesignModeMessage,
  type DesignModeState,
} from 'v0/browser'
import { usePreviewProxyOrigin } from '@/components/preview/preview-proxy-provider'
import { Button } from '@/components/ui/button'
import { RefreshIcon, RenameIcon, SpinnerIcon } from '@/lib/icons'

export function PreviewPane({
  chatId,
  disabled,
  onReadyChange,
  onSavingChange,
  onStart,
  onAssistant,
  onSaved,
}: {
  chatId: string
  disabled: boolean
  onReadyChange?: (ready: boolean) => void
  onSavingChange: (saving: boolean) => void
  onStart: (message: DesignModeMessage) => void
  onAssistant: (message: Message) => void
  onSaved: () => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const bridgeRef = useRef<DesignModeBridge | null>(null)
  const [runtimeState, setRuntimeState] = useState<DesignModeState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const previewProxyOrigin = usePreviewProxyOrigin()
  const previewPath = `/api/v0-preview/${encodeURIComponent(chatId)}`
  const previewUrl = new URL(previewPath, previewProxyOrigin).toString()
  const { mutate: refreshMessages } = useMessages(
    `/api/chats/${encodeURIComponent(chatId)}/messages`,
    { limit: 100 },
    { revalidateOnMount: false, revalidateOnFocus: false },
  )
  const { mutate: refreshFiles } = useFiles(`/api/chats/${encodeURIComponent(chatId)}/files`, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
  })

  const apply = useEffectEvent(
    async (message: DesignModeMessage, { signal }: { signal: AbortSignal }) => {
      if (disabled)
        throw new Error('Wait for the current chat operation before applying design edits.')
      setError(null)
      onStart(message)
      onSavingChange(true)

      try {
        const response = await fetch(`/api/chats/${encodeURIComponent(chatId)}/design-mode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
          signal,
        })
        if (!response.ok) {
          const body: unknown = await response.json().catch(() => null)
          throw new Error(responseError(body, 'Failed to save design edits.'))
        }
        const result = readV0Stream(response)
        for await (const update of result.stream) {
          if (signal.aborted) return false
          if (update.message) onAssistant(update.message)
        }
        const final = await result.final
        if (!final.message || final.message.finishReason !== 'stop') {
          throw new Error(
            'The server did not confirm that the design edits completed. Check the conversation for pending actions or errors.',
          )
        }
        onAssistant(final.message)

        const [messages, files] = await Promise.allSettled([refreshMessages(), refreshFiles()])
        if (signal.aborted) return false
        if (files.status === 'fulfilled' && files.value) onSaved()
        if (
          messages.status === 'rejected' ||
          !messages.value ||
          files.status === 'rejected' ||
          !files.value
        ) {
          // A cache refresh failure must not invite a duplicate generation after a confirmed save.
          setError(
            'Edits saved, but messages or files could not refresh. Reload the page to view them.',
          )
        }
        return true
      } catch (error) {
        if (!signal.aborted) await refreshMessages().catch(() => undefined)
        throw error
      } finally {
        if (!signal.aborted) onSavingChange(false)
      }
    },
  )

  const reportError = useEffectEvent((error: Error) => {
    setError(error.message)
  })

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    let active = true
    const bridge = createDesignModeBridge({
      iframe,
      targetOrigin: previewProxyOrigin,
      onApply: (message, context) => apply(message, context),
      onError: (error) => {
        if (active) reportError(error)
      },
    })
    bridgeRef.current = bridge
    setRuntimeState(bridge.getState())
    setError(null)
    onReadyChange?.(false)
    const unsubscribe = bridge.subscribe((state) => {
      if (!active) return
      setRuntimeState(state)
      onReadyChange?.(state.connected)
    })
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== previewProxyOrigin || event.source !== iframe.contentWindow) return
      if (event.data?.type === 'v0-preview-loading') onReadyChange?.(false)
    }
    window.addEventListener('message', handleMessage)

    return () => {
      active = false
      unsubscribe()
      bridge.dispose()
      bridgeRef.current = null
      window.removeEventListener('message', handleMessage)
      onSavingChange(false)
      onReadyChange?.(false)
    }
  }, [chatId, onReadyChange, onSavingChange, previewProxyOrigin])

  useEffect(() => {
    if (disabled) bridgeRef.current?.setEnabled(false)
  }, [disabled])

  const toggleDesignMode = () => {
    const bridge = bridgeRef.current
    if (!bridge || disabled || runtimeState?.applying) return
    setError(null)
    bridge.setEnabled(!bridge.getState().enabled)
  }

  const refreshPreview = () => {
    if (!iframeRef.current || runtimeState?.applying) return
    onReadyChange?.(false)
    iframeRef.current.src = previewUrl
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button
          aria-pressed={runtimeState?.enabled ?? false}
          disabled={disabled || !runtimeState?.connected || runtimeState.applying}
          onClick={toggleDesignMode}
          size="xs"
          variant={runtimeState?.enabled ? 'secondary' : 'outline'}
        >
          <RenameIcon className="size-3.5" />
          Design Mode
        </Button>
        <span aria-live="polite" className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {runtimeState?.applying ? (
            <span className="flex items-center gap-1.5">
              <SpinnerIcon className="size-3 animate-spin" /> Saving design edits…
            </span>
          ) : !runtimeState?.connected ? (
            'Connecting to preview runtime…'
          ) : runtimeState.enabled ? (
            'Select an element, make changes, then Apply in the preview.'
          ) : (
            'Edit this preview visually'
          )}
        </span>
        <Button
          aria-label="Refresh preview"
          disabled={runtimeState?.applying}
          onClick={refreshPreview}
          size="icon-xs"
          variant="ghost"
        >
          <RefreshIcon className="size-3.5" />
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className="shrink-0 border-b border-border px-3 py-2 text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
      <iframe
        className="min-h-0 w-full flex-1 bg-background"
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        src={previewUrl}
        title="Chat preview"
      />
    </div>
  )
}

function responseError(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string')
    return body.message
  return fallback
}
