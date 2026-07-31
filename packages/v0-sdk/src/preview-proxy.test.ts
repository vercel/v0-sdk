import { describe, expect, it } from 'bun:test'
import { fetchPreview } from './preview-proxy'

const PREVIEW_URL = 'https://legit-preview.example.test'
const PREVIEW_TOKEN = 'SECRET-PREVIEW-TOKEN'

function makePreview() {
  return {
    url: PREVIEW_URL,
    token: PREVIEW_TOKEN,
  } as Parameters<typeof fetchPreview>[0]['preview']
}

/**
 * Runs `fetchPreview` with a spy fetch and reports the upstream URL the helper
 * actually resolved to and the preview token it attached.
 */
async function runWithSpy(
  path: string | string[],
): Promise<{ host: string; url: string; token: string | null }> {
  let sawUrl = ''
  let sawToken: string | null = null
  const spyFetch = (async (input: Request | string | URL, init?: RequestInit) => {
    sawUrl = input instanceof URL ? input.toString() : String(input)
    sawToken = new Headers(init?.headers).get('x-v0-preview-token')
    return new Response('ok')
  }) as unknown as typeof fetch

  await fetchPreview({
    request: new Request('https://my-app.example/api/v0-preview/chat123/anything'),
    preview: makePreview(),
    fallbackUrl: 'https://my-app.example/loading',
    path,
    fetch: spyFetch,
  })

  return { host: new URL(sawUrl).host, url: sawUrl, token: sawToken }
}

describe('fetchPreview path normalization', () => {
  const previewHost = new URL(PREVIEW_URL).host

  it('keeps a protocol-relative string path on the preview origin and does not leak the token', async () => {
    const { host, token } = await runWithSpy('//attacker.example/steal')
    expect(host).toBe(previewHost)
    // The token only rode along because the request stayed on the preview host.
    expect(token).toBe(PREVIEW_TOKEN)
  })

  it('neutralizes backslash and scheme-relative string paths', async () => {
    const malicious = [
      '/\\attacker.example/steal',
      'https://attacker.example/steal',
      '\\\\attacker.example/steal',
    ]
    for (const path of malicious) {
      const { host } = await runWithSpy(path)
      expect(host).toBe(previewHost)
    }
  })

  it('forwards a normal string path unchanged on the preview origin', async () => {
    const { host, url } = await runWithSpy('nested/route')
    expect(host).toBe(previewHost)
    expect(url).toBe(`${PREVIEW_URL}/nested/route`)
  })

  it('forwards array paths (encoded) on the preview origin', async () => {
    const { host, url } = await runWithSpy(['//attacker.example', 'steal'])
    expect(host).toBe(previewHost)
    expect(url.startsWith(`${PREVIEW_URL}/`)).toBe(true)
  })
})
