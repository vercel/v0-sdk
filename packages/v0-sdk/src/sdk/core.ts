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
      'User-Agent': 'v0-sdk/0.1.0',
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
      const text = await res.text()
      throw new Error(`HTTP ${res.status}: ${text}`)
    }

    // Handle binary responses based on Content-Type
    const contentType = res.headers.get('content-type') || ''
    if (
      contentType.includes('application/zip') ||
      contentType.includes('application/gzip')
    ) {
      return res.arrayBuffer()
    }

    return res.json()
  }
}

// Streaming response types
export interface StreamEvent {
  event?: string
  data: string
}

// Utility function to parse streaming events
export async function* parseStreamingResponse(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<StreamEvent, void, unknown> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (line.trim() === '') continue

        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return

          try {
            yield {
              event: 'message',
              data: data,
            }
          } catch (e) {
            console.warn('Failed to parse streaming data:', e)
          }
        } else if (line.startsWith('event: ')) {
          const event = line.slice(7)
          yield {
            event: event,
            data: '',
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function createStreamingFetcher(config: ClientConfig = {}) {
  const baseUrl = config.baseUrl || 'https://api.v0.dev/v1'
  let sessionToken: string | null = null

  return async function streamingFetcher(
    url: string,
    method: string,
    params: {
      body?: any
      query?: Record<string, string>
      pathParams?: Record<string, string>
      headers?: Record<string, string>
    } = {},
  ): Promise<ReadableStream<Uint8Array>> {
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
      'User-Agent': 'v0-sdk/0.1.0',
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
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
      const text = await res.text()
      throw new Error(`HTTP ${res.status}: ${text}`)
    }

    if (!res.body) {
      throw new Error('No response body available for streaming')
    }

    return res.body
  }
}
