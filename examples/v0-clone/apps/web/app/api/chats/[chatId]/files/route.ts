import type { ChatsUpdateFilesData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'
import { v0 } from '@/lib/v0-client'

type UpdateFilesBody = ChatsUpdateFilesData['body']
type RouteContext = { params: Promise<{ chatId: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  const { chatId } = await params
  const result = await v0.chats.getFiles({ chatId })

  return toV0JsonResponse(result)
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { chatId } = await params
  const body = (await request.json().catch(() => null)) as UpdateFilesBody | null

  if (!Array.isArray(body?.files) || body.files.length === 0) {
    return Response.json({ message: 'At least one file update is required.' }, { status: 400 })
  }

  const result = await v0.chats.updateFiles({
    chatId,
    files: body.files,
  })

  return toV0JsonResponse(result)
}
