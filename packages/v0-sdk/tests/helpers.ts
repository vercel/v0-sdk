import type { Chat, Message } from '../src/generated/types.gen'
import { createV0StreamResult } from '../src/stream/result'
import type { V0StreamEvent, V0StreamResult } from '../src/stream/result'

export const createdAt = new Date('2026-01-01T00:00:00.000Z')
export const updatedAt = new Date('2026-01-01T00:00:05.000Z')

export function usage(total: number): Message['usage'] {
  const values = { input: total, output: 0, cacheRead: 0, cacheWrite: 0, total }
  return { tokens: values, creditsCost: values }
}

export function assistantMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg_1',
    chatId: 'chat_1',
    role: 'assistant',
    createdAt,
    updatedAt,
    content: '',
    parts: [],
    finishReason: null,
    authorId: null,
    usage: usage(0),
    ...overrides,
  }
}

export function userMessage(overrides: Partial<Message> = {}): Message {
  return assistantMessage({
    id: 'msg_0',
    role: 'user',
    authorId: 'user_1',
    ...overrides,
  })
}

export function chatSnapshot(overrides: Partial<Chat> = {}): Chat {
  return {
    id: 'chat_1',
    privacy: 'private',
    createdAt,
    authorId: 'user_1',
    metadata: {},
    writePermission: true,
    ...overrides,
  }
}

export const serializedAssistantMetadata = {
  id: 'msg_1',
  chatId: 'chat_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:05.000Z',
  finishReason: null,
  authorId: null,
}

export function streamOf(events: V0StreamEvent[]): V0StreamResult {
  return createV0StreamResult(
    (async function* () {
      for (const event of events) {
        yield event
      }
    })(),
  )
}

export async function readAll<T>(stream: ReadableStream<T>): Promise<T[]> {
  const values: T[] = []
  const reader = stream.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      return values
    }
    values.push(value)
  }
}
