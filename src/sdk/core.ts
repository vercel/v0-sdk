export interface ClientConfig {
  apiKey?: string
  baseUrl?: string
}

export function createFetcher(config: ClientConfig = {}) {
  const baseUrl = config.baseUrl || 'https://api.v0.dev/v1'

  return async function fetcher(
    url: string,
    method: string,
    params: {
      body?: any
      query?: Record<string, string>
      pathParams?: Record<string, string>
      headers?: Record<string, string>
    } = {},
  ): Promise<any> {
    const apiKey = config.apiKey || process.env.V0_API_KEY

    if (!apiKey) {
      throw new Error(
        'API key is required. Provide it via config.apiKey or V0_API_KEY environment variable',
      )
    }

    const queryString = params.query
      ? '?' + new URLSearchParams(params.query).toString()
      : ''

    const finalUrl = baseUrl + url + queryString

    const hasBody = method !== 'GET' && params.body
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'x-session-cache': '1',
      ...params.headers,
    }

    if (hasBody) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(finalUrl, {
      method,
      headers,
      body: hasBody ? JSON.stringify(params.body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`HTTP ${res.status}: ${text}`)
    }

    return res.json()
  }
}
