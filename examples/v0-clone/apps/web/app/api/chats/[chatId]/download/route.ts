import { v0 } from '@/lib/v0-client'

export async function GET(_request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const result = await v0.chats.downloadFiles({ chatId }, { parseAs: 'stream' })

  if (result.error) {
    return Response.json(result.error, { status: result.response.status })
  }

  return result.response
}
