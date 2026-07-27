import { v0, type MessagesSendStreamData } from 'v0'

import { authorizeProxyRequest } from '@/lib/proxy'

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied

  const { chatId } = await params
  const body = (await request.json()) as MessagesSendStreamData['body']
  const result = await v0.messages.sendStream({ chatId, ...body })
  return result.toResponse()
}
