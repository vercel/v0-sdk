import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { Message, V0Client } from 'v0'

type SendResult = Awaited<ReturnType<V0Client['messages']['send']>>
const message: Message = {
  id: 'assistant_1',
  chatId: 'chat_1',
  role: 'assistant',
  content: 'Updated',
  createdAt: new Date(),
  updatedAt: new Date(),
  parts: [],
  finishReason: 'stop',
  restorable: false,
  authorId: null,
  usage: {
    model: null,
    tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    creditsCost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  },
}
const upstreamRequest = new Request('https://api.v0.dev/v2/chats/chat_1/messages')
const send = mock(
  async (_input: unknown, _options: unknown): Promise<SendResult> => ({
    data: message,
    error: undefined,
    request: upstreamRequest,
    response: new Response(null, { status: 200 }),
  }),
)
mock.module('@/lib/v0-client', () => ({ v0: { messages: { send } } }))
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
  send.mockClear()
  send.mockResolvedValue({
    data: message,
    error: undefined,
    request: upstreamRequest,
    response: new Response(null, { status: 200 }),
  })
})

describe('Design Mode example endpoint', () => {
  test('uses the existing origin guard before parsing input or calling v0', async () => {
    const result = await POST(request(input, 'https://attacker.example'), context)
    expect(result.status).toBe(403)
    expect(send).not.toHaveBeenCalled()
  })

  test('forwards normalized edits with the request cancellation signal', async () => {
    const req = request(input)
    const result = await POST(req, context)
    expect(result.status).toBe(200)
    expect(await result.json()).toMatchObject({ id: 'assistant_1', finishReason: 'stop' })
    expect(send).toHaveBeenCalledWith({ chatId: 'chat_1', ...input }, { signal: req.signal })
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
    expect(result.status).toBe(200)
    expect(send.mock.calls[0]![0]).toEqual({ chatId: 'chat_1', designMode: input.designMode })
  })

  test('validates screenshot input', async () => {
    const body = {
      message: 'Fix this',
      designMode: {
        screenshot: { url: 'data:image/jpeg;base64,aGVsbG8=', anchorElement: '#heading' },
      },
    }
    const result = await POST(request(body), context)
    expect(result.status).toBe(200)
    expect(send.mock.calls[0]![0]).toEqual({
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
    expect(send).not.toHaveBeenCalled()
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
    expect(send).not.toHaveBeenCalled()
  })

  test('preserves upstream authorization and billing errors', async () => {
    send.mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Forbidden' },
      request: upstreamRequest,
      response: new Response(null, { status: 403 }),
    })
    const result = await POST(request(input), context)
    expect(result.status).toBe(403)
    expect(await result.json()).toEqual({ message: 'Forbidden' })
  })

  test.each(['error', 'tool-calls', null] as const)(
    'does not acknowledge an incomplete or failed generation (%s)',
    async (finishReason) => {
      send.mockResolvedValueOnce({
        data: { ...message, finishReason },
        error: undefined,
        request: upstreamRequest,
        response: new Response(null, { status: 200 }),
      })
      const result = await POST(request(input), context)
      expect(result.status).toBe(502)
      expect(await result.json()).toMatchObject({
        message: expect.stringContaining('did not complete'),
      })
    },
  )
})
