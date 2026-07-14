import { describe, expect, test } from 'bun:test'
import { fromUIMessage, toUIMessage, toUIMessages } from '../src/ai-sdk'
import { serializeDates } from '../src/ai-sdk/ui-message'
import type { Message } from '../src/generated/types.gen'
import {
  assistantMessage,
  createdAt,
  serializedAssistantMetadata,
  updatedAt,
  usage,
  userMessage,
} from './helpers'

describe('serializeDates', () => {
  test('converts Date values to ISO strings at any depth', () => {
    expect(
      serializeDates({
        when: createdAt,
        nested: { list: [updatedAt, 'keep', 7, null] },
      }),
    ).toEqual({
      when: '2026-01-01T00:00:00.000Z',
      nested: { list: ['2026-01-01T00:00:05.000Z', 'keep', 7, null] },
    })
  })

  test('preserves primitives, null, and undefined', () => {
    expect(serializeDates('text')).toBe('text')
    expect(serializeDates(42)).toBe(42)
    expect(serializeDates(true)).toBe(true)
    expect(serializeDates(null)).toBeNull()
    expect(serializeDates(undefined)).toBeUndefined()
    expect(serializeDates({ value: undefined })).toEqual({ value: undefined })
  })
})

describe('toUIMessage', () => {
  test('maps every v0 part type onto the AI SDK part union', () => {
    const message = assistantMessage({
      parts: [
        { type: 'text', text: 'Hello' },
        { type: 'thinking', text: 'Pondering' },
        { type: 'file-read', paths: ['app/page.tsx', 'app/layout.tsx'] },
        { type: 'file-edit', operation: 'rename', path: 'a.ts', toPath: 'b.ts' },
        { type: 'search', scope: 'web', query: 'react 19' },
        { type: 'bash', command: 'bun test', output: 'ok', exitCode: 0, isDangerous: false },
        { type: 'tool-call', name: 'get_weather', input: { city: 'SF' }, output: 62, status: 'ok' },
        {
          type: 'agent-action',
          name: 'manage_todos',
          summary: 'Updated todos',
          data: { count: 3 },
        },
      ],
    })

    expect(toUIMessage(message).parts).toEqual([
      { type: 'text', text: 'Hello', state: 'done' },
      { type: 'reasoning', text: 'Pondering', state: 'done' },
      { type: 'data-file-read', id: 'part-2', data: { paths: ['app/page.tsx', 'app/layout.tsx'] } },
      {
        type: 'data-file-edit',
        id: 'part-3',
        data: { operation: 'rename', path: 'a.ts', toPath: 'b.ts' },
      },
      { type: 'data-search', id: 'part-4', data: { scope: 'web', query: 'react 19' } },
      {
        type: 'data-bash',
        id: 'part-5',
        data: { command: 'bun test', output: 'ok', exitCode: 0, isDangerous: false },
      },
      {
        type: 'data-tool-call',
        id: 'part-6',
        data: { name: 'get_weather', input: { city: 'SF' }, output: 62, status: 'ok' },
      },
      {
        type: 'data-agent-action',
        id: 'part-7',
        data: { name: 'manage_todos', summary: 'Updated todos', data: { count: 3 } },
      },
    ])
  })

  test('serializes part timestamps and preserves the full metadata', () => {
    const message = assistantMessage({
      finishReason: 'stop',
      usage: usage(42),
      parts: [{ type: 'bash', command: 'ls', startedAt: createdAt, finishedAt: updatedAt }],
    })

    const uiMessage = toUIMessage(message)

    expect(uiMessage.parts).toEqual([
      {
        type: 'data-bash',
        id: 'part-0',
        data: {
          command: 'ls',
          startedAt: '2026-01-01T00:00:00.000Z',
          finishedAt: '2026-01-01T00:00:05.000Z',
        },
      },
    ])
    expect(uiMessage.metadata).toEqual({
      ...serializedAssistantMetadata,
      finishReason: 'stop',
      usage: usage(42),
    })
  })

  test('excludes role, content, and parts from metadata', () => {
    const metadata = toUIMessage(assistantMessage({ content: 'Done' })).metadata

    expect(metadata).not.toContainKeys(['role', 'content', 'parts'])
  })

  test('prepends attachments as file parts', () => {
    const message = userMessage({
      attachments: [
        { url: 'https://example.com/logo.png', contentType: 'image/png', name: 'logo.png' },
        { url: 'https://example.com/data' },
      ],
      parts: [{ type: 'text', text: 'Use this logo' }],
    })

    expect(toUIMessage(message).parts).toEqual([
      {
        type: 'file',
        url: 'https://example.com/logo.png',
        mediaType: 'image/png',
        filename: 'logo.png',
      },
      {
        type: 'file',
        url: 'https://example.com/data',
        mediaType: 'application/octet-stream',
        filename: undefined,
      },
      { type: 'text', text: 'Use this logo', state: 'done' },
    ])
  })

  test('keeps data part ids aligned with the original part index', () => {
    const message = userMessage({
      attachments: [{ url: 'https://example.com/a.png', contentType: 'image/png' }],
      parts: [
        { type: 'text', text: 'hi' },
        { type: 'bash', command: 'ls' },
      ],
    })

    const dataPart = toUIMessage(message).parts.at(-1)

    expect(dataPart).toMatchObject({ type: 'data-bash', id: 'part-1' })
  })

  test('converts a message with no parts and no attachments', () => {
    expect(toUIMessage(assistantMessage()).parts).toEqual([])
  })
})

describe('toUIMessages', () => {
  test('orders newest-first message lists chronologically', () => {
    const first = userMessage({ id: 'msg_1', createdAt: new Date('2026-01-01T00:00:00.000Z') })
    const second = assistantMessage({
      id: 'msg_2',
      createdAt: new Date('2026-01-01T00:00:10.000Z'),
    })
    const third = userMessage({ id: 'msg_3', createdAt: new Date('2026-01-01T00:00:20.000Z') })

    const ids = toUIMessages([third, second, first]).map((message) => message.id)

    expect(ids).toEqual(['msg_1', 'msg_2', 'msg_3'])
  })

  test('keeps chronological input chronological', () => {
    const first = userMessage({ id: 'msg_1', createdAt: new Date('2026-01-01T00:00:00.000Z') })
    const second = assistantMessage({
      id: 'msg_2',
      createdAt: new Date('2026-01-01T00:00:10.000Z'),
    })

    expect(toUIMessages([first, second]).map((message) => message.id)).toEqual(['msg_1', 'msg_2'])
  })

  test('places user messages before assistant messages on identical timestamps', () => {
    const prompt = userMessage({ id: 'msg_1' })
    const reply = assistantMessage({ id: 'msg_2' })

    expect(toUIMessages([reply, prompt]).map((message) => message.id)).toEqual(['msg_1', 'msg_2'])
    expect(toUIMessages([prompt, reply]).map((message) => message.id)).toEqual(['msg_1', 'msg_2'])
  })

  test('does not mutate the input', () => {
    const newest = assistantMessage({ id: 'msg_2' })
    const oldest = userMessage({
      id: 'msg_1',
      createdAt: new Date('2025-12-31T00:00:00.000Z'),
    })
    const input = [newest, oldest]

    toUIMessages(input)

    expect(input.map((message) => message.id)).toEqual(['msg_2', 'msg_1'])
  })

  test('returns an empty array for an empty list', () => {
    expect(toUIMessages([])).toEqual([])
  })
})

describe('fromUIMessage', () => {
  test('extracts the message text', () => {
    expect(
      fromUIMessage({
        id: 'msg_1',
        role: 'user',
        parts: [{ type: 'text', text: 'Build me a landing page' }],
      }),
    ).toEqual({ message: 'Build me a landing page' })
  })

  test('joins multiple text parts with blank lines', () => {
    expect(
      fromUIMessage({
        id: 'msg_1',
        role: 'user',
        parts: [
          { type: 'text', text: 'Hello' },
          { type: 'text', text: 'world' },
        ],
      }),
    ).toEqual({ message: 'Hello\n\nworld' })
  })

  test('maps file parts to attachments', () => {
    expect(
      fromUIMessage({
        id: 'msg_1',
        role: 'user',
        parts: [
          { type: 'file', url: 'https://example.com/logo.png', mediaType: 'image/png' },
          { type: 'text', text: 'Use this logo' },
        ],
      }),
    ).toEqual({
      message: 'Use this logo',
      attachments: [{ url: 'https://example.com/logo.png' }],
    })
  })

  test('ignores reasoning and data parts', () => {
    const message = toUIMessage(
      assistantMessage({
        parts: [
          { type: 'thinking', text: 'hmm' },
          { type: 'bash', command: 'ls' },
          { type: 'text', text: 'Done' },
        ],
      }),
    )

    expect(fromUIMessage(message)).toEqual({ message: 'Done' })
  })

  test('round-trips a converted v0 user message', () => {
    const message = userMessage({
      attachments: [{ url: 'https://example.com/logo.png', contentType: 'image/png' }],
      parts: [{ type: 'text', text: 'Make it pop' }],
    })

    expect(fromUIMessage(toUIMessage(message))).toEqual({
      message: 'Make it pop',
      attachments: [{ url: 'https://example.com/logo.png' }],
    })
  })

  test('returns an empty message for a message without text parts', () => {
    expect(fromUIMessage({ id: 'msg_1', role: 'user', parts: [] })).toEqual({ message: '' })
  })

  test('accepts parameters for v0.messages.send and v0.chats.create', () => {
    const parameters = fromUIMessage({
      id: 'msg_1',
      role: 'user',
      parts: [{ type: 'text', text: 'hi' }],
    })

    const sendParameters: Parameters<
      typeof import('../src/generated/sdk.gen').Messages.prototype.send
    >[0] = { chatId: 'chat_1', ...parameters }
    const createParameters: Parameters<
      typeof import('../src/generated/sdk.gen').Chats.prototype.create
    >[0] = parameters

    expect(sendParameters.message).toBe('hi')
    expect(createParameters.message).toBe('hi')
  })
})

describe('type derivation', () => {
  test('list responses are structurally assignable to Message', () => {
    const fromList: import('../src/generated/types.gen').MessageListResponse['messages'] = []
    const messages: Message[] = fromList

    expect(toUIMessages(messages)).toEqual([])
  })
})
