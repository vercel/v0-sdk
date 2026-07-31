type ApiKeyOptions = {
  apiKey: string
  previewProxyOrigin: string
}

export async function configureApiKey({ apiKey, previewProxyOrigin }: ApiKeyOptions) {
  const response = await fetch('/api/settings/api-key', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  })
  const body = (await response.json().catch(() => null)) as { message?: string } | null

  if (!response.ok) {
    throw new Error(body?.message || 'The v0 API key could not be saved.')
  }

  await updatePreviewProxyApiKey(previewProxyOrigin, 'PUT', apiKey)
}

export async function removeConfiguredApiKey(previewProxyOrigin: string) {
  await updatePreviewProxyApiKey(previewProxyOrigin, 'DELETE')

  const response = await fetch('/api/settings/api-key', { method: 'DELETE' })
  if (!response.ok) throw new Error('The saved API key could not be removed.')
}

async function updatePreviewProxyApiKey(
  previewProxyOrigin: string,
  method: 'PUT' | 'DELETE',
  apiKey?: string,
) {
  const response = await fetch(new URL('/api/api-key', previewProxyOrigin), {
    method,
    credentials: 'include',
    ...(apiKey
      ? {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        }
      : {}),
  }).catch(() => null)

  if (!response) {
    throw new Error(
      `Could not reach the preview proxy at ${previewProxyOrigin}. Check its deployment and allowed web origin.`,
    )
  }

  const body = (await response.json().catch(() => null)) as { message?: string } | null

  if (!response.ok) {
    throw new Error(body?.message || 'The preview proxy could not be configured.')
  }
}
