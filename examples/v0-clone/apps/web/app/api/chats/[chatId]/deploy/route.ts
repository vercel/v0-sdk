import { v0 } from 'v0'
import { getVercelDeploymentUrl } from '@/lib/vercel'
import { toV0JsonResponse } from '@/lib/v0-response'
import { authorizeProxyRequest } from '@/lib/proxy'

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const denied = authorizeProxyRequest(request)
  if (denied) return denied
  const { chatId } = await params
  const result = await v0.chats.deploy({ chatId })

  if (result.error) return toV0JsonResponse(result)

  try {
    const deploymentUrl = await getVercelDeploymentUrl(result.data.deploymentId)

    return toV0JsonResponse(result, {
      ...result.data,
      deploymentUrl,
    })
  } catch (error) {
    return Response.json(
      {
        message: error instanceof Error ? error.message : 'Failed to fetch the deployment URL.',
      },
      { status: 500 },
    )
  }
}
