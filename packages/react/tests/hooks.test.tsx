import { afterEach, describe, expect, test } from 'bun:test'
import { act, type ReactTestRenderer } from 'react-test-renderer'

import { V0ResponseError } from '../src'
import {
  createV0Key,
  useChat,
  useChats,
  useDownloadChatFiles,
  useMessagesInfinite,
  useSendMessage,
  useSendMessageBlocking,
  useStopMessage,
} from '../src/swr'
import { flush, message, renderV0Hook } from './helpers'

describe('v0 React hooks', () => {
  let renderer: ReactTestRenderer | undefined

  afterEach(async () => {
    await act(async () => renderer?.unmount())
    renderer = undefined
  })

  test('disables queries with null URLs and includes the full URL in keys', async () => {
    let calls = 0

    function Fixture() {
      useChat(null, {
        request: {
          fetch: async () => {
            calls += 1
            return Response.json({})
          },
        },
      })
      return null
    }

    renderer = await renderV0Hook(<Fixture />)
    await flush()

    expect(calls).toBe(0)
    expect(createV0Key('chats.get', '/proxy-a/chat_1', undefined)).not.toEqual(
      createV0Key('chats.get', '/proxy-b/chat_1', undefined),
    )
  })

  test('calls the full URL, serializes deep query objects, and sends no authorization', async () => {
    let request: Request | undefined
    let state: ReturnType<typeof useChats> | undefined

    function Fixture() {
      const result = useChats(
        'http://localhost/api/v0/chats',
        { limit: 10, metadata: { environment: 'production' } },
        {
          request: {
            fetch: async (input) => {
              request = input instanceof Request ? input : new Request(input)
              return Response.json({ chats: [], cursor: null })
            },
          },
        },
      )
      void result.data
      state = result
      return null
    }

    renderer = await renderV0Hook(<Fixture />)
    await flush()

    expect(state?.data).toEqual({ chats: [], cursor: null })
    expect(request?.url).toStartWith('http://localhost/api/v0/chats?')
    const url = new URL(request!.url)
    expect(url.searchParams.get('limit')).toBe('10')
    expect(url.searchParams.get('metadata[environment]')).toBe('production')
    expect(request?.headers.has('authorization')).toBe(false)
  })

  test('preserves existing URL query values and applies generated date transformers', async () => {
    let requestedUrl = ''
    let state: ReturnType<typeof useChat> | undefined

    function Fixture() {
      const result = useChat('http://localhost/custom/chat_1?workspace=acme', {
        request: {
          fetch: async (input) => {
            const request = input instanceof Request ? input : new Request(input)
            requestedUrl = request.url
            return Response.json({
              id: 'chat_1',
              title: 'Demo',
              privacy: 'private',
              createdAt: '2026-01-02T03:04:05.000Z',
              authorId: 'user_1',
              metadata: {},
              writePermission: true,
            })
          },
        },
      })
      void result.data
      state = result
      return null
    }

    renderer = await renderV0Hook(<Fixture />)
    await flush()

    expect(new URL(requestedUrl).searchParams.get('workspace')).toBe('acme')
    expect(state?.data?.createdAt).toBeInstanceOf(Date)
  })

  test('uses the URL at hook creation and the body at trigger time', async () => {
    let request: Request | undefined
    let state: ReturnType<typeof useSendMessageBlocking> | undefined

    function Fixture() {
      state = useSendMessageBlocking('http://localhost/proxy/chats/chat_1/messages', {
        request: {
          fetch: async (input) => {
            request = input instanceof Request ? input : new Request(input)
            return Response.json(message('assistant_1'))
          },
        },
      })
      return null
    }

    renderer = await renderV0Hook(<Fixture />)

    await act(async () => {
      await state!.trigger({ message: 'Hello' })
    })

    expect(request?.method).toBe('POST')
    expect(request?.url).toBe('http://localhost/proxy/chats/chat_1/messages')
    expect(await request?.clone().json()).toEqual({ message: 'Hello' })
    expect(state?.data?.id).toBe('assistant_1')
  })

  test('returns an unconsumed raw response for streaming mutations', async () => {
    const response = new Response('data: {"type":"done"}\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    })
    let state: ReturnType<typeof useSendMessage> | undefined

    function Fixture() {
      state = useSendMessage('http://localhost/proxy/chats/chat_1/messages/stream', {
        request: { fetch: async () => response },
      })
      return null
    }

    renderer = await renderV0Hook(<Fixture />)

    let result!: Response
    await act(async () => {
      result = await state!.trigger({ message: 'Stream this' })
    })

    expect(result).toBe(response)
    expect(result.bodyUsed).toBe(false)
    expect(await result.text()).toContain('data:')
  })

  test('stops server-side generation through its full URL', async () => {
    let request: Request | undefined
    let state: ReturnType<typeof useStopMessage> | undefined

    function Fixture() {
      state = useStopMessage('http://localhost/api/v0/chats/chat_1/messages/assistant_1/stop', {
        request: {
          fetch: async (input) => {
            request = input instanceof Request ? input : new Request(input)
            return Response.json({ success: true })
          },
        },
      })
      return null
    }

    renderer = await renderV0Hook(<Fixture />)
    await act(async () => {
      await state!.trigger()
    })

    expect(request?.method).toBe('POST')
    expect(request?.url).toBe('http://localhost/api/v0/chats/chat_1/messages/assistant_1/stop')
    expect(await request?.clone().text()).toBe('')
  })

  test('downloads ZIP responses imperatively as Blob values', async () => {
    let calls = 0
    let state: ReturnType<typeof useDownloadChatFiles> | undefined

    function Fixture() {
      state = useDownloadChatFiles('http://localhost/proxy/chats/chat_1/files.zip', {
        request: {
          fetch: async () => {
            calls += 1
            return new Response('zip bytes', {
              headers: { 'Content-Type': 'application/zip' },
            })
          },
        },
      })
      return null
    }

    renderer = await renderV0Hook(<Fixture />)

    expect(calls).toBe(0)
    let blob!: Blob
    await act(async () => {
      blob = await state!.trigger()
    })
    expect(calls).toBe(1)
    expect(await blob.text()).toBe('zip bytes')
  })

  test('throws typed proxy response errors', async () => {
    let state: ReturnType<typeof useSendMessageBlocking> | undefined

    function Fixture() {
      state = useSendMessageBlocking('http://localhost/proxy/messages', {
        request: {
          fetch: async () => Response.json({ message: 'denied' }, { status: 403 }),
        },
      })
      return null
    }

    renderer = await renderV0Hook(<Fixture />)

    let error: unknown
    await act(async () => {
      try {
        await state!.trigger({ message: 'Hello' })
      } catch (nextError) {
        error = nextError
      }
    })

    expect(error).toBeInstanceOf(V0ResponseError)
    expect(error).toMatchObject({ status: 403, body: { message: 'denied' } })
  })

  test('follows response cursors for infinite message queries', async () => {
    const urls: string[] = []
    let state: ReturnType<typeof useMessagesInfinite> | undefined

    function Fixture() {
      const result = useMessagesInfinite(
        'http://localhost/proxy/chats/chat_1/messages',
        { limit: 1 },
        {
          request: {
            fetch: async (input) => {
              const request = input instanceof Request ? input : new Request(input)
              urls.push(request.url)
              const cursor = new URL(request.url).searchParams.get('cursor')
              return Response.json({
                messages: [message(cursor ? 'message_2' : 'message_1')],
                cursor: cursor ? null : 'next_cursor',
              })
            },
          },
        },
      )
      void result.data
      state = result
      return null
    }

    renderer = await renderV0Hook(<Fixture />)
    await flush()

    await act(async () => {
      await state!.setSize(2)
    })

    expect(urls.length).toBeGreaterThanOrEqual(2)
    expect(urls.some((url) => new URL(url).searchParams.get('cursor') === 'next_cursor')).toBe(true)
    expect(state?.data?.map((page) => page.messages[0]?.id)).toEqual(['message_1', 'message_2'])
  })
})
