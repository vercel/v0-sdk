import { v0, type MessagesResolveStreamData } from 'v0'
import { authorizeProxyRequest } from '@/lib/proxy'

type ResolveTaskBody = MessagesResolveStreamData['body']

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params
  const body = (await request.json().catch(() => null)) as ResolveTaskBody | null

  if (!body?.task) {
    return Response.json({ message: 'A task response is required.' }, { status: 400 })
  }

  const result = await v0.messages.resolveStream({
    chatId,
    task: body.task,
    modelConfiguration: body.modelConfiguration,
  })

  return result.toResponse()
}
