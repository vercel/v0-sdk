import { v0, type MessagesSendData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'

type SendMessageBody = Pick<MessagesSendData['body'], 'message' | 'modelConfiguration'>

export async function GET(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const searchParams = new URL(request.url).searchParams
  const limit = Number(searchParams.get('limit') ?? 20)

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return Response.json({ message: 'limit must be between 1 and 100.' }, { status: 400 })
  }

  const result = await v0.messages.list({
    chatId,
    limit,
    ...(searchParams.get('cursor') ? { cursor: searchParams.get('cursor')! } : {}),
  })

  return toV0JsonResponse(result)
}

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const body = (await request.json().catch(() => null)) as SendMessageBody | null

  if (typeof body?.message !== 'string' || !body.message.trim()) {
    return Response.json({ message: 'Enter a message.' }, { status: 400 })
  }

  const result = await v0.messages.sendStream({
    chatId,
    message: body.message.trim(),
    modelConfiguration: body.modelConfiguration,
  })

  return result.toResponse()
}
