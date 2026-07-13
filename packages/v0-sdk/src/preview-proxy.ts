import type { ChatsGetPreviewResponse } from './generated'

/**
 * Options for `fetchPreview`.
 */
export type FetchPreviewOptions = {
  /**
   * Request received by your proxy route. The helper preserves the method,
   * headers, body, and query string when forwarding to the preview URL.
   */
  request: Request
  /**
   * Preview returned by `v0.chats.getPreview`, usually from your cache. Pass
   * `null` when the preview is not ready.
   */
  preview: ChatsGetPreviewResponse
  /**
   * URL to redirect the iframe to when the preview is not ready or v0 asks the
   * proxy to refresh the preview. This should point at a loading route that
   * retries your proxy route.
   */
  fallbackUrl: string | URL
  /**
   * Path under the iframe proxy route to forward to the preview URL. In Next.js
   * catch-all routes, pass the `[[...path]]` param directly.
   */
  path?: string | string[]
  /**
   * Optional fetch implementation for tests or custom runtimes. Defaults to
   * `globalThis.fetch`.
   */
  fetch?: typeof fetch
  /**
   * Called before redirecting to `fallbackUrl` when v0 returns
   * `x-v0-preview-refresh: 1`. Use this to clear your cached preview.
   */
  onPreviewRefresh?: () => void | Promise<void>
}

const previewRefreshHeader = 'x-v0-preview-refresh'
const previewTokenHeader = 'x-v0-preview-token'

/**
 * Handles one request to your preview proxy route.
 *
 * Pass the cached preview from `v0.chats.getPreview`. When a preview is
 * available, this forwards the request to the preview URL with
 * `x-v0-preview-token` attached. If no preview is available, it redirects the
 * iframe to `fallbackUrl`.
 *
 * If the preview response includes `x-v0-preview-refresh: 1`, this calls
 * `onPreviewRefresh` so your route can clear its cached preview, then redirects
 * the iframe to `fallbackUrl`. The helper does not call `v0.chats.getPreview`
 * or manage your cache.
 */
export async function fetchPreview({
  request,
  preview,
  fallbackUrl,
  path = [],
  fetch: fetchFn = globalThis.fetch,
  onPreviewRefresh,
}: FetchPreviewOptions): Promise<Response> {
  if (!preview) {
    return redirectToFallback(request, fallbackUrl)
  }

  const incomingUrl = new URL(request.url)
  const baseHeaders = new Headers(request.headers)
  baseHeaders.delete('host')

  const upstreamUrl = new URL(normalizePreviewPath(path), preview.url)
  upstreamUrl.search = incomingUrl.search

  const headers = new Headers(baseHeaders)
  headers.set(previewTokenHeader, preview.token)

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const body = hasBody ? await request.arrayBuffer() : undefined

  const response = await fetchFn(upstreamUrl, {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
  })

  if (response.headers.get(previewRefreshHeader) === '1') {
    await onPreviewRefresh?.()
    return redirectToFallback(request, fallbackUrl)
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: getPreviewResponseHeaders(response),
  })
}

function redirectToFallback(request: Request, fallbackUrl: string | URL) {
  return Response.redirect(new URL(fallbackUrl, request.url), 302)
}

function getPreviewResponseHeaders(response: Response) {
  const headers = new Headers(response.headers)
  headers.delete('content-encoding')
  headers.delete('content-length')
  return headers
}

function normalizePreviewPath(path: string | string[]) {
  if (typeof path === 'string') {
    return path.startsWith('/') ? path : `/${path}`
  }

  return `/${path.map((segment) => encodeURIComponent(segment)).join('/')}`
}
