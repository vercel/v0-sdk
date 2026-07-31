import { revalidatePath } from 'next/cache'
import type { ChatsCreateFromZipData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'
import { v0 } from '@/lib/v0-client'

type CreateFromZipBody = ChatsCreateFromZipData['body']

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateFromZipBody | null

  if (typeof body?.url !== 'string' || !body.url) {
    return Response.json({ message: 'Choose a ZIP file.' }, { status: 400 })
  }

  const result = await v0.chats.createFromZip({
    ...body,
    privacy: 'private',
  })

  revalidatePath('/', 'layout')
  return toV0JsonResponse(result)
}
