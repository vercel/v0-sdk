import { describe, expect, test } from 'bun:test'
import { readUIMessageStream } from 'ai'
import { toUIMessage, toUIMessageStream, toUIMessageStreamResponse } from '../src/ai-sdk'
import type { V0UIMessage, V0UIMessageChunk } from '../src/ai-sdk'
import type { Message } from '../src/generated/types.gen'
import { diff } from '../src/stream/diffpatch'
import type { V0StreamEvent } from '../src/stream/result'
import {
  assistantMessage,
  chatSnapshot,
  readAll,
  serializedAssistantMetadata,
  streamOf,
  updatedAt,
  usage,
} from './helpers'

function collect(events: V0StreamEvent[]): Promise<V0UIMessageChunk[]> {
  return readAll(toUIMessageStream(streamOf(events)))
}

function partsChunks(id: string, snapshots: Array<Message['parts']>): V0StreamEvent[] {
  return snapshots.slice(1).map((next, index) => ({
    id,
    object: 'message.parts.chunk' as const,
    delta: diff(snapshots[index], next),
  }))
}

describe('toUIMessageStream', () => {
  test('adapts a message stream to the AI SDK chunk protocol', async () => {
    const snapshots: Array<Message['parts']> = [
      [],
      [{ type: 'thinking', text: 'Consider' }],
      [{ type: 'thinking', text: 'Considering...', finishedAt: updatedAt }],
      [
        { type: 'thinking', text: 'Considering...', finishedAt: updatedAt },
        { type: 'file-edit', operation: 'create', path: 'app/page.tsx' },
      ],
      [
        { type: 'thinking', text: 'Considering...', finishedAt: updatedAt },
        { type: 'file-edit', operation: 'create', path: 'app/page.tsx', finishedAt: updatedAt },
        { type: 'text', text: 'Done! ' },
      ],
      [
        { type: 'thinking', text: 'Considering...', finishedAt: updatedAt },
        { type: 'file-edit', operation: 'create', path: 'app/page.tsx', finishedAt: updatedAt },
        { type: 'text', text: 'Done! Enjoy.' },
      ],
    ]

    const chunks = await collect([
      { ...assistantMessage(), object: 'message' },
      ...partsChunks('msg_1', snapshots),
      { id: 'msg_1', object: 'message.usage', usage: usage(42) },
    ])

    expect(chunks).toEqual([
      {
        type: 'start',
        messageId: 'msg_1',
        messageMetadata: { ...serializedAssistantMetadata, usage: usage(0) },
      },
      { type: 'reasoning-start', id: 'reasoning-0' },
      { type: 'reasoning-delta', id: 'reasoning-0', delta: 'Consider' },
      { type: 'reasoning-delta', id: 'reasoning-0', delta: 'ing...' },
      { type: 'reasoning-end', id: 'reasoning-0' },
      {
        type: 'data-file-edit',
        id: 'part-1',
        data: { operation: 'create', path: 'app/page.tsx' },
      },
      {
        type: 'data-file-edit',
        id: 'part-1',
        data: { operation: 'create', path: 'app/page.tsx', finishedAt: '2026-01-01T00:00:05.000Z' },
      },
      { type: 'text-start', id: 'text-2' },
      { type: 'text-delta', id: 'text-2', delta: 'Done! ' },
      { type: 'text-delta', id: 'text-2', delta: 'Enjoy.' },
      {
        type: 'message-metadata',
        messageMetadata: { ...serializedAssistantMetadata, usage: usage(42) },
      },
      { type: 'text-end', id: 'text-2' },
      {
        type: 'finish',
        finishReason: undefined,
        messageMetadata: { ...serializedAssistantMetadata, usage: usage(42) },
      },
    ])
  })

  test('delays start until the message id is known and streams transient chat data', async () => {
    const chunks = await collect([
      { ...chatSnapshot(), object: 'chat' },
      { id: 'chat_1', object: 'chat.title', delta: 'My App' },
      {
        id: 'msg_9',
        object: 'message.parts.chunk',
        delta: diff([], [{ type: 'text', text: 'Hi' }]),
      },
    ])

    expect(chunks).toEqual([
      {
        type: 'start',
        messageId: 'msg_9',
        messageMetadata: { id: 'msg_9', chatId: 'chat_1' },
      },
      {
        type: 'data-chat',
        id: 'chat',
        transient: true,
        data: {
          id: 'chat_1',
          privacy: 'private',
          createdAt: '2026-01-01T00:00:00.000Z',
          authorId: 'user_1',
          metadata: {},
          writePermission: true,
          title: 'My App',
        },
      },
      { type: 'text-start', id: 'text-0' },
      { type: 'text-delta', id: 'text-0', delta: 'Hi' },
      { type: 'text-end', id: 'text-0' },
      {
        type: 'finish',
        finishReason: undefined,
        messageMetadata: { id: 'msg_9', chatId: 'chat_1' },
      },
    ])
  })

  test('re-emits chat data when the chat changes after start', async () => {
    const chunks = await collect([
      { ...chatSnapshot(), object: 'chat' },
      {
        id: 'msg_9',
        object: 'message.parts.chunk',
        delta: diff([], [{ type: 'text', text: 'Hi' }]),
      },
      { id: 'chat_1', object: 'chat.title', delta: 'Landing page' },
    ])

    const chatChunks = chunks.filter((chunk) => chunk.type === 'data-chat')

    expect(chatChunks).toHaveLength(2)
    expect(chatChunks[0]).toMatchObject({ id: 'chat', transient: true, data: { title: undefined } })
    expect(chatChunks[1]).toMatchObject({
      id: 'chat',
      transient: true,
      data: { title: 'Landing page' },
    })
  })

  test('starts immediately when the first event carries a message id', async () => {
    const chunks = await collect([{ id: 'msg_1', object: 'message.usage', usage: usage(7) }])

    expect(chunks[0]).toEqual({
      type: 'start',
      messageId: 'msg_1',
      messageMetadata: { id: 'msg_1', usage: usage(7) },
    })
  })

  test('emits a start and finish for chat-only streams', async () => {
    const chunks = await collect([{ ...chatSnapshot(), object: 'chat' }])

    expect(chunks).toEqual([
      { type: 'start', messageId: undefined, messageMetadata: { chatId: 'chat_1' } },
      {
        type: 'data-chat',
        id: 'chat',
        transient: true,
        data: {
          id: 'chat_1',
          privacy: 'private',
          createdAt: '2026-01-01T00:00:00.000Z',
          authorId: 'user_1',
          metadata: {},
          writePermission: true,
          title: undefined,
        },
      },
      { type: 'finish', finishReason: undefined, messageMetadata: { chatId: 'chat_1' } },
    ])
  })

  test('does not repeat metadata or data chunks for unchanged state', async () => {
    const parts: Message['parts'] = [{ type: 'bash', command: 'ls', output: 'ok' }]

    const chunks = await collect([
      { ...assistantMessage({ parts }), object: 'message' },
      { ...assistantMessage({ parts }), object: 'message' },
      { id: 'msg_1', object: 'message.usage', usage: usage(0) },
    ])

    expect(chunks.filter((chunk) => chunk.type === 'data-bash')).toHaveLength(1)
    expect(chunks.filter((chunk) => chunk.type === 'message-metadata')).toHaveLength(0)
  })

  test('re-emits a data part when its payload changes', async () => {
    const chunks = await collect([
      {
        ...assistantMessage({ parts: [{ type: 'bash', command: 'bun test' }] }),
        object: 'message',
      },
      {
        ...assistantMessage({
          parts: [{ type: 'bash', command: 'bun test', output: '11 pass', exitCode: 0 }],
        }),
        object: 'message',
      },
    ])

    expect(chunks.filter((chunk) => chunk.type === 'data-bash')).toEqual([
      { type: 'data-bash', id: 'part-0', data: { command: 'bun test' } },
      {
        type: 'data-bash',
        id: 'part-0',
        data: { command: 'bun test', output: '11 pass', exitCode: 0 },
      },
    ])
  })

  test('serializes Date timestamps inside streamed parts', async () => {
    const chunks = await collect([
      {
        ...assistantMessage({
          parts: [{ type: 'search', scope: 'repo', query: 'button', startedAt: updatedAt }],
        }),
        object: 'message',
      },
    ])

    expect(chunks.find((chunk) => chunk.type === 'data-search')).toEqual({
      type: 'data-search',
      id: 'part-0',
      data: { scope: 'repo', query: 'button', startedAt: '2026-01-01T00:00:05.000Z' },
    })
  })

  test('streams interleaved text and reasoning parts with index-scoped ids', async () => {
    const snapshots: Array<Message['parts']> = [
      [],
      [{ type: 'text', text: 'One' }],
      [
        { type: 'text', text: 'One', finishedAt: updatedAt },
        { type: 'thinking', text: 'Two' },
      ],
      [
        { type: 'text', text: 'One', finishedAt: updatedAt },
        { type: 'thinking', text: 'Two', finishedAt: updatedAt },
        { type: 'text', text: 'Three' },
      ],
    ]

    const chunks = await collect([
      { ...assistantMessage(), object: 'message' },
      ...partsChunks('msg_1', snapshots),
    ])

    expect(
      chunks.filter(
        (chunk) => chunk.type.startsWith('text-') || chunk.type.startsWith('reasoning-'),
      ),
    ).toEqual([
      { type: 'text-start', id: 'text-0' },
      { type: 'text-delta', id: 'text-0', delta: 'One' },
      { type: 'text-end', id: 'text-0' },
      { type: 'reasoning-start', id: 'reasoning-1' },
      { type: 'reasoning-delta', id: 'reasoning-1', delta: 'Two' },
      { type: 'reasoning-end', id: 'reasoning-1' },
      { type: 'text-start', id: 'text-2' },
      { type: 'text-delta', id: 'text-2', delta: 'Three' },
      { type: 'text-end', id: 'text-2' },
    ])
  })

  test('reopens a finished text part under a fresh id when more text arrives', async () => {
    const chunks = await collect([
      {
        ...assistantMessage({ parts: [{ type: 'text', text: 'Hello', finishedAt: updatedAt }] }),
        object: 'message',
      },
      {
        ...assistantMessage({
          parts: [{ type: 'text', text: 'Hello world', finishedAt: updatedAt }],
          finishReason: 'stop',
        }),
        object: 'message',
      },
    ])

    expect(chunks.filter((chunk) => chunk.type.startsWith('text-'))).toEqual([
      { type: 'text-start', id: 'text-0' },
      { type: 'text-delta', id: 'text-0', delta: 'Hello' },
      { type: 'text-end', id: 'text-0' },
      { type: 'text-start', id: 'text-0-1' },
      { type: 'text-delta', id: 'text-0-1', delta: ' world' },
      { type: 'text-end', id: 'text-0-1' },
    ])

    expect(chunks.at(-1)).toMatchObject({ type: 'finish', finishReason: 'stop' })
  })

  test('emits only the diverging suffix when open text is rewritten', async () => {
    const chunks = await collect([
      {
        ...assistantMessage({ parts: [{ type: 'text', text: 'Hello world' }] }),
        object: 'message',
      },
      {
        ...assistantMessage({ parts: [{ type: 'text', text: 'Hello there' }] }),
        object: 'message',
      },
    ])

    expect(chunks.filter((chunk) => chunk.type === 'text-delta')).toEqual([
      { type: 'text-delta', id: 'text-0', delta: 'Hello world' },
      { type: 'text-delta', id: 'text-0', delta: 'there' },
    ])
  })

  test('closes an open text part when the part type changes at its index', async () => {
    const chunks = await collect([
      {
        ...assistantMessage({ parts: [{ type: 'text', text: 'Working' }] }),
        object: 'message',
      },
      {
        ...assistantMessage({ parts: [{ type: 'bash', command: 'ls' }] }),
        object: 'message',
      },
      {
        ...assistantMessage({
          parts: [{ type: 'text', text: 'Recovered' }],
        }),
        object: 'message',
      },
    ])

    expect(
      chunks.filter((chunk) => chunk.type.startsWith('text-') || chunk.type === 'data-bash'),
    ).toEqual([
      { type: 'text-start', id: 'text-0' },
      { type: 'text-delta', id: 'text-0', delta: 'Working' },
      { type: 'text-end', id: 'text-0' },
      { type: 'data-bash', id: 'part-0', data: { command: 'ls' } },
      { type: 'text-start', id: 'text-0-1' },
      { type: 'text-delta', id: 'text-0-1', delta: 'Recovered' },
      { type: 'text-end', id: 'text-0-1' },
    ])
  })

  test('carries the finish reason from the final message snapshot', async () => {
    const chunks = await collect([
      { ...assistantMessage(), object: 'message' },
      { ...assistantMessage({ finishReason: 'tool-calls' }), object: 'message' },
    ])

    expect(chunks.at(-1)).toMatchObject({ type: 'finish', finishReason: 'tool-calls' })
  })

  test('emits an error chunk when the stream fails before starting', async () => {
    const chunks = await collect([
      { ...chatSnapshot(), object: 'chat' },
      { id: 'err_1', object: 'error', message: 'boom', code: 'internal' },
    ])

    expect(chunks).toEqual([{ type: 'error', errorText: 'boom' }])
  })

  test('emits an error chunk after streamed content when the stream fails mid-flight', async () => {
    const chunks = await collect([
      {
        ...assistantMessage({ parts: [{ type: 'text', text: 'Half' }] }),
        object: 'message',
      },
      { id: 'err_1', object: 'error', message: 'quota exceeded' },
    ])

    expect(chunks.at(0)).toMatchObject({ type: 'start', messageId: 'msg_1' })
    expect(chunks.filter((chunk) => chunk.type === 'text-delta')).toEqual([
      { type: 'text-delta', id: 'text-0', delta: 'Half' },
    ])
    expect(chunks.at(-1)).toEqual({ type: 'error', errorText: 'quota exceeded' })
    expect(chunks.some((chunk) => chunk.type === 'finish')).toBe(false)
  })

  test('emits an error chunk for a stream that ends without events', async () => {
    const chunks = await collect([])

    expect(chunks).toEqual([
      { type: 'error', errorText: 'v0 stream ended before sending an event' },
    ])
  })

  test('replays the same chunks for late subscribers of a shared result', async () => {
    const result = streamOf([
      { ...assistantMessage({ parts: [{ type: 'text', text: 'Hi' }] }), object: 'message' },
    ])

    const first = await readAll(toUIMessageStream(result))
    const second = await readAll(toUIMessageStream(result))

    expect(second).toEqual(first)
  })

  test('stops consuming when the reader cancels', async () => {
    const reader = toUIMessageStream(
      streamOf([
        { ...assistantMessage({ parts: [{ type: 'text', text: 'Hi' }] }), object: 'message' },
        { ...assistantMessage({ finishReason: 'stop' }), object: 'message' },
      ]),
    ).getReader()

    const { value } = await reader.read()
    expect(value).toMatchObject({ type: 'start' })

    await reader.cancel()
  })

  test('assembles the same message that toUIMessage produces from the final snapshot', async () => {
    const finalMessage = assistantMessage({
      content: 'Done!',
      finishReason: 'stop',
      usage: usage(7),
      parts: [
        { type: 'thinking', text: 'Plan', finishedAt: updatedAt },
        { type: 'search', scope: 'web', query: 'best practices' },
        { type: 'text', text: 'Done!' },
      ],
    })

    const events: V0StreamEvent[] = [
      { ...assistantMessage(), object: 'message' },
      { id: 'msg_1', object: 'message.parts.chunk', delta: diff([], finalMessage.parts) },
      { ...finalMessage, object: 'message' },
    ]

    let assembled: V0UIMessage | undefined
    for await (const state of readUIMessageStream<V0UIMessage>({
      stream: toUIMessageStream(streamOf(events)),
    })) {
      assembled = state
    }

    const converted = toUIMessage(finalMessage)
    expect(assembled?.id).toBe(converted.id)
    expect(assembled?.role).toBe(converted.role)
    expect(assembled?.parts).toEqual(converted.parts)
    expect(assembled?.metadata).toEqual(converted.metadata)
  })
})

describe('toUIMessageStreamResponse', () => {
  test('returns an AI SDK SSE response', async () => {
    const response = toUIMessageStreamResponse(
      streamOf([{ ...assistantMessage({ finishReason: 'stop' }), object: 'message' }]),
    )

    expect(response.headers.get('content-type')).toStartWith('text/event-stream')

    const body = await response.text()
    expect(body).toContain('data: {"type":"start"')
    expect(body).toContain('"type":"finish"')
    expect(body).toContain('data: [DONE]')
  })

  test('passes response init through', async () => {
    const response = toUIMessageStreamResponse(
      streamOf([{ ...assistantMessage(), object: 'message' }]),
      { status: 201, headers: { 'x-chat-id': 'chat_1' } },
    )

    expect(response.status).toBe(201)
    expect(response.headers.get('x-chat-id')).toBe('chat_1')

    await response.body?.cancel()
  })
})
