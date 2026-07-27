import { v0 } from 'v0'

import { authorizeProxyRequest } from '@/lib/proxy'

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied

  const { chatId } = await params
  try {
    const result = await v0.chats.resume({ chatId })
    const probe = result.stream[Symbol.asyncIterator]()
    try {
      const first = await probe.next()
      if (first.done) return new Response(null, { status: 204 })
    } finally {
      await probe.return?.()
    }
    return result.toResponse()
  } catch {
    return new Response(null, { status: 204 })
  }
}
