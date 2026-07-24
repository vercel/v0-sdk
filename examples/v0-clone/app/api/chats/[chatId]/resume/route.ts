import { v0 } from 'v0'

export async function POST(_request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const result = await v0.chats.resume({ chatId })

  return result.toResponse()
}
