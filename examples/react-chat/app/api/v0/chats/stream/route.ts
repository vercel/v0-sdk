import { v0, type ChatsCreateStreamData } from 'v0'

import { authorizeProxyRequest } from '@/lib/proxy'

export async function POST(request: Request) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied

  const body = (await request.json()) as ChatsCreateStreamData['body']
  const result = await v0.chats.createStream(body)
  return result.toResponse()
}
