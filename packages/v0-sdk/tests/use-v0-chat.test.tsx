import { describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { toUIMessages } from '../src/ai-sdk'
import type { V0UIMessageChunk } from '../src/ai-sdk'
import { useV0Chat } from '../src/react'
import type { UseV0ChatHelpers, UseV0ChatOptions } from '../src/react'
import { assistantMessage, userMessage } from './helpers'

interface RecordedRequest {
  url: string
  method: string
  body: unknown
}

function sseBody(chunks: V0UIMessageChunk[]): string {
  return `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`
}

function sseResponse(chunks: V0UIMessageChunk[]): Response {
  return new Response(sseBody(chunks), {
    headers: { 'content-type': 'text/event-stream' },
  })
}

function assistantResponse(chatId: string, messageId: string, text: string): Response {
  return sseResponse([
    { type: 'start', messageId, messageMetadata: { id: messageId, chatId } },
    { type: 'text-start', id: 'text-0' },
    { type: 'text-delta', id: 'text-0', delta: text },
    { type: 'text-end', id: 'text-0' },
    { type: 'finish', messageMetadata: { id: messageId, chatId } },
  ])
}

function createFetchRecorder(respond: (request: RecordedRequest) => Response) {
  const requests: RecordedRequest[] = []

  const fetch: NonNullable<UseV0ChatOptions['fetch']> = Object.assign(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const request: RecordedRequest = {
        url: String(input),
        method: init?.method ?? 'GET',
        body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      }
      requests.push(request)
      return respond(request)
    },
    { preconnect: globalThis.fetch.preconnect },
  )

  return { fetch, requests }
}

async function renderV0Chat(options: UseV0ChatOptions) {
  const result: { current: UseV0ChatHelpers } = { current: undefined as never }

  function Harness() {
    result.current = useV0Chat(options)
    return null
  }

  const root = createRoot(document.createElement('div'))
  await act(async () => {
    root.render(<Harness />)
  })

  return {
    result,
    unmount: () => act(() => root.unmount()),
  }
}

describe('useV0Chat', () => {
  test('sends the v0 request body for a new chat', async () => {
    const { fetch, requests } = createFetchRecorder(() =>
      assistantResponse('chat_1', 'msg_2', 'Hello!'),
    )
    const { result } = await renderV0Chat({ fetch })

    await act(async () => {
      await result.current.sendMessage({ text: 'Build me a landing page' })
    })

    expect(requests).toEqual([
      {
        url: '/api/chat',
        method: 'POST',
        body: { message: 'Build me a landing page' },
      },
    ])
  })

  test('streams the assistant message into typed messages', async () => {
    const { fetch } = createFetchRecorder(() => assistantResponse('chat_1', 'msg_2', 'Hello!'))
    const { result } = await renderV0Chat({ fetch })

    await act(async () => {
      await result.current.sendMessage({ text: 'Hi' })
    })

    const assistant = result.current.messages.at(-1)

    expect(result.current.messages).toHaveLength(2)
    expect(assistant?.id).toBe('msg_2')
    expect(assistant?.metadata?.chatId).toBe('chat_1')
    expect(assistant?.parts).toEqual([{ type: 'text', text: 'Hello!', state: 'done' }])
  })

  test('derives the chatId from streamed metadata and sends it on follow-ups', async () => {
    const { fetch, requests } = createFetchRecorder(() =>
      assistantResponse('chat_1', 'msg_2', 'Hello!'),
    )
    const { result } = await renderV0Chat({ fetch })

    expect(result.current.chatId).toBeUndefined()

    await act(async () => {
      await result.current.sendMessage({ text: 'First' })
    })

    expect(result.current.chatId).toBe('chat_1')

    await act(async () => {
      await result.current.sendMessage({ text: 'Second' })
    })

    expect(requests[1]?.body).toEqual({ chatId: 'chat_1', message: 'Second' })
  })

  test('uses the chatId option as the useChat id and request chatId', async () => {
    const { fetch, requests } = createFetchRecorder(() =>
      assistantResponse('chat_9', 'msg_2', 'Hi!'),
    )
    const { result } = await renderV0Chat({ fetch, chatId: 'chat_9' })

    expect(result.current.id).toBe('chat_9')
    expect(result.current.chatId).toBe('chat_9')

    await act(async () => {
      await result.current.sendMessage({ text: 'Continue' })
    })

    expect(requests[0]?.body).toEqual({ chatId: 'chat_9', message: 'Continue' })
  })

  test('derives the chatId from initial messages', async () => {
    const { fetch, requests } = createFetchRecorder(() =>
      assistantResponse('chat_7', 'msg_3', 'More!'),
    )
    const initialMessages = toUIMessages([
      userMessage({ chatId: 'chat_7', parts: [{ type: 'text', text: 'Start' }] }),
      assistantMessage({ chatId: 'chat_7', parts: [{ type: 'text', text: 'Started' }] }),
    ])
    const { result } = await renderV0Chat({ fetch, messages: initialMessages })

    expect(result.current.chatId).toBe('chat_7')
    expect(result.current.messages).toHaveLength(2)

    await act(async () => {
      await result.current.sendMessage({ text: 'Keep going' })
    })

    expect(requests[0]?.body).toEqual({ chatId: 'chat_7', message: 'Keep going' })
  })

  test('sends file parts as v0 attachments', async () => {
    const { fetch, requests } = createFetchRecorder(() =>
      assistantResponse('chat_1', 'msg_2', 'Nice logo'),
    )
    const { result } = await renderV0Chat({ fetch })

    await act(async () => {
      await result.current.sendMessage({
        text: 'Use this logo',
        files: [{ type: 'file', url: 'https://example.com/logo.png', mediaType: 'image/png' }],
      })
    })

    expect(requests[0]?.body).toEqual({
      message: 'Use this logo',
      attachments: [{ url: 'https://example.com/logo.png' }],
    })
  })

  test('merges custom body fields into the request', async () => {
    const { fetch, requests } = createFetchRecorder(() =>
      assistantResponse('chat_1', 'msg_2', 'Hello!'),
    )
    const { result } = await renderV0Chat({ fetch, body: { systemPrompt: 'Be brief' } })

    await act(async () => {
      await result.current.sendMessage({ text: 'Hi' })
    })

    expect(requests[0]?.body).toEqual({ systemPrompt: 'Be brief', message: 'Hi' })
  })

  test('posts to a custom api path', async () => {
    const { fetch, requests } = createFetchRecorder(() =>
      assistantResponse('chat_1', 'msg_2', 'Hello!'),
    )
    const { result } = await renderV0Chat({ fetch, api: '/api/v0-chat' })

    await act(async () => {
      await result.current.sendMessage({ text: 'Hi' })
    })

    expect(requests[0]?.url).toBe('/api/v0-chat')
  })

  test('regenerate resends the last user message', async () => {
    const { fetch, requests } = createFetchRecorder(() =>
      assistantResponse('chat_1', 'msg_2', 'Hello again!'),
    )
    const { result } = await renderV0Chat({ fetch })

    await act(async () => {
      await result.current.sendMessage({ text: 'Original prompt' })
    })
    await act(async () => {
      await result.current.regenerate()
    })

    expect(requests[1]?.body).toEqual({ chatId: 'chat_1', message: 'Original prompt' })
  })

  test('resumes an in-flight generation via the chatId query parameter', async () => {
    const { fetch, requests } = createFetchRecorder((request) =>
      request.method === 'GET'
        ? assistantResponse('chat_5', 'msg_8', 'Still going')
        : new Response(null, { status: 204 }),
    )
    const { result } = await renderV0Chat({ fetch, chatId: 'chat_5', resume: true })

    await act(async () => {
      await Bun.sleep(10)
    })

    expect(requests).toEqual([{ url: '/api/chat?chatId=chat_5', method: 'GET', body: undefined }])
    expect(result.current.messages.at(-1)?.parts).toEqual([
      { type: 'text', text: 'Still going', state: 'done' },
    ])
  })

  test('handles 204 responses for resume when nothing is streaming', async () => {
    const { fetch, requests } = createFetchRecorder(() => new Response(null, { status: 204 }))
    const { result } = await renderV0Chat({ fetch, chatId: 'chat_5', resume: true })

    await act(async () => {
      await Bun.sleep(10)
    })

    expect(requests[0]?.method).toBe('GET')
    expect(result.current.error).toBeUndefined()
    expect(result.current.messages).toEqual([])
  })

  test('forwards transient chat data to onData with full typing', async () => {
    const titles: Array<string | undefined> = []
    const { fetch } = createFetchRecorder(() =>
      sseResponse([
        { type: 'start', messageId: 'msg_2', messageMetadata: { id: 'msg_2', chatId: 'chat_1' } },
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
            title: 'Landing page',
          },
        },
        { type: 'finish' },
      ]),
    )
    const { result } = await renderV0Chat({
      fetch,
      onData: (part) => {
        if (part.type === 'data-chat') {
          titles.push(part.data.title)
        }
      },
    })

    await act(async () => {
      await result.current.sendMessage({ text: 'Hi' })
    })

    expect(titles).toEqual(['Landing page'])
  })

  test('does not persist transient chat data on the message', async () => {
    const { fetch } = createFetchRecorder(() =>
      sseResponse([
        { type: 'start', messageId: 'msg_2', messageMetadata: { id: 'msg_2', chatId: 'chat_1' } },
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
          },
        },
        { type: 'text-start', id: 'text-0' },
        { type: 'text-delta', id: 'text-0', delta: 'Hi!' },
        { type: 'text-end', id: 'text-0' },
        { type: 'finish' },
      ]),
    )
    const { result } = await renderV0Chat({ fetch })

    await act(async () => {
      await result.current.sendMessage({ text: 'Hi' })
    })

    expect(result.current.messages.at(-1)?.parts).toEqual([
      { type: 'text', text: 'Hi!', state: 'done' },
    ])
  })
})
