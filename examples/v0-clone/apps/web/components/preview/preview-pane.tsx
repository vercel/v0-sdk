'use client'

import { useEffect, useRef } from 'react'
import { usePreviewProxyOrigin } from '@/components/preview/preview-proxy-provider'

export function PreviewPane({
  chatId,
  onReadyChange,
}: {
  chatId: string
  onReadyChange?: (ready: boolean) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const previewProxyOrigin = usePreviewProxyOrigin()
  const previewPath = `/api/v0-preview/${encodeURIComponent(chatId)}`
  const previewUrl = new URL(previewPath, previewProxyOrigin).toString()

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== previewProxyOrigin) return
      if (event.source !== iframeRef.current?.contentWindow) return
      if (event.data?.type !== 'v0-preview-loading') return

      onReadyChange?.(false)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onReadyChange, previewProxyOrigin])

  return (
    <iframe
      className="h-full w-full bg-background"
      onLoad={() => onReadyChange?.(true)}
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
      src={previewUrl}
      title="Chat preview"
    />
  )
}
