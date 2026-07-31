import { revalidatePath } from 'next/cache'
import { v0, type ChatsCreateFromZipData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'
import { authorizeProxyRequest } from '@/lib/proxy'

type CreateFromZipBody = ChatsCreateFromZipData['body']

export async function POST(request: Request) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
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
