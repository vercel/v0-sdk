import { v0 } from '@/lib/v0-client'
import { authorizeProxyRequest } from '@/lib/proxy'

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params
  const result = await v0.chats.resume({ chatId })

  return result.toResponse()
}
