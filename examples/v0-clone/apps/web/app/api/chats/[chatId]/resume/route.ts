import { v0 } from '@/lib/v0-client'

export async function POST(_request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const result = await v0.chats.resume({ chatId })

  return result.toResponse()
}
