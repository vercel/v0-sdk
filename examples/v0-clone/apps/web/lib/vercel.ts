function getVercelCredentials(apiKey = process.env.V0_API_KEY) {
  if (!apiKey) throw new Error('V0_API_KEY is required')

  const [version, teamId, ...tokenParts] = apiKey.split(':')
  const token = tokenParts.join(':')

  if (version !== 'v1' || !teamId || !token) {
    throw new Error('V0_API_KEY does not contain Vercel credentials')
  }

  return { teamId, token }
}

export async function getVercelDeploymentUrl(deploymentId: string, apiKey?: string) {
  const { teamId, token } = getVercelCredentials(apiKey)
  const url = new URL(`https://api.vercel.com/v13/deployments/${encodeURIComponent(deploymentId)}`)
  url.searchParams.set('teamId', teamId)

  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Vercel deployment (${response.status})`)
  }

  const deployment: unknown = await response.json()
  if (
    !deployment ||
    typeof deployment !== 'object' ||
    !('url' in deployment) ||
    typeof deployment.url !== 'string'
  ) {
    throw new Error('Vercel deployment did not include a URL')
  }

  return `https://${deployment.url}`
}
