export interface ClientConfig {
  apiKey?: string
  baseUrl?: string
}

export function createFetcher(config: ClientConfig = {}) {
  const baseUrl = config.baseUrl || 'https://api.v0.dev/v1'
  let sessionToken: string | null = null

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
      ...params.headers,
    }

    // Include session token in headers if available
    if (sessionToken) {
      headers['x-session-token'] = sessionToken
    }

    if (hasBody) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(finalUrl, {
      method,
      headers,
      body: hasBody ? JSON.stringify(params.body) : undefined,
    })

    // Check for session token in response headers
    const newSessionToken = res.headers.get('x-session-token')
    if (newSessionToken) {
      sessionToken = newSessionToken
    }

    if (!res.ok) {
      const { status } = res;

      switch (status) {
        case 400:
          throw new Error(`HTTP ${status}: The request was invalid or malformed.`);
        case 402:
          throw new Error(`HTTP ${status}: Payment required - please check your account credits.`);
        case 401:
          throw new Error(`HTTP ${status}: Authentication required or session expired.`);
        case 403:
          throw new Error(`HTTP ${status}: You do not have permission to access this resource - possibly due to exceeded quotas or insufficient credits.`);
        case 404:
          throw new Error(`HTTP ${status}: The requested resource was not found.`);
        case 408:
          throw new Error(`HTTP ${status}: Request timeout. Please try again.`);
        case 429:
          throw new Error(`HTTP ${status}: Too many requests - please slow down or check quota limits.`);
        case 500:
          throw new Error(`HTTP ${status}: Internal server error. Please try again later.`);
        case 502:
          throw new Error(`HTTP ${status}: Bad gateway. Try again later.`);
        case 503:
          throw new Error(`HTTP ${status}: Service unavailable. Please try again later.`);
        case 504:
          throw new Error(`HTTP ${status}: Gateway timeout. Please try again later.`);
        default:
          throw new Error(`HTTP ${status}: An unexpected error occurred. Please try again later.`);
      }
    }

    return res.json()
  }
}
