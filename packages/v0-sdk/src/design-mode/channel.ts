import { decode, encode, type SerializableValue } from 'bidc'

const CHANNEL_ID = 'bidc_default'
const MAX_MESSAGE_LENGTH = 16 * 1024 * 1024
const MAX_INCOMING_MESSAGES = 128

type Pending = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
  done: Promise<void>
}

function chunkQueue() {
  const chunks: string[] = []
  let wake: (() => void) | undefined
  let closed = false
  let length = 0
  return {
    push(chunk: string) {
      length += chunk.length
      if (length > MAX_MESSAGE_LENGTH) throw new Error('Preview RPC message exceeds the size limit')
      chunks.push(chunk)
      wake?.()
    },
    close() {
      closed = true
      wake?.()
    },
    async *[Symbol.asyncIterator]() {
      while (!closed || chunks.length) {
        if (chunks.length) {
          yield chunks.shift()!
        } else {
          await new Promise<void>((resolve) => {
            wake = resolve
          })
        }
      }
    },
  }
}

type ChannelOptions = {
  iframe: HTMLIFrameElement
  targetOrigin: string
  timeoutMs: number
  onConnect: () => void
  onRequest: (value: unknown) => Promise<SerializableValue>
  onError: (error: Error) => void
}

/** BIDC wire compatibility with an origin/source-checked window handshake. */
export function createRuntimeChannel(options: ChannelOptions) {
  const parentWindow = options.iframe.ownerDocument.defaultView
  const target = options.iframe.contentWindow
  if (!parentWindow || !target)
    throw new Error('The preview iframe must belong to a browser document')

  const outgoing = new MessageChannel()
  // Runtime BIDC uses integer timestamps. A fractional tie-breaker prevents
  // both peers from choosing opposite ports when initialized in the same ms.
  const timestamp = Date.now() + 0.5
  const pending = new Map<string, Pending>()
  const incoming = new Map<string, ReturnType<typeof chunkQueue>>()
  let port: MessagePort | undefined
  let disposed = false
  let sequence = 0
  let resolveReady!: () => void
  let rejectReady!: (error: Error) => void
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })
  // Consumers may use state notifications without ever awaiting ready.
  void ready.catch(() => {})

  function rejectPending(error: Error) {
    for (const request of pending.values()) {
      clearTimeout(request.timer)
      request.reject(error)
    }
    pending.clear()
    for (const queue of incoming.values()) queue.close()
    incoming.clear()
  }

  async function post(destination: MessagePort, id: string, value: SerializableValue) {
    for await (const chunk of encode(value)) {
      if (disposed || destination !== port) return
      destination.postMessage(`${id}@${chunk}`)
    }
  }

  async function receive(id: string, queue: ReturnType<typeof chunkQueue>, source: MessagePort) {
    try {
      const value: unknown = await decode(queue)
      if (disposed || source !== port) return
      if (
        value &&
        typeof value === 'object' &&
        '$$type' in value &&
        typeof value.$$type === 'string' &&
        value.$$type.startsWith('bidc-res:')
      ) {
        const requestId = value.$$type.slice(9)
        const request = pending.get(requestId)
        if (request && 'response' in value) {
          try {
            const response: unknown = await Promise.race([
              value.response,
              request.done.then(() => {
                throw new Error('Preview RPC was cancelled')
              }),
            ])
            if (!disposed && source === port && pending.delete(requestId)) {
              clearTimeout(request.timer)
              request.resolve(response)
            }
          } catch (error) {
            if (pending.delete(requestId)) {
              clearTimeout(request.timer)
              request.reject(asError(error))
            }
          }
        }
      } else {
        const response = await options.onRequest(value)
        await post(source, `reply-${++sequence}`, { $$type: `bidc-res:${id}`, response })
      }
    } catch (error) {
      if (!disposed && source === port) options.onError(asError(error))
    } finally {
      queue.close()
      if (incoming.get(id) === queue) incoming.delete(id)
    }
  }

  function onPortMessage(event: MessageEvent) {
    if (disposed || typeof event.data !== 'string' || !port) return
    if (event.data.length > MAX_MESSAGE_LENGTH + 128) {
      options.onError(new Error('Preview RPC message exceeds the size limit'))
      return
    }
    const index = event.data.indexOf('@')
    if (index < 1 || index > 128) return
    const id = event.data.slice(0, index)
    const chunk = event.data.slice(index + 1)
    try {
      if (chunk.startsWith('r:')) {
        if (incoming.has(id)) return
        if (incoming.size >= MAX_INCOMING_MESSAGES) throw new Error('Too many preview RPC messages')
        const queue = chunkQueue()
        queue.push(chunk)
        incoming.set(id, queue)
        void receive(id, queue, port)
      } else {
        incoming.get(id)?.push(chunk)
      }
    } catch (error) {
      incoming.get(id)?.close()
      incoming.delete(id)
      options.onError(asError(error))
    }
  }

  function adopt(next: MessagePort) {
    if (disposed) {
      next.close()
      return
    }
    if (port === next) return
    if (port) {
      port.removeEventListener('message', onPortMessage)
      port.close()
      rejectPending(new Error('The preview runtime reconnected; pending RPC calls were cancelled'))
    }
    port = next
    next.addEventListener('message', onPortMessage)
    next.start()
    resolveReady()
    options.onConnect()
  }

  function onWindowMessage(event: MessageEvent) {
    if (disposed || event.source !== target || event.origin !== options.targetOrigin) return
    const data: unknown = event.data
    if (
      !data ||
      typeof data !== 'object' ||
      !('type' in data) ||
      data.type !== 'bidc-connect' ||
      !('channelId' in data) ||
      data.channelId !== CHANNEL_ID ||
      !('timestamp' in data) ||
      typeof data.timestamp !== 'number' ||
      !Number.isFinite(data.timestamp)
    )
      return
    const transferred = event.ports[0]
    if (!transferred) return
    if (timestamp > data.timestamp) {
      transferred.close()
      return
    }
    transferred.postMessage({ type: 'bidc-confirm', channelId: CHANNEL_ID })
    adopt(transferred)
  }

  function onConfirm(event: MessageEvent) {
    const data: unknown = event.data
    if (
      data &&
      typeof data === 'object' &&
      'type' in data &&
      data.type === 'bidc-confirm' &&
      'channelId' in data &&
      data.channelId === CHANNEL_ID
    ) {
      outgoing.port1.removeEventListener('message', onConfirm)
      if (!port) adopt(outgoing.port1)
    }
  }

  parentWindow.addEventListener('message', onWindowMessage)
  outgoing.port1.addEventListener('message', onConfirm)
  outgoing.port1.start()
  try {
    target.postMessage(
      { type: 'bidc-connect', channelId: CHANNEL_ID, timestamp },
      options.targetOrigin,
      [outgoing.port2],
    )
  } catch (error) {
    disposed = true
    parentWindow.removeEventListener('message', onWindowMessage)
    outgoing.port1.removeEventListener('message', onConfirm)
    outgoing.port1.close()
    outgoing.port2.close()
    rejectReady(asError(error))
    throw error
  }

  return {
    ready,
    request(method: string, args: SerializableValue[]): Promise<unknown> {
      if (disposed) return Promise.reject(new Error('Design Mode bridge has been disposed'))
      const id = `request-${++sequence}`
      return new Promise((resolve, reject) => {
        let finish!: () => void
        const done = new Promise<void>((resolve) => {
          finish = resolve
        })
        const timer = setTimeout(() => {
          pending.delete(id)
          fail(new Error(`Preview RPC timed out: ${method}`))
        }, options.timeoutMs)
        function fail(error: Error) {
          clearTimeout(timer)
          finish()
          reject(error)
        }
        pending.set(id, {
          resolve(value) {
            finish()
            resolve(value)
          },
          reject: fail,
          timer,
          done,
        })
        void ready
          .then(async () => {
            if (!port || !pending.has(id)) return
            await post(port, id, { method, args })
          })
          .catch((error: unknown) => {
            if (pending.delete(id)) {
              fail(asError(error))
            }
          })
      })
    },
    dispose() {
      if (disposed) return
      disposed = true
      parentWindow.removeEventListener('message', onWindowMessage)
      outgoing.port1.removeEventListener('message', onConfirm)
      port?.removeEventListener('message', onPortMessage)
      port?.close()
      outgoing.port1.close()
      const error = new Error('Design Mode bridge has been disposed')
      rejectPending(error)
      rejectReady(error)
    },
  }
}

export function asError(value: unknown): Error {
  if (value instanceof Error) return value
  return new Error(String(value))
}
