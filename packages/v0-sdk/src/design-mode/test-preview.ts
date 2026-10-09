import { createChannel, type SerializableValue } from 'bidc'

export type RuntimeRequest = { method: string; args: SerializableValue[] }

export function dispatchMessage(
  window: EventTarget,
  data: unknown,
  source: unknown,
  origin: string,
  ports: MessagePort[] = [],
) {
  const event = new Event('message')
  Object.assign(event, { data, source, origin, ports })
  window.dispatchEvent(event)
}

class PreviewWindow extends EventTarget {
  readonly self = this
  parent!: PreviewWindow
  peer!: PreviewWindow
  readonly posted: Array<{ data: unknown; targetOrigin: string }> = []
  constructor(readonly origin: string) {
    super()
  }
  postMessage(data: unknown, targetOrigin: string, transfer: Transferable[] = []) {
    this.posted.push({ data, targetOrigin })
    if (targetOrigin !== '*' && targetOrigin !== this.origin) return
    queueMicrotask(() =>
      dispatchMessage(this, data, this.peer, this.peer.origin, transfer as MessagePort[]),
    )
  }
}

/** Test-only browser windows using real MessagePorts and the runtime's BIDC version. */
export function preview() {
  const parent = new PreviewWindow('https://customer.example')
  const child = new PreviewWindow('https://preview.example')
  parent.peer = child
  child.peer = parent
  child.parent = parent
  const frame = new EventTarget()
  Object.assign(frame, { ownerDocument: { defaultView: parent }, contentWindow: child })
  const iframe = frame as HTMLIFrameElement
  const calls: RuntimeRequest[] = []
  const peers: ReturnType<typeof createChannel>[] = []
  const ports: MessagePort[] = []
  const NativeChannel = globalThis.MessageChannel
  globalThis.MessageChannel = class extends NativeChannel {
    constructor() {
      super()
      ports.push(this.port1, this.port2)
    }
  }

  function connect(handler: (request: RuntimeRequest) => SerializableValue = () => undefined) {
    const descriptors = ['window', 'self'].map(
      (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const,
    )
    Object.defineProperty(globalThis, 'window', { configurable: true, value: child })
    // A fresh cache key models a fresh runtime module after iframe navigation.
    Object.defineProperty(globalThis, 'self', { configurable: true, value: {} })
    let peer: ReturnType<typeof createChannel>
    try {
      peer = createChannel()
      void peer.receive(async (request: RuntimeRequest) => {
        calls.push(request)
        return handler(request)
      })
    } finally {
      for (const [key, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      }
    }
    peers.push(peer)
    return {
      async call(method: string, ...args: SerializableValue[]) {
        return peer.send<(request: RuntimeRequest) => SerializableValue>({ method, args })
      },
    }
  }

  return {
    iframe,
    parent,
    child,
    calls,
    connect,
    load() {
      frame.dispatchEvent(new Event('load'))
    },
    cleanup() {
      for (const peer of peers) peer.cleanup()
      for (const port of ports) port.close()
      globalThis.MessageChannel = NativeChannel
    },
  }
}
