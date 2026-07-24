import { v0, type MessagesSendData } from 'v0'

type SendMessageBody = Pick<MessagesSendData['body'], 'message' | 'modelConfiguration'>

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const body = (await request.json().catch(() => null)) as SendMessageBody | null

  if (typeof body?.message !== 'string' || !body.message.trim()) {
    return Response.json({ error: 'Enter a message.' }, { status: 400 })
  }

  const result = await v0.messages.sendStream({
    chatId,
    message: body.message.trim(),
    modelConfiguration: body.modelConfiguration,
  })

  return result.toResponse()
}
