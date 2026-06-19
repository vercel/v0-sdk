import type {
  Chat,
  ChatsCreateStreamResponses,
  Message,
  MessagesSendStreamResponses,
} from '../generated/types.gen'
import { patch } from './diffpatch'

type CreateStreamEvent = ChatsCreateStreamResponses[200]
type SendStreamEvent = MessagesSendStreamResponses[200]
export type V0StreamEvent = CreateStreamEvent | SendStreamEvent

export type V0StreamParts = Message['parts']

export interface V0StreamUpdate {
  status: 'streaming'
  event: V0StreamEvent
  chat?: Chat
  message?: Message
  title?: string
  parts: V0StreamParts
  usage?: Message['usage']
}

export interface V0StreamFinal extends Omit<V0StreamUpdate, 'status'> {
  status: 'done'
}

/**
 * The result of a streaming v0 request. It exposes accumulated stream
 * snapshots, the completed snapshot, and a Response helper for forwarding the
 * stream.
 */
export interface V0StreamResult {
  stream: AsyncIterable<V0StreamUpdate>
  readonly final: Promise<V0StreamFinal>
  toResponse(init?: ResponseInit): Response
}

type WireStreamEvent =
  | { event: 'update'; data: V0StreamUpdate }
  | { event: 'done'; data: V0StreamFinal }
  | { event: 'error'; data: { message?: unknown; code?: unknown; id?: unknown } }

interface Subscriber {
  queue: V0StreamUpdate[]
  notify: (() => void) | undefined
}

/** Error thrown when a v0 stream emits an error event or terminates abnormally. */
export class V0StreamError extends Error {
  readonly code: string | undefined
  readonly id: string | undefined

  constructor(message: string, options: { code?: string; id?: string } = {}) {
    super(message)
    this.name = 'V0StreamError'
    this.code = options.code
    this.id = options.id
  }
}

/** @internal */
export function createV0StreamResult(events: AsyncIterable<V0StreamEvent>): V0StreamResult {
  return new SharedV0StreamResult(async (emit, finish) => {
    let state: V0StreamUpdate | undefined

    for await (const event of events) {
      state = applyStreamEvent(state, event)
      emit(state)
    }

    if (!state) {
      throw new V0StreamError('v0 stream ended before sending an event')
    }

    finish(toFinal(state))
  })
}

/**
 * Reconstructs a {@link V0StreamResult} from an SSE {@link Response} produced
 * by {@link V0StreamResult.toResponse}.
 */
export function readV0Stream(response: Response | Promise<Response>): V0StreamResult {
  return new SharedV0StreamResult(async (emit, finish) => {
    let latest: V0StreamUpdate | undefined

    for await (const event of parseV0StreamResponse(await response)) {
      if (event.event === 'update') {
        latest = event.data
        emit(event.data)
        continue
      }

      if (event.event === 'done') {
        finish(event.data)
        return
      }

      throw new V0StreamError(
        typeof event.data.message === 'string' ? event.data.message : 'v0 stream failed',
        {
          code: typeof event.data.code === 'string' ? event.data.code : undefined,
          id: typeof event.data.id === 'string' ? event.data.id : undefined,
        },
      )
    }

    if (!latest) {
      throw new V0StreamError('v0 stream ended before sending an event')
    }

    finish(toFinal(latest))
  })
}

class SharedV0StreamResult implements V0StreamResult {
  readonly stream: AsyncIterable<V0StreamUpdate>

  private readonly history: V0StreamUpdate[] = []
  private readonly subscribers = new Set<Subscriber>()
  private readonly finalPromise: Promise<V0StreamFinal>
  private started = false
  private finished = false
  private failure: unknown
  private resolveFinal!: (final: V0StreamFinal) => void
  private rejectFinal!: (error: unknown) => void

  constructor(
    private readonly run: (
      emit: (update: V0StreamUpdate) => void,
      finish: (final: V0StreamFinal) => void,
    ) => Promise<void>,
  ) {
    this.finalPromise = new Promise<V0StreamFinal>((resolve, reject) => {
      this.resolveFinal = resolve
      this.rejectFinal = reject
    })
    this.finalPromise.catch(() => {})
    this.stream = {
      [Symbol.asyncIterator]: () => this.subscribe(),
    }
  }

  get final(): Promise<V0StreamFinal> {
    this.start()
    return this.finalPromise
  }

  toResponse(init: ResponseInit = {}): Response {
    const encoder = new TextEncoder()
    const result = this

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const update of result.stream) {
            controller.enqueue(encoder.encode(formatSse('update', update)))
          }

          controller.enqueue(encoder.encode(formatSse('done', await result.final)))
        } catch (error) {
          controller.enqueue(encoder.encode(formatSse('error', serializeError(error))))
        } finally {
          controller.close()
        }
      },
    })

    const headers = new Headers(init.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'text/event-stream; charset=utf-8')
    }
    if (!headers.has('Cache-Control')) {
      headers.set('Cache-Control', 'no-cache, no-transform')
    }
    if (!headers.has('Connection')) {
      headers.set('Connection', 'keep-alive')
    }
    if (!headers.has('X-Accel-Buffering')) {
      headers.set('X-Accel-Buffering', 'no')
    }

    return new Response(stream, {
      ...init,
      headers,
    })
  }

  private async *subscribe(): AsyncIterator<V0StreamUpdate> {
    const subscriber: Subscriber = {
      queue: [...this.history],
      notify: undefined,
    }

    this.subscribers.add(subscriber)
    this.start()

    try {
      while (true) {
        if (subscriber.queue.length > 0) {
          yield subscriber.queue.shift()!
          continue
        }

        if (this.failure) {
          throw this.failure
        }

        if (this.finished) {
          return
        }

        await new Promise<void>((resolve) => {
          subscriber.notify = resolve
        })
        subscriber.notify = undefined
      }
    } finally {
      this.subscribers.delete(subscriber)
    }
  }

  private start() {
    if (this.started) {
      return
    }

    this.started = true
    this.run(
      (event) => this.publish(event),
      (event) => this.finish(event),
    ).catch((error) => this.fail(error))
  }

  private publish(update: V0StreamUpdate) {
    this.history.push(update)

    for (const subscriber of this.subscribers) {
      subscriber.queue.push(update)
      subscriber.notify?.()
    }
  }

  private finish(final: V0StreamFinal) {
    if (this.finished) {
      return
    }

    this.finished = true
    this.resolveFinal(final)
    this.notifySubscribers()
  }

  private fail(error: unknown) {
    if (this.finished) {
      return
    }

    this.finished = true
    this.failure = error
    this.rejectFinal(error)
    this.notifySubscribers()
  }

  private notifySubscribers() {
    for (const subscriber of this.subscribers) {
      subscriber.notify?.()
    }
  }
}

function applyStreamEvent(state: V0StreamUpdate | undefined, event: V0StreamEvent): V0StreamUpdate {
  const next = state ?? createInitialUpdate(event)

  switch (event.object) {
    case 'chat': {
      return {
        ...next,
        event,
        chat: stripObject(event) as Chat,
      }
    }
    case 'chat.title': {
      return applyTitle(
        {
          ...next,
          event,
        },
        event.delta,
      )
    }
    case 'message': {
      const message = stripObject(event) as Message
      return {
        ...next,
        event,
        message,
        parts: message.parts,
        usage: message.usage,
      }
    }
    case 'message.parts.chunk': {
      return applyPartsDelta(
        {
          ...next,
          event,
        },
        event.delta,
      )
    }
    case 'message.usage': {
      return applyUsage(
        {
          ...next,
          event,
        },
        event.usage,
      )
    }
    case 'error': {
      throw new V0StreamError(event.message, {
        code: event.code,
        id: event.id,
      })
    }
    default: {
      const raw = event as { message?: unknown; code?: unknown; id?: unknown }
      throw new V0StreamError(typeof raw.message === 'string' ? raw.message : 'v0 stream failed', {
        code: typeof raw.code === 'string' ? raw.code : undefined,
        id: typeof raw.id === 'string' ? raw.id : undefined,
      })
    }
  }
}

function createInitialUpdate(event: V0StreamEvent): V0StreamUpdate {
  return {
    status: 'streaming',
    event,
    parts: [],
  }
}

function applyTitle(update: V0StreamUpdate, title: string): V0StreamUpdate {
  return {
    ...update,
    title,
    chat: update.chat
      ? {
          ...update.chat,
          title,
        }
      : update.chat,
  }
}

function applyPartsDelta(update: V0StreamUpdate, delta: unknown): V0StreamUpdate {
  const parts = patch<V0StreamParts>(update.parts, delta)

  return {
    ...update,
    parts,
    message: update.message
      ? {
          ...update.message,
          parts,
        }
      : update.message,
  }
}

function applyUsage(update: V0StreamUpdate, usage: Message['usage']): V0StreamUpdate {
  return {
    ...update,
    usage,
    message: update.message
      ? {
          ...update.message,
          usage,
        }
      : update.message,
  }
}

function toFinal(update: V0StreamUpdate): V0StreamFinal {
  return {
    ...update,
    status: 'done',
  }
}

function stripObject<T extends { object: string }>(value: T): Omit<T, 'object'> {
  const { object: _object, ...rest } = value
  return rest
}

function formatSse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function serializeError(error: unknown): { message: string; code?: string; id?: string } {
  if (error instanceof V0StreamError) {
    return {
      message: error.message,
      code: error.code,
      id: error.id,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: 'v0 stream failed',
  }
}

async function* parseV0StreamResponse(response: Response): AsyncGenerator<WireStreamEvent> {
  if (!response.ok) {
    throw new V0StreamError(`v0 stream request failed: ${response.status} ${response.statusText}`)
  }

  if (!response.body) {
    throw new V0StreamError('v0 stream response did not include a body')
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += value
      buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() ?? ''

      for (const chunk of chunks) {
        const event = parseWireEvent(chunk)
        if (event) {
          yield event
        }
      }
    }

    const remaining = buffer.trim()
    if (remaining) {
      const event = parseWireEvent(remaining)
      if (event) {
        yield event
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function parseWireEvent(rawEvent: string): WireStreamEvent | null {
  let eventName = 'message'
  const dataLines: string[] = []

  for (const line of rawEvent.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.replace(/^event:\s*/, '')
      continue
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.replace(/^data:\s*/, ''))
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  const data = JSON.parse(dataLines.join('\n')) as unknown

  if ((eventName === 'update' || eventName === 'message') && isJsonObject(data)) {
    return {
      event: 'update',
      data: data as unknown as V0StreamUpdate,
    }
  }

  if (eventName === 'done' && isJsonObject(data)) {
    return {
      event: 'done',
      data: data as unknown as V0StreamFinal,
    }
  }

  if (eventName === 'error' && isJsonObject(data)) {
    return {
      event: 'error',
      data,
    }
  }

  return null
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
