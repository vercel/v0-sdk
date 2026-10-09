import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { useEffect } from 'react'
import type { DesignModeBridge, DesignModeBridgeOptions, DesignModeState } from 'v0/browser'
import { readV0Stream } from 'v0'
import { assistant, done, streamResponse, update, wire } from './design-mode-stream'

;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true
const refreshMessages = mock(async () => ({ messages: [], cursor: null }))
const refreshFiles = mock(async () => ({ files: [] }))
// Preserve unrelated hooks for test files that run after this module mock.
const swrHooks = await import('@v0-sdk/react/swr')
mock.module('@v0-sdk/react/swr', () => ({
  ...swrHooks,
  useMessages: () => ({ mutate: refreshMessages }),
  useFiles: () => ({ mutate: refreshFiles }),
}))
mock.module('@/components/preview/preview-proxy-provider', () => ({
  usePreviewProxyOrigin: () => 'https://preview.example',
}))

type Instance = {
  options: DesignModeBridgeOptions
  bridge: DesignModeBridge
  emit: (patch: Partial<DesignModeState>) => void
  abort: AbortController
}
const instances: Instance[] = []
const makeBridge = mock((options: DesignModeBridgeOptions): DesignModeBridge => {
  let state: DesignModeState = {
    connected: false,
    enabled: false,
    applying: false,
    selection: null,
    tree: null,
  }
  const listeners = new Set<(state: DesignModeState) => void>()
  const abort = new AbortController()
  const emit = (patch: Partial<DesignModeState>) => {
    state = { ...state, ...patch }
    for (const listener of listeners) listener(state)
  }
  const bridge: DesignModeBridge = {
    ready: Promise.resolve(),
    getState: () => state,
    setEnabled: mock((enabled: boolean) => {
      emit({ enabled })
    }),
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    selectNode: async () => {},
    hoverNode: async () => {},
    clearHoveredNode: async () => {},
    setNodeVisibility: async () => {},
    dispose: mock(() => {
      abort.abort()
      listeners.clear()
    }),
  }
  instances.push({ options, bridge, emit, abort })
  return bridge
})
mock.module('v0/browser', () => ({ createDesignModeBridge: makeBridge, readV0Stream }))
const { PreviewPane } = await import('../components/preview/preview-pane')

const refreshRoute = mock(() => {})
const router = { refresh: refreshRoute }
let conversation: Parameters<
  typeof import('../components/chat/chat-conversation').ChatConversation
>[0]
let codeMounts = 0
mock.module('next/navigation', () => ({ useRouter: () => router }))
mock.module('@/components/chat/chat-header', () => ({ ChatHeader: () => <div /> }))
mock.module('@/components/chat/chat-conversation', () => ({
  ChatConversation: (props: typeof conversation) => {
    conversation = props
    return <div />
  },
}))
mock.module('@/components/chat/code-editor', () => ({
  CodeEditorLoading: () => <div />,
  CodeEditorPane: () => {
    useEffect(() => {
      codeMounts += 1
    }, [])
    return <div />
  },
}))
const { ChatWorkspace } = await import('../components/chat/chat-workspace')

const initialFetch = globalThis.fetch
const initialWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
const fetchMock = mock(async (_input: RequestInfo | URL, _init?: RequestInit) => streamResponse())
let renderer: ReactTestRenderer | undefined
const iframe = { contentWindow: {}, src: 'https://preview.example/api/v0-preview/chat_1' }

beforeEach(() => {
  instances.length = 0
  makeBridge.mockClear()
  refreshRoute.mockClear()
  codeMounts = 0
  refreshMessages.mockClear()
  refreshFiles.mockClear()
  refreshMessages.mockResolvedValue({ messages: [], cursor: null })
  refreshFiles.mockResolvedValue({ files: [] })
  fetchMock.mockClear()
  fetchMock.mockResolvedValue(streamResponse())
  globalThis.fetch = fetchMock as unknown as typeof fetch
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: Object.assign(new EventTarget(), { location: { origin: 'https://acme.example' } }),
  })
})

afterEach(async () => {
  if (renderer)
    await act(async () => {
      renderer!.unmount()
    })
  renderer = undefined
  globalThis.fetch = initialFetch
  if (initialWindow) Object.defineProperty(globalThis, 'window', initialWindow)
  else Reflect.deleteProperty(globalThis, 'window')
})

async function render(disabled = false) {
  const onReadyChange = mock((_ready: boolean) => {})
  const onSavingChange = mock((_saving: boolean) => {})
  const onSaved = mock(() => {})
  const onStart = mock((_message: Parameters<DesignModeBridgeOptions['onApply']>[0]) => {})
  const onAssistant = mock((_message: ReturnType<typeof assistant>) => {})
  const props = {
    chatId: 'chat_1',
    disabled,
    onReadyChange,
    onSavingChange,
    onStart,
    onAssistant,
    onSaved,
  }
  await act(async () => {
    renderer = create(<PreviewPane {...props} />, {
      createNodeMock: (element) => (element.type === 'iframe' ? iframe : null),
    })
  })
  const instance = instances[0]!
  await act(async () => {
    instance.emit({ connected: true })
  })
  return { instance, props, onReadyChange, onSavingChange, onSaved, onStart, onAssistant }
}

const message = { designMode: { edits: [{ type: 'fontInjection' as const, fontName: 'Inter' }] } }

async function apply(instance: Instance) {
  let accepted: boolean | void
  await act(async () => {
    accepted = await instance.options.onApply(message, { signal: instance.abort.signal })
  })
  return accepted!
}

function designButton() {
  return renderer!.root
    .findAllByType('button')
    .find((node) => node.props['aria-pressed'] !== undefined)!
}

describe('example Design Mode preview', () => {
  test('toggles the helper and only constructs one bridge across state updates', async () => {
    const { instance } = await render()
    expect(instance.options.targetOrigin).toBe('https://preview.example')
    expect(instance.options.logo).toEqual({
      url: 'https://acme.example/acme-logo.svg',
      alt: 'Acme Team',
    })
    await act(async () => {
      designButton().props['onClick']()
    })
    expect(instance.bridge.getState().enabled).toBe(true)
    expect(designButton().props['aria-pressed']).toBe(true)
    expect(makeBridge).toHaveBeenCalledTimes(1)
  })

  test('posts through the app backend, refreshes messages/files, and acknowledges completion', async () => {
    const { instance, onSaved, onSavingChange } = await render()
    expect(await apply(instance)).toBe(true)
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/chats/chat_1/design-mode')
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body as string)).toEqual(message)
    expect(fetchMock.mock.calls[0]![1]!.signal).toBe(instance.abort.signal)
    expect(refreshMessages).toHaveBeenCalledTimes(1)
    expect(refreshFiles).toHaveBeenCalledTimes(1)
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(onSavingChange.mock.calls.map(([saving]) => saving)).toEqual([true, false])
    expect(instance.bridge.dispose).not.toHaveBeenCalled()
    expect(makeBridge).toHaveBeenCalledTimes(1)
  })

  test('shows the optimistic user intent before the response headers arrive', async () => {
    const { instance, onStart, onSavingChange, onAssistant } = await render()
    let complete!: (response: Response) => void
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    let pending!: Promise<boolean | void>
    await act(async () => {
      pending = instance.options.onApply(message, { signal: instance.abort.signal })
      await Promise.resolve()
    })
    expect(onStart).toHaveBeenCalledWith(message)
    expect(onSavingChange).toHaveBeenCalledWith(true)
    expect(onAssistant).not.toHaveBeenCalled()
    await act(async () => {
      complete(streamResponse())
      await pending
    })
  })

  test('streams agent activities while keeping Apply unacknowledged until completion', async () => {
    const { instance, onAssistant, onSaved, onSavingChange } = await render()
    let controller!: ReadableStreamDefaultController<Uint8Array>
    fetchMock.mockResolvedValueOnce(
      new Response(
        new ReadableStream<Uint8Array>({
          start(value) {
            controller = value
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream' } },
      ),
    )
    let pending!: Promise<boolean | void>
    await act(async () => {
      pending = instance.options.onApply(message, { signal: instance.abort.signal })
      await Promise.resolve()
    })
    const snapshot = assistant({
      finishReason: null,
      content: '',
      parts: [{ type: 'file-read', paths: ['app/page.tsx'] }],
    })
    await act(async () => {
      controller.enqueue(new TextEncoder().encode(wire('update', update(snapshot))))
      await new Promise((resolve) => setTimeout(resolve, 10))
    })
    expect(onAssistant).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'assistant_1', finishReason: null, parts: snapshot.parts }),
    )
    expect(onSaved).not.toHaveBeenCalled()
    expect(onSavingChange.mock.calls.map(([saving]) => saving)).toEqual([true])
    await act(async () => {
      controller.enqueue(new TextEncoder().encode(wire('done', done(assistant()))))
      controller.close()
      await pending
    })
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(onSavingChange.mock.calls.map(([saving]) => saving)).toEqual([true, false])
  })

  test('rejects upstream errors and refreshes failed/pending turns for inspection', async () => {
    const { instance, onSaved, onSavingChange } = await render()
    fetchMock.mockResolvedValueOnce(
      Response.json({ message: 'Insufficient credits' }, { status: 402 }),
    )
    await expect(apply(instance)).rejects.toThrow('Insufficient credits')
    expect(onSaved).not.toHaveBeenCalled()
    expect(refreshMessages).toHaveBeenCalledTimes(1)
    expect(onSavingChange.mock.calls.map(([saving]) => saving)).toEqual([true, false])
  })

  test('does not report success for an unconfirmed generation', async () => {
    const { instance, onSaved } = await render()
    fetchMock.mockResolvedValueOnce(streamResponse(assistant({ finishReason: 'error' })))
    await expect(apply(instance)).rejects.toThrow('did not confirm')
    expect(onSaved).not.toHaveBeenCalled()
  })

  test('acknowledges a saved edit even if cache revalidation fails, preventing duplicate saves', async () => {
    const { instance, onSaved } = await render()
    refreshMessages.mockRejectedValueOnce(new Error('Offline'))
    expect(await apply(instance)).toBe(true)
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(renderer!.root.findByProps({ role: 'alert' }).children.join('')).toContain('Edits saved')
  })

  test('disables Design Mode and refuses Apply while another chat operation is running', async () => {
    const { instance, props } = await render()
    await act(async () => {
      instance.bridge.setEnabled(true)
    })
    await act(async () => {
      renderer!.update(<PreviewPane {...props} disabled />)
    })
    expect(designButton().props['disabled']).toBe(true)
    expect(instance.bridge.getState().enabled).toBe(false)
    await expect(apply(instance)).rejects.toThrow('current chat operation')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(makeBridge).toHaveBeenCalledTimes(1)
  })

  test('refreshes the workspace code/history without remounting the Apply iframe', async () => {
    await act(async () => {
      renderer = create(
        <ChatWorkspace
          chat={{
            id: 'chat_1',
            privacy: 'private',
            createdAt: new Date(),
            authorId: 'user_1',
            metadata: {},
            writePermission: true,
          }}
          messages={[]}
          filesPromise={Promise.resolve({ files: [] })}
        />,
        { createNodeMock: (element) => (element.type === 'iframe' ? iframe : null) },
      )
    })
    const instance = instances[0]!
    await act(async () => {
      instance.emit({ connected: true })
    })
    let complete!: (response: Response) => void
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    let pending: Promise<boolean | void>
    await act(async () => {
      pending = instance.options.onApply(message, { signal: instance.abort.signal })
      await Promise.resolve()
    })
    expect(conversation!.externallyBusy).toBe(true)
    expect(conversation!.designTurn?.text).toBe('Design Mode edit')
    expect(conversation!.designTurn?.assistant).toBeNull()
    await act(async () => {
      complete(streamResponse())
      await pending!
    })
    expect(conversation!.externallyBusy).toBe(false)
    expect(refreshRoute).toHaveBeenCalledTimes(1)
    expect(codeMounts).toBe(2)
    expect(makeBridge).toHaveBeenCalledTimes(1)
    expect(instance.bridge.dispose).not.toHaveBeenCalled()
  })

  test('surfaces helper errors and cleans up on unmount', async () => {
    const { instance } = await render()
    await act(async () => {
      instance.options.onError?.(new Error('Runtime unavailable'))
    })
    expect(renderer!.root.findByProps({ role: 'alert' }).children.join('')).toBe(
      'Runtime unavailable',
    )
    await act(async () => {
      renderer!.unmount()
    })
    renderer = undefined
    expect(instance.bridge.dispose).toHaveBeenCalledTimes(1)
    expect(instance.abort.signal.aborted).toBe(true)
  })
})
