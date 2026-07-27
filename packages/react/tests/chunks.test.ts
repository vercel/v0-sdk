import { describe, expect, test } from 'bun:test'
import { readUIMessageStream } from 'ai'
import type { V0StreamUpdate } from 'v0/browser'

import { toV0UIMessage, V0SnapshotChunkReducer, type V0UIMessage } from '../src/chat'
import { message } from './helpers'

describe('snapshot chunk reducer', () => {
  test('seeds resume state and emits only append-only suffixes', () => {
    const seed = message({
      id: 'assistant_1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello' }],
    })
    const next = { ...seed, parts: [{ type: 'text' as const, text: 'Hello world' }] }
    const update: V0StreamUpdate = {
      status: 'streaming',
      event: { object: 'message', ...next },
      message: next,
      parts: next.parts,
      usage: next.usage,
    }

    const chunks = new V0SnapshotChunkReducer(seed).push(update)
    expect(chunks).toContainEqual({
      type: 'text-delta',
      id: 'assistant_1:part:0:continuation',
      delta: ' world',
    })
    expect(chunks.some((chunk) => chunk.type === 'text-delta' && chunk.delta === 'Hello')).toBe(
      false,
    )
  })

  test('continues an existing AI SDK assistant without duplicating its prefix', async () => {
    const seed = message({
      id: 'assistant_1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello' }],
    })
    const next = { ...seed, parts: [{ type: 'text' as const, text: 'Hello world' }] }
    const update: V0StreamUpdate = {
      status: 'streaming',
      event: { object: 'message', ...next },
      message: next,
      parts: next.parts,
      usage: next.usage,
    }
    const finished = { ...next, finishReason: 'stop' as const }
    const reducer = new V0SnapshotChunkReducer(seed)
    const chunks = [
      ...reducer.push(update),
      ...reducer.push({
        ...update,
        status: 'done',
        event: { object: 'message', ...finished },
        message: finished,
      }),
    ]
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      },
    })

    let current: V0UIMessage | undefined
    for await (const nextMessage of readUIMessageStream<V0UIMessage>({
      message: toV0UIMessage(seed),
      stream,
    })) {
      current = nextMessage
    }

    expect(
      current?.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(''),
    ).toBe('Hello world')
  })

  test('synthesizes an assistant from current v0 parts-only stream events', () => {
    const createdAt = new Date('2026-01-02T03:04:05.000Z')
    const update: V0StreamUpdate = {
      status: 'streaming',
      event: { object: 'message.parts.chunk', id: 'assistant_1', delta: {} },
      chat: {
        id: 'chat_1',
        privacy: 'private',
        createdAt,
        authorId: 'user_1',
        metadata: {},
        writePermission: true,
      },
      parts: [{ type: 'text', text: 'Visible text' }],
    }

    const chunks = new V0SnapshotChunkReducer().push(update)

    expect(chunks).toContainEqual(
      expect.objectContaining({ type: 'start', messageId: 'assistant_1' }),
    )
    expect(chunks).toContainEqual({
      type: 'text-delta',
      id: 'assistant_1:part:0',
      delta: 'Visible text',
    })
    const start = chunks.find((chunk) => chunk.type === 'start')
    expect(start?.messageMetadata?.chatId).toBe('chat_1')
  })

  test('replaces rich data parts by a stable message/part id', () => {
    const first = message({
      id: 'assistant_1',
      role: 'assistant',
      parts: [{ type: 'bash', command: 'pwd', output: '/tmp' }],
    })
    const second = {
      ...first,
      parts: [{ type: 'bash' as const, command: 'pwd', output: '/tmp/project' }],
    }
    const reducer = new V0SnapshotChunkReducer()
    const makeUpdate = (snapshot: typeof first): V0StreamUpdate => ({
      status: 'streaming',
      event: { object: 'message', ...snapshot },
      message: snapshot,
      parts: snapshot.parts,
      usage: snapshot.usage,
    })

    const firstData = reducer.push(makeUpdate(first)).find((chunk) => chunk.type === 'data-v0-bash')
    const secondData = reducer
      .push(makeUpdate(second as typeof first))
      .find((chunk) => chunk.type === 'data-v0-bash')
    expect(firstData && 'id' in firstData ? firstData.id : undefined).toBe('assistant_1:part:0')
    expect(secondData && 'id' in secondData ? secondData.id : undefined).toBe('assistant_1:part:0')
  })

  test('produces a stream accepted by the real AI SDK message reducer', async () => {
    const snapshot = message({
      id: 'assistant_1',
      role: 'assistant',
      finishReason: 'stop',
      parts: [{ type: 'text', text: 'Hello from v0' }],
    })
    const update: V0StreamUpdate = {
      status: 'streaming',
      event: { object: 'message', ...snapshot },
      message: snapshot,
      parts: snapshot.parts,
      usage: snapshot.usage,
    }
    const chunks = new V0SnapshotChunkReducer().push(update, true)
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      },
    })

    let current: V0UIMessage | undefined
    for await (const next of readUIMessageStream<V0UIMessage>({ stream })) current = next

    expect(current?.id).toBe('assistant_1')
    expect(current?.parts).toContainEqual({
      type: 'text',
      text: 'Hello from v0',
      state: 'done',
    })
    expect(current?.metadata?.id).toBe('assistant_1')
  })

  test('waits for the final snapshot so trailing usage is included', () => {
    const snapshot = message({
      id: 'assistant_1',
      role: 'assistant',
      finishReason: 'stop',
      parts: [{ type: 'text', text: 'Done', finishedAt: new Date() }],
    })
    const update: V0StreamUpdate = {
      status: 'streaming',
      event: { object: 'message', ...snapshot },
      message: snapshot,
      parts: snapshot.parts,
      usage: snapshot.usage,
    }
    const reducer = new V0SnapshotChunkReducer()
    const initial = reducer.push(update)
    const usage = {
      ...snapshot.usage,
      tokens: { ...snapshot.usage.tokens, output: 42, total: 42 },
    }
    const trailing = reducer.push({
      ...update,
      event: { object: 'message.usage', id: snapshot.id, usage },
      usage,
    })
    const final = reducer.push({ ...update, status: 'done', usage }, true)

    expect(initial.some((chunk) => chunk.type === 'finish')).toBe(false)
    expect(trailing.some((chunk) => chunk.type === 'message-metadata')).toBe(true)
    expect(final.at(-1)).toMatchObject({
      type: 'finish',
      messageMetadata: { usage },
    })
  })

  test('emits reasoning, tool, metadata, and finish chunks', () => {
    const snapshot = message({
      id: 'assistant_1',
      role: 'assistant',
      finishReason: 'stop',
      parts: [
        { type: 'thinking', text: 'Check' },
        { type: 'tool-call', name: 'lookup', input: { id: 1 }, output: 'ok', status: 'ok' },
      ],
    })
    const update: V0StreamUpdate = {
      status: 'streaming',
      event: { object: 'message', ...snapshot },
      message: snapshot,
      parts: snapshot.parts,
      usage: snapshot.usage,
    }
    const chunks = new V0SnapshotChunkReducer().push(update, true)

    expect(chunks.map((chunk) => chunk.type)).toEqual([
      'start',
      'reasoning-start',
      'reasoning-delta',
      'data-v0-tool-call',
      'reasoning-end',
      'finish',
    ])
  })
})
