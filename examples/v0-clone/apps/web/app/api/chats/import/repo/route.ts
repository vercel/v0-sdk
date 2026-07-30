import { revalidatePath } from 'next/cache'
import { v0, type ChatsCreateFromRepoData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'

type CreateFromRepoBody = ChatsCreateFromRepoData['body']

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateFromRepoBody | null

  if (typeof body?.repo?.url !== 'string' || !body.repo.url.trim()) {
    return Response.json({ message: 'Enter a repository URL.' }, { status: 400 })
  }

  const result = await v0.chats.createFromRepo({
    ...body,
    repo: {
      ...body.repo,
      url: body.repo.url.trim(),
    },
    privacy: 'private',
  })

  revalidatePath('/', 'layout')
  return toV0JsonResponse(result)
}
