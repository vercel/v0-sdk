import { v0 } from 'v0'

import { authorizeProxyRequest, toJsonResponse } from '@/lib/proxy'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string; messageId: string }> },
) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied

  const { chatId, messageId } = await params
  return toJsonResponse(await v0.messages.stop({ chatId, messageId }))
}
