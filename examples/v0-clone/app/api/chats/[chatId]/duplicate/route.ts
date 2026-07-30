import { revalidatePath } from 'next/cache'
import { v0, type ChatsDuplicateData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'

type DuplicateChatBody = ChatsDuplicateData['body']

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const body = (await request.json().catch(() => null)) as DuplicateChatBody | null
  const result = await v0.chats.duplicate({
    chatId,
    privacy: 'private',
    ...(body?.title ? { title: body.title } : {}),
  })

  revalidatePath('/', 'layout')
  return toV0JsonResponse(result)
}
