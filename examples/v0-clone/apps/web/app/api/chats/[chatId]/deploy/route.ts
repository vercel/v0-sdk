import { getVercelDeploymentUrl } from '@/lib/vercel'
import { toV0JsonResponse } from '@/lib/v0-response'
import { getV0ApiKey, v0 } from '@/lib/v0-client'

export async function POST(_request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const apiKey = await getV0ApiKey()
  const { chatId } = await params
  const result = await v0.chats.deploy({ chatId })

  if (result.error) return toV0JsonResponse(result)

  try {
    const deploymentUrl = await getVercelDeploymentUrl(result.data.deploymentId, apiKey)

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
