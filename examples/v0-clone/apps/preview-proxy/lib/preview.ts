import { fetchPreview, v0, type ChatsGetPreviewResponse } from 'v0'

type Preview = NonNullable<ChatsGetPreviewResponse>

const previewCache = new Map<string, Preview>()

async function getPreview(chatId: string) {
  const cached = previewCache.get(chatId)
  const now = Date.now()

  if (cached && cached.expiresAt.getTime() - now > 60_000) {
    return cached
  }

  const response = await v0.chats.getPreview({ chatId })
  if (response.error) throw new Error(response.error.message)

  const preview = response.data
  if (preview) previewCache.set(chatId, preview)
  else previewCache.delete(chatId)

  return preview
}

export async function proxyPreviewRequest(request: Request, chatId: string, path: string[]) {
  const proxyUrl = new URL(request.url)
  const preview = await getPreview(chatId)
  const fallbackUrl = new URL(
    `/api/v0-preview/${encodeURIComponent(chatId)}/loading`,
    proxyUrl.origin,
  )
  fallbackUrl.searchParams.set('returnTo', proxyUrl.pathname + proxyUrl.search)

  return fetchPreview({
    request,
    preview,
    path,
    fallbackUrl,
    onPreviewRefresh: () => {
      previewCache.delete(chatId)
    },
  })
}
