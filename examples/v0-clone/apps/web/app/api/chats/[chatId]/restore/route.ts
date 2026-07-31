import { v0, type ChatsRestoreMessageData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'
import { authorizeProxyRequest } from '@/lib/proxy'

type RestoreMessageBody = ChatsRestoreMessageData['body']

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params
  const body = (await request.json().catch(() => null)) as RestoreMessageBody | null

  if (typeof body?.messageId !== 'string' || !body.messageId) {
    return Response.json({ message: 'A message ID is required.' }, { status: 400 })
  }

  const result = await v0.chats.restoreMessage({
    chatId,
    messageId: body.messageId,
  })

  return toV0JsonResponse(result)
}
