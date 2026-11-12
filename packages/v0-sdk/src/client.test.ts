import { describe, expect, it } from 'bun:test'
import { createClient, createConfig, V0Sdk } from './browser'
import { createV0Client } from './index'

const fetchHtml = (async () =>
  new Response('<h1>Report</h1>', {
    headers: { 'Content-Type': 'text/html' },
  })) as unknown as typeof fetch

describe('chats.downloadArtifact', () => {
  it('returns a Blob for text artifacts from createV0Client', async () => {
    const v0 = createV0Client({ auth: 'test-key', fetch: fetchHtml })

    const result = await v0.chats.downloadArtifact({ chatId: 'chat_1', artifactId: 'art_1' })

    expect(result.data).toBeInstanceOf(Blob)
    expect(await (result.data as Blob).text()).toBe('<h1>Report</h1>')
  })

  it('returns a Blob for text artifacts from the browser V0Sdk', async () => {
    const sdk = new V0Sdk({
      client: createClient(createConfig({ baseUrl: 'https://api.v0.dev/v2', fetch: fetchHtml })),
    })

    const result = await sdk.chats.downloadArtifact({ chatId: 'chat_1', artifactId: 'art_1' })

    expect(result.data).toBeInstanceOf(Blob)
    expect(await (result.data as Blob).text()).toBe('<h1>Report</h1>')
  })
})
