import { v0, type ChatsCreateVercelProjectData } from 'v0'
import { toV0JsonResponse } from '@/lib/v0-response'
import { authorizeProxyRequest } from '@/lib/proxy'

type CreateProjectBody = ChatsCreateVercelProjectData['body']

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params
  const body = (await request.json().catch(() => ({}))) as CreateProjectBody
  const result = await v0.chats.createVercelProject({
    chatId,
    ...(body.name ? { name: body.name } : {}),
  })

  return toV0JsonResponse(result)
}
