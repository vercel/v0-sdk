import { fetchPreview, type ChatsGetPreviewResponse } from 'v0'
import { ensureTrustedPreviewHost } from '@/lib/trusted-host'
import { getV0ApiKeyFingerprint, v0 } from '@/lib/v0-client'

type Preview = NonNullable<ChatsGetPreviewResponse>

// This process-local cache is enough for the demo. Use a shared cache in production.
// OIDC requests bypass it because there is no API key with which to scope the entry.
// You will need to add your own auth mechanism to scope the cache.
const previewCache = new Map<string, Preview>()

async function getPreview(chatId: string, cacheKey?: string) {
  const cached = cacheKey ? previewCache.get(cacheKey) : undefined
  const now = Date.now()

  if (cached && cached.expiresAt.getTime() - now > 60_000) {
    return cached
  }

  const response = await v0.chats.getPreview({ chatId })
  if (response.error) throw new Error(response.error.message)

  const preview = response.data
  if (cacheKey) {
    if (preview) previewCache.set(cacheKey, preview)
    else previewCache.delete(cacheKey)
  }

  return preview
}

export async function proxyPreviewRequest(request: Request, chatId: string, path: string[]) {
  const proxyUrl = new URL(request.url)
  if (path.length === 0) await ensureTrustedPreviewHost(v0, proxyUrl.hostname)

  const apiKeyFingerprint = await getV0ApiKeyFingerprint()
  const cacheKey = apiKeyFingerprint ? `${apiKeyFingerprint}:${chatId}` : undefined
  const preview = await getPreview(chatId, cacheKey)
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
      if (cacheKey) previewCache.delete(cacheKey)
    },
  })
}
