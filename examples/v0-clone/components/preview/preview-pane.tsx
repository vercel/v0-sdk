export function PreviewPane({
  chatId,
  onReadyChange,
}: {
  chatId: string
  onReadyChange?: (ready: boolean) => void
}) {
  const previewPath = `/api/v0-preview/${encodeURIComponent(chatId)}`

  return (
    <iframe
      className="h-full w-full bg-background"
      onLoad={(event) => {
        try {
          const location = event.currentTarget.contentWindow?.location
          const isPreview = location?.pathname.startsWith(previewPath) ?? false
          const isLoading = location?.pathname === `${previewPath}/loading`

          onReadyChange?.(isPreview && !isLoading)
        } catch {
          onReadyChange?.(false)
        }
      }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
      src={previewPath}
      title="Chat preview"
    />
  )
}
