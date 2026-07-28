import { v0 } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ chatId: string; messageId: string }> },
) {
  const { chatId, messageId } = await params
  const result = await v0.messages.stop({ chatId, messageId })

  return toV0JsonResponse(result)
}
