import { revalidatePath } from 'next/cache'
import { v0, type ChatsCreateStreamData } from 'v0'

type CreateChatBody = Pick<ChatsCreateStreamData['body'], 'message' | 'modelConfiguration'>

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateChatBody | null

  if (typeof body?.message !== 'string' || !body.message.trim()) {
    return Response.json({ error: 'Enter a message.' }, { status: 400 })
  }

  const result = await v0.chats.createStream({
    message: body.message.trim(),
    modelConfiguration: body.modelConfiguration,
    privacy: 'private',
  })

  revalidatePath('/', 'layout')
  return result.toResponse()
}
