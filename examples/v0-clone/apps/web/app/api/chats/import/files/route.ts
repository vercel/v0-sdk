import { revalidatePath } from 'next/cache'
import { v0, type ChatsCreateFromFilesData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'

type CreateFromFilesBody = ChatsCreateFromFilesData['body']

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateFromFilesBody | null

  if (!Array.isArray(body?.files) || body.files.length === 0) {
    return Response.json({ message: 'Choose at least one file.' }, { status: 400 })
  }

  const result = await v0.chats.createFromFiles({
    ...body,
    privacy: 'private',
  })

  revalidatePath('/', 'layout')
  return toV0JsonResponse(result)
}
