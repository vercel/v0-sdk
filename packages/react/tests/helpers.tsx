import type { ReactNode } from 'react'
import type { Message, V0StreamFinal, V0StreamUpdate } from 'v0/browser'
import { SWRConfig } from 'swr'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'

;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

export async function renderV0Hook(children: ReactNode): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer
  await act(async () => {
    renderer = create(<SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>)
  })
  return renderer
}

export async function flush(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
  })
}

export function message(id?: string): Message
export function message(overrides: Partial<Message> & Pick<Message, 'id' | 'role'>): Message
export function message(
  value: string | (Partial<Message> & Pick<Message, 'id' | 'role'>) = 'message_1',
): Message {
  const overrides = typeof value === 'string' ? { id: value, role: 'assistant' as const } : value
  const now = new Date('2026-01-02T03:04:05.000Z')
  return {
    chatId: 'chat_1',
    createdAt: now,
    updatedAt: now,
    content: '',
    parts: [],
    attachments: [],
    finishReason: overrides.role === 'assistant' ? null : 'stop',
    authorId: overrides.role === 'user' ? 'user_1' : null,
    usage: {
      tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      creditsCost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    },
    ...overrides,
  }
}

export function v0SseResponse(updates: V0StreamUpdate[], final: V0StreamFinal): Response {
  const body = [
    ...updates.map((update) => `event: update\ndata: ${JSON.stringify(update)}\n\n`),
    `event: done\ndata: ${JSON.stringify(final)}\n\n`,
  ].join('')
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
}

export async function collectStream<T>(stream: ReadableStream<T>): Promise<T[]> {
  const reader = stream.getReader()
  const values: T[] = []
  while (true) {
    const result = await reader.read()
    if (result.done) return values
    values.push(result.value)
  }
}

export function streamSnapshots(
  assistant: Message,
  chatId = assistant.chatId,
): { updates: V0StreamUpdate[]; final: V0StreamFinal } {
  const chat = {
    id: chatId,
    privacy: 'private' as const,
    createdAt: assistant.createdAt,
    authorId: 'user_1',
    metadata: {},
    writePermission: true,
  }
  const event = { object: 'message' as const, ...assistant }
  const update: V0StreamUpdate = {
    status: 'streaming',
    event,
    chat,
    message: assistant,
    parts: assistant.parts,
    usage: assistant.usage,
  }
  const finished = { ...assistant, finishReason: 'stop' as const }
  return {
    updates: [{ status: 'streaming', event: { object: 'chat', ...chat }, chat, parts: [] }, update],
    final: {
      ...update,
      status: 'done',
      event: { object: 'message', ...finished },
      message: finished,
      parts: finished.parts,
    },
  }
}
