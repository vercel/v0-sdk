import { createClient, createConfig, type Client, type ClientOptions } from 'v0/browser'

export type V0Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export interface V0RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  /** Override the Fetch implementation for this hook. */
  fetch?: V0Fetch
}

export type V0HttpMethod = Uppercase<'get' | 'post' | 'patch' | 'delete' | 'put'>
export type V0ResponseKind = 'json' | 'stream' | 'blob'
export type V0ResponseTransformer<Data> = (data: unknown) => Data | Promise<Data>

export interface V0Operation<Data> {
  id: string
  method: V0HttpMethod
  response: V0ResponseKind
  transform?: V0ResponseTransformer<Data>
}

/** HTTP error returned by the application's v0 proxy. */
export class V0ResponseError<Body = unknown> extends Error {
  readonly status: number
  readonly statusText: string
  readonly body: Body
  readonly response: Response

  constructor(response: Response, body: Body, message?: string) {
    super(message ?? getErrorMessage(response, body))
    this.name = 'V0ResponseError'
    this.status = response.status
    this.statusText = response.statusText
    this.body = body
    this.response = response
  }
}

export async function requestV0Operation<Data, ErrorBody = unknown>(
  url: string,
  operation: V0Operation<Data>,
  input: unknown,
  options: V0RequestOptions = {},
): Promise<Data> {
  const client = createRequestClient(options)
  const resolved = buildRequestUrl(client, url, operation.method === 'GET' ? input : undefined)
  const result = await client.request<unknown, ErrorBody, true, 'fields'>({
    ...toClientOptions(options),
    baseUrl: resolved.baseUrl,
    body: operation.method === 'GET' ? undefined : input,
    method: operation.method,
    parseAs:
      operation.response === 'stream' ? 'stream' : operation.response === 'blob' ? 'blob' : 'auto',
    responseStyle: 'fields',
    throwOnError: true,
    url: resolved.path,
  })

  if (operation.response === 'stream') {
    return result.response as Data
  }
  if (operation.response === 'blob') {
    return result.data as Data
  }
  return operation.transform ? operation.transform(result.data) : (result.data as Data)
}

function createRequestClient(options: V0RequestOptions): Client {
  const client = createClient(
    createConfig<ClientOptions>({
      ...toClientOptions(options),
    }),
  )

  client.interceptors.error.use((error, response) => {
    if (!response || error instanceof V0ResponseError) {
      return error
    }
    return new V0ResponseError(response, error)
  })

  return client
}

function buildRequestUrl(client: Client, value: string, query: unknown) {
  const absolute = isAbsoluteUrl(value)
  const parsed = new URL(value, absolute ? undefined : 'http://v0.local')
  const generated = client.buildUrl({
    baseUrl: absolute ? parsed.origin : '',
    query: isRecord(query) ? query : undefined,
    url: parsed.pathname,
  })
  const generatedUrl = new URL(generated, absolute ? undefined : 'http://v0.local')

  for (const [key, item] of parsed.searchParams) {
    generatedUrl.searchParams.append(key, item)
  }

  return {
    baseUrl: absolute ? generatedUrl.origin : '',
    path: `${generatedUrl.pathname}${generatedUrl.search}`,
  }
}

function toClientOptions(options: V0RequestOptions) {
  return options as Omit<V0RequestOptions, 'fetch'> & {
    fetch?: typeof globalThis.fetch
  }
}

function isAbsoluteUrl(value: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getErrorMessage(response: Response, body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return body.message
  }

  if (typeof body === 'string' && body.trim()) {
    return body
  }

  return `v0 proxy request failed: ${response.status} ${response.statusText}`.trim()
}
