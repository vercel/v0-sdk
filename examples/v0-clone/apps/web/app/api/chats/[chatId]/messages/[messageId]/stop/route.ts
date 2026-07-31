import { v0 } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'
import { authorizeProxyRequest } from '@/lib/proxy'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string; messageId: string }> },
) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId, messageId } = await params
  const result = await v0.messages.stop({ chatId, messageId })

  return toV0JsonResponse(result)
}
