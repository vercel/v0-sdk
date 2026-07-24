import { describe, expect, test } from 'bun:test'
import type { UIMessageChunk } from 'ai'
import type { V0StreamFinal, V0StreamUpdate } from 'v0/browser'

import { toV0UIMessage, V0Transport } from '../src/chat'
import { collectStream, message, streamSnapshots, v0SseResponse } from './helpers'

function userMessage(text: string) {
  return toV0UIMessage(
    message({
      id: 'local_user',
      role: 'user',
      content: text,
      parts: [{ type: 'text', text }],
      finishReason: 'stop',
    }),
  )
}

function sendOptions(messages: ReturnType<typeof userMessage>[]) {
  return {
    trigger: 'submit-message' as const,
    chatId: 'local_chat',
    messageId: undefined,
    messages,
    abortSignal: undefined,
  }
}

const urls = {
  create: 'http://localhost/create',
  send: (chatId: string) => `http://localhost/chats/${chatId}/send`,
  resume: (chatId: string) => `http://localhost/chats/${chatId}/resume`,
}

describe('V0Transport', () => {
  test('creates on the first turn, discovers the chat id, then sends', async () => {
    const first = streamSnapshots(
      message({ id: 'assistant_1', chatId: 'chat_created', role: 'assistant' }),
      'chat_created',
    )
    const second = streamSnapshots(
      message({ id: 'assistant_2', chatId: 'chat_created', role: 'assistant' }),
      'chat_created',
    )
    const calls: Array<{ url: string; body: unknown; headers: Headers }> = []
    const responses = [
      v0SseResponse(first.updates, first.final),
      v0SseResponse(second.updates, second.final),
    ]
    const created: string[] = []
    const transport = new V0Transport({
      urls,
      onChatCreated: (id) => created.push(id),
      request: {
        headers: { 'x-default': 'yes' },
        fetch: async (input) => {
          const request = input instanceof Request ? input : new Request(input)
          calls.push({
            url: request.url,
            body: await request.clone().json(),
            headers: request.headers,
          })
          return responses.shift()!
        },
      },
    })

    const firstChunks = await collectStream(
      await transport.sendMessages({
        ...sendOptions([userMessage('hello')]),
        headers: { 'x-request': 'yes' },
      }),
    )
    expect(firstChunks).toContainEqual(
      expect.objectContaining({ type: 'start', messageId: 'assistant_1' }),
    )
    expect(transport.chatId).toBe('chat_created')
    expect(created).toEqual(['chat_created'])
    expect(calls[0]?.headers.get('x-default')).toBe('yes')
    expect(calls[0]?.headers.get('x-request')).toBe('yes')

    await collectStream(await transport.sendMessages(sendOptions([userMessage('again')])))
    expect(calls.map((call) => call.url)).toEqual([
      'http://localhost/create',
      'http://localhost/chats/chat_created/send',
    ])
    expect(calls[1]?.body).toMatchObject({ message: 'again' })
  })

  test('streams current parts-only v0 events', async () => {
    const createdAt = new Date('2026-01-02T03:04:05.000Z')
    const chat = {
      id: 'chat_created',
      privacy: 'private' as const,
      createdAt,
      authorId: 'user_1',
      metadata: {},
      writePermission: true,
    }
    const chatUpdate: V0StreamUpdate = {
      status: 'streaming',
      event: { object: 'chat', ...chat },
      chat,
      parts: [],
    }
    const partsUpdate: V0StreamUpdate = {
      status: 'streaming',
      event: { object: 'message.parts.chunk', id: 'assistant_1', delta: {} },
      chat,
      parts: [{ type: 'text', text: 'Visible text' }],
    }
    const final: V0StreamFinal = { ...partsUpdate, status: 'done' }
    const transport = new V0Transport({
      urls,
      request: {
        fetch: async () => v0SseResponse([chatUpdate, partsUpdate], final),
      },
    })

    const chunks = await collectStream(
      await transport.sendMessages(sendOptions([userMessage('hello')])),
    )

    expect(chunks).toContainEqual(
      expect.objectContaining({ type: 'start', messageId: 'assistant_1' }),
    )
    expect(chunks).toContainEqual(
      expect.objectContaining({ type: 'text-delta', delta: 'Visible text' }),
    )
  })

  test('resumes from the unfinished assistant without replaying existing text', async () => {
    const seed = message({
      id: 'assistant_1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello' }],
      finishReason: null,
    })
    const resumed = streamSnapshots({
      ...seed,
      parts: [{ type: 'text', text: 'Hello world' }],
    })
    const transport = new V0Transport({
      chatId: 'chat_1',
      messages: [seed],
      urls,
      request: { fetch: async () => v0SseResponse(resumed.updates, resumed.final) },
    })

    const stream = await transport.reconnectToStream({ chatId: 'chat_1' })
    const chunks = await collectStream(stream!)
    const deltas = chunks.filter(
      (chunk): chunk is Extract<UIMessageChunk, { type: 'text-delta' }> =>
        chunk.type === 'text-delta',
    )
    expect(deltas.map((chunk) => chunk.delta)).toEqual([' world'])
  })

  test('returns null when the resume proxy reports no active stream', async () => {
    const seed = message({ id: 'assistant_1', role: 'assistant', finishReason: null })
    const transport = new V0Transport({
      chatId: 'chat_1',
      messages: [seed],
      urls,
      request: { fetch: async () => new Response(null, { status: 204 }) },
    })

    expect(await transport.reconnectToStream({ chatId: 'chat_1' })).toBeNull()
  })

  test('returns null without an unfinished assistant and deduplicates reconnects', async () => {
    const completed = message({
      id: 'assistant_done',
      role: 'assistant',
      finishReason: 'stop',
    })
    const completedTransport = new V0Transport({
      chatId: 'chat_1',
      messages: [completed],
      urls,
    })
    expect(await completedTransport.reconnectToStream({ chatId: 'chat_1' })).toBeNull()

    const seed = message({ id: 'assistant_1', role: 'assistant', finishReason: null })
    let resolveResponse!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      resolveResponse = resolve
    })
    const transport = new V0Transport({
      chatId: 'chat_1',
      messages: [seed],
      urls,
      request: { fetch: async () => response },
    })

    const first = transport.reconnectToStream({ chatId: 'chat_1' })
    expect(await transport.reconnectToStream({ chatId: 'chat_1' })).toBeNull()
    const snapshots = streamSnapshots(seed)
    resolveResponse(v0SseResponse(snapshots.updates, snapshots.final))
    await collectStream((await first)!)
  })

  test('canceling the returned resume stream aborts its internal fetch', async () => {
    const seed = message({ id: 'assistant_1', role: 'assistant', finishReason: null })
    let requestSignal: AbortSignal | undefined
    let bodyController: ReadableStreamDefaultController<Uint8Array> | undefined
    const transport = new V0Transport({
      chatId: 'chat_1',
      messages: [seed],
      urls,
      request: {
        fetch: async (input) => {
          const request = input instanceof Request ? input : new Request(input)
          requestSignal = request.signal
          const body = new ReadableStream<Uint8Array>({
            start(controller) {
              bodyController = controller
            },
          })
          requestSignal.addEventListener('abort', () =>
            bodyController?.error(requestSignal?.reason),
          )
          return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
        },
      },
    })

    const stream = await transport.reconnectToStream({ chatId: 'chat_1' })
    await stream!.cancel('stop reading')
    expect(requestSignal?.aborted).toBe(true)
  })
})
