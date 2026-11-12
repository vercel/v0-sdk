import { describe, expect, it } from 'bun:test'
import { createV0Client } from './index'

describe('chats.downloadArtifact', () => {
  it('returns a Blob for text artifacts', async () => {
    const v0 = createV0Client({
      auth: 'test-key',
      fetch: (async () =>
        new Response('<h1>Report</h1>', {
          headers: { 'Content-Type': 'text/html' },
        })) as unknown as typeof fetch,
    })

    const result = await v0.chats.downloadArtifact({ chatId: 'chat_1', artifactId: 'art_1' })

    expect(result.data).toBeInstanceOf(Blob)
    expect(await (result.data as Blob).text()).toBe('<h1>Report</h1>')
  })
})
