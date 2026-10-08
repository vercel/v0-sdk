import { parseDesignModeMessage, type DesignModeMessage } from 'v0'
import { authorizeProxyRequest } from '@/lib/proxy'
import { v0 } from '@/lib/v0-client'
import { toV0JsonResponse } from '@/lib/v0-response'

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

  const result = await v0.messages.send({ chatId, ...message }, { signal: request.signal })
  if (result.error) return toV0JsonResponse(result)
  if (!result.data || result.data.finishReason !== 'stop') {
    return Response.json(
      {
        message:
          'Design edits did not complete. Check the conversation for errors or pending actions before trying again.',
      },
      { status: 502 },
    )
  }
  return toV0JsonResponse(result)
}
