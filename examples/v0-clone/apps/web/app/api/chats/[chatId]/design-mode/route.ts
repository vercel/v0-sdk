import { parseDesignModeMessage, type DesignModeMessage } from 'v0'
import { authorizeProxyRequest } from '@/lib/proxy'
import { v0 } from '@/lib/v0-client'

export const maxDuration = 1800

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params

  let message: DesignModeMessage
  try {
    message = parseDesignModeMessage(await request.json())
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : 'Invalid Design Mode input.' },
      { status: 422 },
    )
  }

  const result = await v0.messages.sendStream({ chatId, ...message }, { signal: request.signal })
  return result.toResponse()
}
