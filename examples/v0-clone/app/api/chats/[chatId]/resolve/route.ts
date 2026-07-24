import { v0, type MessagesResolveStreamData } from 'v0'

type ResolveTaskBody = MessagesResolveStreamData['body']

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const body = (await request.json().catch(() => null)) as ResolveTaskBody | null

  if (!body?.task) {
    return Response.json({ error: 'A task response is required.' }, { status: 400 })
  }

  const result = await v0.messages.resolveStream({
    chatId,
    task: body.task,
    modelConfiguration: body.modelConfiguration,
  })

  return result.toResponse()
}
