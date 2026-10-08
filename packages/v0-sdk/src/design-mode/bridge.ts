import { asError, createRuntimeChannel } from './channel'
import { record, string, toDesignModeMessage } from './payload'
import type {
  DesignModeBridge,
  DesignModeBridgeOptions,
  DesignModeLayer,
  DesignModeSelection,
  DesignModeState,
} from './types'

const activeBridges = new WeakMap<HTMLIFrameElement, DesignModeBridge>()

function selection(value: unknown): DesignModeSelection | null {
  if (value === null) return null
  const input = record(value, 'selection')
  let nodeId = null
  if (input['nodeId'] !== null) nodeId = string(input['nodeId'], 'selection.nodeId')
  const ids = input['selectedNodeIds']
  if (!Array.isArray(ids) || ids.length > 300) throw new TypeError('Invalid selected node IDs')
  const result = { nodeId, selectedNodeIds: ids.map((id) => string(id, 'selectedNodeIds[]')) }
  Object.freeze(result.selectedNodeIds)
  return Object.freeze(result)
}

function tree(value: unknown): DesignModeLayer | null {
  if (value === null) return null
  let count = 0
  function visit(value: unknown): DesignModeLayer {
    // The runtime emits up to 300 DOM nodes plus a synthetic Page root.
    if (++count > 301) throw new TypeError('The Design Mode tree exceeds 301 nodes')
    const input = record(value, 'layer')
    const children = input['children']
    if (!Array.isArray(children)) throw new TypeError('Layer children must be an array')
    const result: { -readonly [K in keyof DesignModeLayer]: DesignModeLayer[K] } = {
      id: string(input['id'], 'layer.id'),
      tag: string(input['tag'], 'layer.tag', true),
      name: string(input['name'], 'layer.name', true),
      children: children.map(visit),
    }
    if (input['layout'] !== undefined) {
      if (input['layout'] !== 'flex' && input['layout'] !== 'grid')
        throw new TypeError('Invalid layer layout')
      result.layout = input['layout']
    }
    if (input['role'] !== undefined) result.role = string(input['role'], 'layer.role', true)
    if (input['hidden'] !== undefined) {
      if (typeof input['hidden'] !== 'boolean') throw new TypeError('Invalid layer visibility')
      result.hidden = input['hidden']
    }
    Object.freeze(result.children)
    return Object.freeze(result)
  }
  return visit(value)
}

/**
 * Connect a customer-owned parent page to the Design Mode runtime already
 * injected into a v0 preview. No API key, API calls, or React dependency.
 * Install once per iframe; dispose before unmounting or changing its origin.
 */
export function createDesignModeBridge(options: DesignModeBridgeOptions): DesignModeBridge {
  const { iframe } = options
  if (activeBridges.has(iframe)) throw new Error('This iframe already has a Design Mode bridge')
  const origin = new URL(options.targetOrigin)
  if (
    (origin.protocol !== 'https:' && origin.protocol !== 'http:') ||
    origin.origin !== options.targetOrigin
  ) {
    throw new TypeError('targetOrigin must be an exact HTTP(S) origin, not a wildcard or URL path')
  }
  const parentWindow = iframe.ownerDocument.defaultView
  const target = iframe.contentWindow
  if (!parentWindow || !target)
    throw new Error('The preview iframe must belong to a browser document')
  if (typeof options.onApply !== 'function') throw new TypeError('onApply is required')
  const timeoutMs = options.timeoutMs ?? 30_000
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
    throw new TypeError('timeoutMs must be positive')

  let enabled = options.enabled ?? false
  let disposed = false
  let state: DesignModeState = Object.freeze({
    connected: false,
    enabled,
    applying: false,
    selection: null,
    tree: null,
  })
  const listeners = new Set<(state: DesignModeState) => void>()
  const controller = new AbortController()

  function reportError(error: unknown) {
    if (!disposed) options.onError?.(asError(error))
  }

  function update(patch: Partial<DesignModeState>) {
    if (
      Object.entries(patch).every(([key, value]) => state[key as keyof DesignModeState] === value)
    )
      return
    state = Object.freeze({ ...state, ...patch })
    for (const listener of listeners) {
      try {
        listener(state)
      } catch (error) {
        reportError(error)
      }
    }
  }

  function toggle() {
    target!.postMessage(
      { __v0_remote__: 1, type: 'v0_design_mode_toggle', enabled },
      options.targetOrigin,
    )
  }

  function assertActive() {
    if (disposed) throw new Error('Design Mode bridge has been disposed')
  }

  async function onRequest(value: unknown) {
    if (disposed) return false
    const request = record(value, 'runtime request')
    if (request['method'] === 'getDesignModeState') return enabled
    if (
      request['method'] !== 'sendDesignModeMessage' &&
      request['method'] !== 'setDesignModeSelection' &&
      request['method'] !== 'setDesignModeTree'
    )
      return undefined
    const args = request['args']
    if (!Array.isArray(args) || args.length !== 1)
      throw new TypeError('Invalid runtime RPC arguments')
    if (request['method'] === 'setDesignModeSelection') {
      update({ selection: selection(args[0]) })
      return undefined
    }
    if (request['method'] === 'setDesignModeTree') {
      update({ tree: tree(args[0]) })
      return undefined
    }
    if (!enabled || state.applying) return false
    try {
      const message = toDesignModeMessage(args[0])
      update({ applying: true })
      const accepted = await options.onApply(message, { signal: controller.signal })
      return !disposed && accepted !== false
    } catch (error) {
      reportError(error)
      return false
    } finally {
      if (!disposed) update({ applying: false })
    }
  }

  function onWindowMessage(event: MessageEvent) {
    if (disposed || event.source !== target || event.origin !== options.targetOrigin) return
    const data: unknown = event.data
    if (
      data &&
      typeof data === 'object' &&
      '__v0_remote__' in data &&
      data.__v0_remote__ === 1 &&
      'type' in data &&
      data.type === 'v0_design_mode_state' &&
      'enabled' in data &&
      typeof data.enabled === 'boolean'
    ) {
      enabled = data.enabled
      update({ enabled })
    }
  }

  parentWindow.addEventListener('message', onWindowMessage)
  // An iframe load can happen after its async runtime has already connected.
  // Re-send the desired state without discarding that new connection/tree.
  iframe.addEventListener('load', toggle)
  let channel: ReturnType<typeof createRuntimeChannel>
  try {
    channel = createRuntimeChannel({
      iframe,
      targetOrigin: options.targetOrigin,
      timeoutMs,
      onConnect() {
        update({ connected: true, selection: null, tree: null })
        toggle()
      },
      async onRequest(value) {
        try {
          return await onRequest(value)
        } catch (error) {
          reportError(error)
          return false
        }
      },
      onError: reportError,
    })
  } catch (error) {
    parentWindow.removeEventListener('message', onWindowMessage)
    iframe.removeEventListener('load', toggle)
    throw error
  }

  const bridge: DesignModeBridge = {
    ready: channel.ready,
    setEnabled(value) {
      assertActive()
      if (typeof value !== 'boolean') throw new TypeError('enabled must be a boolean')
      enabled = value
      update({ enabled })
      toggle()
    },
    getState: () => state,
    subscribe(listener) {
      assertActive()
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    async selectNode(id) {
      await channel.request('selectDesignModeNode', [string(id, 'node ID')])
    },
    async hoverNode(id) {
      await channel.request('hoverDesignModeNode', [string(id, 'node ID')])
    },
    async clearHoveredNode() {
      await channel.request('clearHoveredDesignModeNode', [])
    },
    async setNodeVisibility(id, hidden) {
      if (typeof hidden !== 'boolean') throw new TypeError('hidden must be a boolean')
      await channel.request('setDesignModeNodeVisibility', [string(id, 'node ID'), hidden])
    },
    dispose() {
      if (disposed) return
      enabled = false
      toggle()
      disposed = true
      controller.abort()
      channel.dispose()
      parentWindow.removeEventListener('message', onWindowMessage)
      iframe.removeEventListener('load', toggle)
      update({ connected: false, enabled: false, applying: false, selection: null, tree: null })
      listeners.clear()
      activeBridges.delete(iframe)
    },
  }
  activeBridges.set(iframe, bridge)
  return bridge
}
