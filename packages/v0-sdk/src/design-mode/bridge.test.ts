import { afterEach, describe, expect, mock, test } from 'bun:test'
import { createDesignModeBridge } from './bridge'
import { dispatchMessage, preview } from './test-preview'
import type {
  DesignModeBridge,
  DesignModeBridgeOptions,
  DesignModeMessage,
  DesignModeState,
} from './types'

const payload = {
  edits: [
    {
      type: 'style' as const,
      element: { selectorPath: '#heading', tagName: 'h1' },
      changes: { fontSize: { from: '32px', to: '48px' } },
    },
  ],
  instructions: { message: 'Only this heading', element: '#heading' },
}
const fixtures: Array<{ bridge: DesignModeBridge; runtime: ReturnType<typeof preview> }> = []

function fixture(options: Partial<DesignModeBridgeOptions> = {}) {
  const runtime = preview()
  const onApply = mock(
    async (_message: DesignModeMessage, _context: { signal: AbortSignal }) => true,
  )
  const onError = mock((_error: Error) => {})
  const bridge = createDesignModeBridge({
    iframe: runtime.iframe,
    targetOrigin: runtime.child.origin,
    enabled: true,
    onApply,
    onError,
    ...options,
  })
  fixtures.push({ bridge, runtime })
  return { runtime, bridge, onApply, onError }
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 10))
}

afterEach(() => {
  for (const { bridge, runtime } of fixtures.splice(0).reverse()) {
    bridge.dispose()
    runtime.cleanup()
  }
})

describe('createDesignModeBridge', () => {
  test('uses a real BIDC runtime peer for connection, state, and Apply acknowledgements', async () => {
    const { runtime, bridge, onApply } = fixture()
    const peer = runtime.connect()
    await bridge.ready
    expect(bridge.getState().connected).toBe(true)
    expect(await peer.call('getDesignModeState')).toBe(true)
    expect(await peer.call('sendDesignModeMessage', payload)).toBe(true)
    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onApply.mock.calls[0]![0]).toEqual({
      message: 'Only this heading',
      designMode: { edits: payload.edits, element: '#heading' },
    })
    expect(onApply.mock.calls[0]![1].signal.aborted).toBe(false)
  })

  test('connects when the runtime starts before the parent helper', async () => {
    const runtime = preview()
    const peer = runtime.connect()
    await settle()
    const bridge = createDesignModeBridge({
      iframe: runtime.iframe,
      targetOrigin: runtime.child.origin,
      onApply: async () => {},
      enabled: true,
    })
    fixtures.push({ bridge, runtime })
    await bridge.ready
    expect(await peer.call('getDesignModeState')).toBe(true)
    expect(await peer.call('sendDesignModeMessage', payload)).toBe(true)
  })

  test('posts enable/disable messages to the exact preview origin', () => {
    const { runtime, bridge } = fixture({ enabled: false })
    bridge.setEnabled(true)
    bridge.setEnabled(false)
    expect(runtime.child.posted.slice(-2)).toEqual([
      {
        data: { __v0_remote__: 1, type: 'v0_design_mode_toggle', enabled: true },
        targetOrigin: 'https://preview.example',
      },
      {
        data: { __v0_remote__: 1, type: 'v0_design_mode_toggle', enabled: false },
        targetOrigin: 'https://preview.example',
      },
    ])
  })

  test.each([true, false, { url: 'https://acme.example/logo.svg', alt: 'Acme Team' }])(
    'sends configured branding on enable and restores it after reload: %j',
    async (logo) => {
      const { runtime, bridge } = fixture({ logo })
      runtime.connect()
      await bridge.ready
      const expected = { __v0_remote__: 1, type: 'v0_design_mode_toggle', enabled: true, logo }
      expect(runtime.child.posted.at(-1)?.data).toEqual(expected)
      runtime.load()
      expect(runtime.child.posted.at(-1)?.data).toEqual(expected)
      runtime.connect()
      await settle()
      expect(runtime.child.posted.at(-1)?.data).toEqual(expected)
      bridge.setEnabled(false)
      expect(runtime.child.posted.at(-1)?.data).toEqual({
        __v0_remote__: 1,
        type: 'v0_design_mode_toggle',
        enabled: false,
      })
      bridge.setEnabled(true)
      expect(runtime.child.posted.at(-1)?.data).toEqual(expected)
      bridge.dispose()
      expect(runtime.child.posted.at(-1)?.data).not.toHaveProperty('logo')
    },
  )

  test.each([
    null,
    'hidden',
    {},
    { url: 'https://acme.example/logo.svg' },
    { url: '/logo.svg', alt: 'Acme' },
    { url: 'data:image/svg+xml,<svg/>', alt: 'Acme' },
    { url: 'javascript:alert(1)', alt: 'Acme' },
    { url: 'https://user:password@acme.example/logo.svg', alt: 'Acme' },
    { url: 'https://acme.example/logo.svg', alt: 123 },
  ])('rejects invalid logo configuration: %j', (logo) => {
    const runtime = preview()
    try {
      expect(() =>
        createDesignModeBridge({
          iframe: runtime.iframe,
          targetOrigin: runtime.child.origin,
          onApply: async () => {},
          logo: logo as DesignModeBridgeOptions['logo'],
        }),
      ).toThrow()
    } finally {
      runtime.cleanup()
    }
  })

  test('ignores forged state notifications from other windows and origins', () => {
    const { runtime, bridge } = fixture({ enabled: false })
    const notification = { __v0_remote__: 1, type: 'v0_design_mode_state', enabled: true }
    dispatchMessage(runtime.parent, notification, {}, runtime.child.origin)
    dispatchMessage(runtime.parent, notification, runtime.child, 'https://attacker.example')
    dispatchMessage(
      runtime.parent,
      { ...notification, __v0_remote__: 0 },
      runtime.child,
      runtime.child.origin,
    )
    expect(bridge.getState().enabled).toBe(false)
    dispatchMessage(runtime.parent, notification, runtime.child, runtime.child.origin)
    expect(bridge.getState().enabled).toBe(true)
  })

  test.each(['wrong source', 'wrong origin', 'wrong channel', 'invalid timestamp'])(
    'rejects an unauthenticated RPC handshake: %s',
    async (kind) => {
      const { runtime, bridge, onApply } = fixture({ timeoutMs: 20 })
      const ports = new MessageChannel()
      const data = { type: 'bidc-connect', channelId: 'bidc_default', timestamp: Date.now() + 1000 }
      let source: unknown = runtime.child
      let origin = runtime.child.origin
      if (kind === 'wrong source') source = {}
      if (kind === 'wrong origin') origin = 'https://attacker.example'
      if (kind === 'wrong channel') data.channelId = 'bidc_other'
      if (kind === 'invalid timestamp') data.timestamp = NaN
      dispatchMessage(runtime.parent, data, source, origin, [ports.port2])
      await settle()
      expect(bridge.getState().connected).toBe(false)
      expect(onApply).not.toHaveBeenCalled()
      await expect(bridge.selectNode('heading')).rejects.toThrow('timed out')
      ports.port1.close()
      ports.port2.close()
    },
  )

  test("forwards layer-control RPCs and resolves the runtime's asynchronous replies", async () => {
    const { runtime, bridge } = fixture()
    runtime.connect(async () => {
      await settle()
    })
    await bridge.ready
    await bridge.selectNode('node-1')
    await bridge.hoverNode('node-2')
    await bridge.clearHoveredNode()
    await bridge.setNodeVisibility('node-1', true)
    expect(runtime.calls).toEqual([
      { method: 'selectDesignModeNode', args: ['node-1'] },
      { method: 'hoverDesignModeNode', args: ['node-2'] },
      { method: 'clearHoveredDesignModeNode', args: [] },
      { method: 'setDesignModeNodeVisibility', args: ['node-1', true] },
    ])
  })

  test('publishes immutable selection and layer-tree state', async () => {
    const { runtime, bridge } = fixture()
    const peer = runtime.connect()
    await bridge.ready
    const changes: DesignModeState[] = []
    const unsubscribe = bridge.subscribe((state) => {
      changes.push(state)
    })
    const selection = { nodeId: 'node-1', selectedNodeIds: ['node-1'] }
    const tree = {
      id: 'root',
      tag: 'main',
      name: 'Main',
      children: [{ id: 'node-1', tag: 'h1', name: 'Hello', children: [], hidden: false }],
    }
    await peer.call('setDesignModeSelection', selection)
    const snapshot = bridge.getState()
    await peer.call('setDesignModeTree', tree)
    expect(snapshot.tree).toBeNull()
    expect(bridge.getState()).toMatchObject({ selection, tree })
    expect(Object.isFrozen(bridge.getState())).toBe(true)
    expect(Object.isFrozen(bridge.getState().tree!.children)).toBe(true)
    expect(changes).toHaveLength(2)
    unsubscribe()
    await peer.call('setDesignModeSelection', null)
    expect(changes).toHaveLength(2)
    expect(bridge.getState().selection).toBeNull()
  })

  test('rejects malformed layer and selection RPCs without poisoning state', async () => {
    const { runtime, bridge, onError } = fixture()
    const peer = runtime.connect()
    await bridge.ready
    expect(await peer.call('setDesignModeTree', { id: 'bad', children: 'not an array' })).toBe(
      false,
    )
    expect(
      await peer.call('setDesignModeSelection', { nodeId: 'node-1', selectedNodeIds: [1] }),
    ).toBe(false)
    expect(bridge.getState()).toMatchObject({ selection: null, tree: null })
    expect(onError).toHaveBeenCalledTimes(2)
  })

  test("accepts the runtime's 300-node tree plus its synthetic root and rejects larger trees", async () => {
    const { runtime, bridge, onError } = fixture()
    const peer = runtime.connect()
    await bridge.ready
    const children = Array.from({ length: 300 }, (_, i) => ({
      id: `node-${i}`,
      tag: 'div',
      name: 'Box',
      children: [],
    }))
    const tree = { id: 'root', tag: 'body', name: 'Page', children }
    await peer.call('setDesignModeTree', tree)
    expect(bridge.getState().tree?.children).toHaveLength(300)
    expect(onError).not.toHaveBeenCalled()
    expect(
      await peer.call('setDesignModeTree', {
        ...tree,
        children: [...children, { id: 'extra', tag: 'div', name: 'Box', children: [] }],
      }),
    ).toBe(false)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('prevents concurrent Apply submissions and exposes applying state', async () => {
    const { runtime, bridge, onApply } = fixture()
    let complete!: (accepted: boolean) => void
    onApply.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    const peer = runtime.connect()
    await bridge.ready
    const first = peer.call('sendDesignModeMessage', payload)
    await settle()
    expect(bridge.getState().applying).toBe(true)
    expect(await peer.call('sendDesignModeMessage', payload)).toBe(false)
    complete(true)
    expect(await first).toBe(true)
    expect(bridge.getState().applying).toBe(false)
    expect(onApply).toHaveBeenCalledTimes(1)
  })

  test('acknowledges rejected and failed backend saves as false', async () => {
    const { runtime, bridge, onApply, onError } = fixture()
    const peer = runtime.connect()
    await bridge.ready
    onApply.mockResolvedValueOnce(false)
    expect(await peer.call('sendDesignModeMessage', payload)).toBe(false)
    onApply.mockRejectedValueOnce(new Error('Backend save failed'))
    expect(await peer.call('sendDesignModeMessage', payload)).toBe(false)
    expect(onError.mock.calls[0]![0].message).toBe('Backend save failed')
    expect(bridge.getState().applying).toBe(false)
  })

  test('rejects Apply when disabled or when the payload is invalid', async () => {
    const { runtime, bridge, onApply, onError } = fixture({ enabled: false })
    const peer = runtime.connect()
    await bridge.ready
    expect(await peer.call('sendDesignModeMessage', payload)).toBe(false)
    bridge.setEnabled(true)
    expect(await peer.call('sendDesignModeMessage', { edits: [] })).toBe(false)
    expect(onApply).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('normalizes runtime screenshots before calling the backend', async () => {
    const { runtime, bridge, onApply } = fixture()
    const peer = runtime.connect()
    await bridge.ready
    await peer.call('sendDesignModeMessage', {
      ...payload,
      instructions: {
        message: 'Use the screenshot',
        screenshot: { base64: 'aGVsbG8=', anchorElement: '#heading' },
      },
    })
    expect(onApply.mock.calls[0]![0].designMode.screenshot).toEqual({
      url: 'data:image/jpeg;base64,aGVsbG8=',
      anchorElement: '#heading',
    })
  })

  test('reconnects after iframe navigation without reapplying previous edits', async () => {
    const { runtime, bridge, onApply } = fixture()
    const first = runtime.connect()
    await bridge.ready
    await first.call('setDesignModeSelection', { nodeId: 'old', selectedNodeIds: ['old'] })
    await settle()
    const second = runtime.connect()
    await second.call('getDesignModeState')
    runtime.load()
    await settle()
    expect(bridge.getState()).toMatchObject({ connected: true, enabled: true, selection: null })
    expect(await second.call('getDesignModeState')).toBe(true)
    expect(onApply).not.toHaveBeenCalled()
    await second.call('sendDesignModeMessage', payload)
    expect(onApply).toHaveBeenCalledTimes(1)
  })

  test('times out unanswered control RPCs', async () => {
    const { runtime, bridge } = fixture({ timeoutMs: 30 })
    runtime.connect(() => new Promise(() => {}))
    await bridge.ready
    await expect(bridge.selectNode('node-1')).rejects.toThrow('timed out')
  })

  test('cancels pending control RPCs when the runtime reconnects', async () => {
    const { runtime, bridge } = fixture()
    runtime.connect(() => new Promise(() => {}))
    await bridge.ready
    const result = bridge.selectNode('old')
    void result.catch(() => {})
    await settle()
    runtime.connect()
    await expect(result).rejects.toThrow('reconnected')
  })

  test('dispose disables the runtime, cancels work, and is idempotent', async () => {
    const { runtime, bridge, onApply } = fixture()
    onApply.mockImplementation(
      (_message, { signal }) =>
        new Promise((resolve) => {
          signal.addEventListener(
            'abort',
            () => {
              resolve(false)
            },
            { once: true },
          )
        }),
    )
    const peer = runtime.connect(() => new Promise(() => {}))
    await bridge.ready
    void peer.call('sendDesignModeMessage', payload)
    await settle()
    const pending = bridge.selectNode('node-1')
    void pending.catch(() => {})
    bridge.dispose()
    bridge.dispose()
    await expect(pending).rejects.toThrow('disposed')
    expect(onApply.mock.calls[0]![1].signal.aborted).toBe(true)
    expect(bridge.getState()).toMatchObject({ connected: false, enabled: false, applying: false })
    expect(() => bridge.setEnabled(true)).toThrow('disposed')
    expect(() => bridge.subscribe(() => {})).toThrow('disposed')
  })

  test('ready rejects on disposal if the preview never connects', async () => {
    const { bridge } = fixture()
    bridge.dispose()
    await expect(bridge.ready).rejects.toThrow('disposed')
  })

  test('enforces a single bridge per iframe and allows replacement after disposal', () => {
    const { runtime, bridge } = fixture()
    const options = {
      iframe: runtime.iframe,
      targetOrigin: runtime.child.origin,
      onApply: async () => {},
    }
    expect(() => createDesignModeBridge(options)).toThrow('already has')
    bridge.dispose()
    const replacement = createDesignModeBridge(options)
    replacement.dispose()
  })

  test('cleans up a failed connection attempt so the same iframe can be retried', async () => {
    const runtime = preview()
    const postMessage = runtime.child.postMessage.bind(runtime.child)
    runtime.child.postMessage = () => {
      throw new Error('Unable to transfer a port')
    }
    const options = {
      iframe: runtime.iframe,
      targetOrigin: runtime.child.origin,
      onApply: async () => {},
    }
    try {
      expect(() => createDesignModeBridge(options)).toThrow('Unable to transfer a port')
      runtime.child.postMessage = postMessage
      const bridge = createDesignModeBridge(options)
      fixtures.push({ bridge, runtime })
      runtime.connect()
      await bridge.ready
      expect(bridge.getState().connected).toBe(true)
    } catch (error) {
      runtime.cleanup()
      throw error
    }
  })

  test.each([
    '*',
    'null',
    'https://preview.example/path',
    'https://preview.example/',
    'file:///preview',
  ])('rejects unsafe or ambiguous target origins: %s', (targetOrigin) => {
    const runtime = preview()
    try {
      expect(() =>
        createDesignModeBridge({ iframe: runtime.iframe, targetOrigin, onApply: async () => {} }),
      ).toThrow()
    } finally {
      runtime.cleanup()
    }
  })
})
