import { revalidatePath } from 'next/cache'
import { v0, type ChatsUpdateData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'
import { authorizeProxyRequest } from '@/lib/proxy'

type UpdateChatBody = ChatsUpdateData['body']
type RouteContext = { params: Promise<{ chatId: string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params
  const body = (await request.json().catch(() => null)) as UpdateChatBody | null

  if (!body || typeof body !== 'object') {
    return Response.json({ message: 'Chat updates are required.' }, { status: 400 })
  }

  const result = await v0.chats.update({ chatId, ...body })

  revalidatePath('/', 'layout')
  return toV0JsonResponse(result)
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params
  const result = await v0.chats.delete({ chatId })

  revalidatePath('/', 'layout')
  return toV0JsonResponse(result)
}
