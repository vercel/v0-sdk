import { v0 } from 'v0'
import { authorizeProxyRequest } from '@/lib/proxy'

export async function GET(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params
  const result = await v0.chats.downloadFiles({ chatId }, { parseAs: 'stream' })

  if (result.error) {
    return Response.json(result.error, { status: result.response.status })
  }

  return result.response
}
