import { v0 } from 'v0'

import { authorizeProxyRequest, toJsonResponse } from '@/lib/proxy'

export async function GET(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied

  const { chatId } = await params
  const search = new URL(request.url).searchParams
  const requestedLimit = Number(search.get('limit'))
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 50
  const result = await v0.messages.list({
    chatId,
    limit,
    ...(search.get('cursor') ? { cursor: search.get('cursor')! } : {}),
  })
  return toJsonResponse(result)
}
