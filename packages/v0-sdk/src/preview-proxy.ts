import type { ChatsGetPreviewResponse } from './generated'

/**
 * Options for `fetchPreview`.
 */
export type FetchPreviewOptions = {
  /**
   * Request received by your proxy route. The helper preserves the method,
   * body, query string, and application headers when forwarding to the preview
   * URL. Credentials, hop-by-hop headers, and proxy infrastructure headers are
   * not forwarded.
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
const privateNoStore = 'private, no-store'

const hopByHopHeaders = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]

const strippedRequestHeaders = new Set([
  ...hopByHopHeaders,
  'authorization',
  'content-length',
  'cookie',
  'forwarded',
  'host',
  'via',
  'x-real-ip',
])

const strippedRequestHeaderPrefixes = ['x-envoy-', 'x-forwarded-', 'x-now-', 'x-vercel-']

const strippedResponseHeaders = [
  ...hopByHopHeaders,
  'age',
  'cache-status',
  'cdn-cache-control',
  'cf-cache-status',
  'content-encoding',
  'content-length',
  'expires',
  'set-cookie',
  'surrogate-control',
  'vercel-cdn-cache-control',
  'x-vercel-cache',
]

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

  const upstreamUrl = new URL(normalizePreviewPath(path), preview.url)

  // Defense-in-depth: the forwarded path must never leave the preview origin.
  // `normalizePreviewPath` already neutralizes protocol- and scheme-relative
  // strings, but we also refuse outright if the resolved URL somehow lands on a
  // different origin, so the `x-v0-preview-token` is never attached to a
  // cross-host request.
  if (upstreamUrl.origin !== new URL(preview.url).origin) {
    throw new Error('Preview path resolved to a different origin than the preview URL.')
  }

  upstreamUrl.search = incomingUrl.search

  const headers = getPreviewRequestHeaders(request, preview.token)

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const body = hasBody ? await request.arrayBuffer() : undefined

  const response = await fetchFn(upstreamUrl, {
    cache: 'no-store',
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
  return new Response(null, {
    status: 302,
    headers: {
      'cache-control': privateNoStore,
      location: new URL(fallbackUrl, request.url).toString(),
    },
  })
}

function getPreviewRequestHeaders(request: Request, previewToken: string) {
  const headers = new Headers(request.headers)

  const headerNames = Array.from(headers.keys())
  for (const name of headerNames) {
    if (
      strippedRequestHeaders.has(name) ||
      strippedRequestHeaderPrefixes.some((prefix) => name.startsWith(prefix))
    ) {
      headers.delete(name)
    }
  }

  headers.set(previewTokenHeader, previewToken)
  return headers
}

function getPreviewResponseHeaders(response: Response) {
  const headers = new Headers(response.headers)

  for (const name of strippedResponseHeaders) {
    headers.delete(name)
  }

  headers.set('cache-control', privateNoStore)
  return headers
}

function normalizePreviewPath(path: string | string[]) {
  if (typeof path === 'string') {
    // Collapse any leading whitespace, slashes, and backslashes before
    // prepending a single slash. Without this, a caller-influenced string such
    // as `//attacker/x`, `/\attacker/x`, or `https://attacker/x` would resolve
    // against `preview.url` as a protocol- or scheme-relative URL pointing at a
    // different origin, leaking `x-v0-preview-token` to that host. The result
    // is always a single-origin-relative path.
    return `/${path.replace(/^[\s/\\]+/, '')}`
  }

  return `/${path.map((segment) => encodeURIComponent(segment)).join('/')}`
}
