import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { readV0Stream, type V0StreamResult } from 'v0'
import { assistant, done, streamResponse, update, wire } from './design-mode-stream'

const sendStream = mock(
  async (_input: unknown, _options: unknown): Promise<V0StreamResult> =>
    readV0Stream(streamResponse()),
)
mock.module('@/lib/v0-client', () => ({ v0: { messages: { sendStream } } }))
const { POST } = await import('../app/api/chats/[chatId]/design-mode/route')
const input = {
  message: 'Only this heading',
  designMode: {
    edits: [
      {
        type: 'style',
        element: { selectorPath: '#heading', tagName: 'h1' },
        changes: { fontSize: { from: '32px', to: '48px' } },
      },
    ],
  },
}
function request(body: unknown, origin = 'https://app.example') {
  return new Request('https://app.example/api/chats/chat_1/design-mode', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
const context = { params: Promise.resolve({ chatId: 'chat_1' }) }
beforeEach(() => {
  sendStream.mockClear()
  sendStream.mockImplementation(async () => readV0Stream(streamResponse()))
})

describe('Design Mode example endpoint', () => {
  test('uses the existing origin guard before parsing input or calling v0', async () => {
    const result = await POST(request(input, 'https://attacker.example'), context)
    expect(result.status).toBe(403)
    expect(sendStream).not.toHaveBeenCalled()
  })

  test('forwards normalized edits as SSE with the request cancellation signal', async () => {
    const req = request(input)
    const result = await POST(req, context)
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toContain('text/event-stream')
    expect((await readV0Stream(result).final).message).toMatchObject({
      id: 'assistant_1',
      finishReason: 'stop',
    })
    expect(sendStream).toHaveBeenCalledWith({ chatId: 'chat_1', ...input }, { signal: req.signal })
  })

  test('returns and forwards the first update before generation completes', async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>
    const upstream = new Response(
      new ReadableStream<Uint8Array>({
        start(value) {
          controller = value
        },
      }),
      { headers: { 'Content-Type': 'text/event-stream' } },
    )
    sendStream.mockResolvedValueOnce(readV0Stream(upstream))
    const result = await POST(request(input), context)
    const reader = result.body!.getReader()
    controller.enqueue(
      new TextEncoder().encode(
        wire('update', update(assistant({ finishReason: null, content: '', parts: [] }))),
      ),
    )
    const first = await reader.read()
    expect(first.done).toBe(false)
    expect(new TextDecoder().decode(first.value)).toContain('assistant_1')
    controller.enqueue(new TextEncoder().encode(wire('done', done(assistant()))))
    controller.close()
    while (!(await reader.read()).done) {
      /* Drain the test stream. */
    }
  })

  test('accepts structured edits without a message and strips extra capabilities', async () => {
    const result = await POST(
      request({
        designMode: input.designMode,
        modelConfiguration: { modelId: 'unexpected' },
        mcpServerIds: ['do-not-enable'],
      }),
      context,
    )
    await readV0Stream(result).final
    expect(sendStream.mock.calls[0]![0]).toEqual({ chatId: 'chat_1', designMode: input.designMode })
  })

  test('validates screenshot input', async () => {
    const body = {
      message: 'Fix this',
      designMode: {
        screenshot: { url: 'data:image/jpeg;base64,aGVsbG8=', anchorElement: '#heading' },
      },
    }
    const result = await POST(request(body), context)
    await readV0Stream(result).final
    expect(sendStream.mock.calls[0]![0]).toEqual({
      chatId: 'chat_1',
      message: 'Fix this',
      designMode: { edits: [], screenshot: body.designMode.screenshot },
    })
  })

  test.each([
    {},
    { designMode: {} },
    { designMode: { edits: [{ ...input.designMode.edits[0], changes: {} }] } },
  ])('rejects invalid input: %j', async (body) => {
    const result = await POST(request(body), context)
    expect(result.status).toBe(422)
    expect(sendStream).not.toHaveBeenCalled()
  })

  test('rejects malformed JSON', async () => {
    const result = await POST(
      new Request('https://app.example/api/chats/chat_1/design-mode', {
        method: 'POST',
        body: '{',
      }),
      context,
    )
    expect(result.status).toBe(422)
    expect(sendStream).not.toHaveBeenCalled()
  })

  test('forwards upstream stream errors instead of reporting a completed save', async () => {
    sendStream.mockResolvedValueOnce(
      readV0Stream(
        new Response(wire('error', { message: 'Forbidden', code: '403' }), {
          headers: { 'Content-Type': 'text/event-stream' },
        }),
      ),
    )
    const result = await POST(request(input), context)
    await expect(readV0Stream(result).final).rejects.toThrow('Forbidden')
  })

  test.each(['error', 'tool-calls', null] as const)(
    'forwards the final finish reason for the frontend to validate (%s)',
    async (finishReason) => {
      sendStream.mockResolvedValueOnce(readV0Stream(streamResponse(assistant({ finishReason }))))
      const result = await POST(request(input), context)
      expect((await readV0Stream(result).final).message?.finishReason).toBe(finishReason)
    },
  )
})
