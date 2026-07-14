import { createUIMessageStreamResponse } from 'ai'
import type { Chat } from '../generated/types.gen'
import type { V0StreamEvent, V0StreamFinal, V0StreamResult, V0StreamUpdate } from '../stream/result'
import { serializeDates } from './ui-message'
import type { Serialized, V0MessageMetadata, V0UIMessageChunk } from './ui-message'

/**
 * Converts a {@link V0StreamResult} (from `v0.chats.createStream`,
 * `v0.chats.resume`, `v0.messages.sendStream`, or `v0.messages.resolveStream`)
 * into an AI SDK UI message stream of {@link V0UIMessageChunk}s.
 *
 * Prefer {@link toUIMessageStreamResponse} in route handlers; use this when
 * you need the raw chunk stream, for example to merge it into a stream created
 * with `createUIMessageStream` or to read it with `readUIMessageStream`.
 */
export function toUIMessageStream(result: V0StreamResult): ReadableStream<V0UIMessageChunk> {
  let cancelled = false

  return new ReadableStream<V0UIMessageChunk>({
    async start(controller) {
      const adapter = new UIMessageStreamAdapter((chunk) => {
        if (!cancelled) {
          controller.enqueue(chunk)
        }
      })

      try {
        for await (const update of result.stream) {
          if (cancelled) {
            return
          }
          adapter.handleUpdate(update)
        }

        adapter.finish(await result.final)
      } catch (error) {
        adapter.fail(error)
      } finally {
        if (!cancelled) {
          controller.close()
        }
      }
    },
    cancel() {
      cancelled = true
    },
  })
}

/**
 * Converts a {@link V0StreamResult} into an AI SDK UI message stream
 * `Response` (Server-Sent Events), ready to be returned from a route handler
 * and consumed by `useChat`:
 *
 * ```ts
 * export async function POST(request: Request) {
 *   const { chatId, message, attachments } = await request.json()
 *
 *   return toUIMessageStreamResponse(
 *     chatId
 *       ? await v0.messages.sendStream({ chatId, message, attachments })
 *       : await v0.chats.createStream({ message, attachments }),
 *   )
 * }
 * ```
 */
export function toUIMessageStreamResponse(
  result: V0StreamResult,
  init?: Omit<Parameters<typeof createUIMessageStreamResponse>[0], 'stream'>,
): Response {
  return createUIMessageStreamResponse({
    ...init,
    stream: toUIMessageStream(result),
  })
}

/**
 * Converts a `v0.chats.resume` result into a `Response` for the reconnect
 * (`GET`) route handler used by `useChat`'s `resume`. When there is a
 * generation to attach to it responds like {@link toUIMessageStreamResponse};
 * when there is nothing to resume (v0 responds with an error, for example 404
 * when no resumable stream exists) it responds with `204 No Content`, which
 * `useChat` treats as "nothing to resume".
 *
 * ```ts
 * export async function GET(request: Request) {
 *   const chatId = new URL(request.url).searchParams.get('chatId')
 *   if (!chatId) return new Response(null, { status: 204 })
 *
 *   return toResumeResponse(v0.chats.resume({ chatId }, { sseMaxRetryAttempts: 1 }))
 * }
 * ```
 */
export async function toResumeResponse(
  result: V0StreamResult | Promise<V0StreamResult>,
  init?: Omit<Parameters<typeof createUIMessageStreamResponse>[0], 'stream'>,
): Promise<Response> {
  try {
    const resolved = await result

    const probe = resolved.stream[Symbol.asyncIterator]()
    try {
      await probe.next()
    } finally {
      await probe.return?.()
    }

    return toUIMessageStreamResponse(resolved, init)
  } catch {
    return new Response(null, { status: 204 })
  }
}

interface TextPartState {
  kind: 'text' | 'reasoning'
  id: string
  text: string
  open: boolean
}

interface DataPartState {
  kind: 'data'
  json: string
}

type PartState = TextPartState | DataPartState

type V0StreamSnapshot = V0StreamUpdate | V0StreamFinal

type V0TextPart = Extract<V0StreamSnapshot['parts'][number], { type: 'text' | 'thinking' }>

type V0DataPart = Exclude<V0StreamSnapshot['parts'][number], { type: 'text' | 'thinking' }>

class UIMessageStreamAdapter {
  private started = false
  private chatJson: string | undefined
  private pendingChat: Serialized<Chat> | undefined
  private metadataJson: string | undefined
  private readonly parts: PartState[] = []
  private readonly usedTextPartIds = new Set<string>()

  constructor(private readonly enqueue: (chunk: V0UIMessageChunk) => void) { }

  handleUpdate(update: V0StreamSnapshot): void {
    const messageId = update.message?.id ?? messageIdFromEvent(update.event)

    if (!this.started && messageId == null) {
      this.stashChat(update)
      return
    }

    this.ensureStarted(messageId, update)
    this.syncChat(update)
    this.syncMetadata(update, messageId)
    update.parts.forEach((part, index) => this.syncPart(index, part))
  }

  finish(final: V0StreamFinal): void {
    const messageId = final.message?.id ?? messageIdFromEvent(final.event)

    this.ensureStarted(messageId, final)
    this.syncChat(final)
    final.parts.forEach((part, index) => this.syncPart(index, part))

    for (const part of this.parts) {
      if (part.kind !== 'data' && part.open) {
        this.closeTextPart(part)
      }
    }

    this.enqueue({
      type: 'finish',
      finishReason: final.message?.finishReason ?? undefined,
      messageMetadata: buildMetadata(final, messageId),
    })
  }

  fail(error: unknown): void {
    this.enqueue({
      type: 'error',
      errorText: error instanceof Error ? error.message : 'v0 stream failed',
    })
  }

  private ensureStarted(messageId: string | undefined, update: V0StreamSnapshot): void {
    if (this.started) {
      return
    }

    this.started = true

    const metadata = buildMetadata(update, messageId)
    this.metadataJson = metadata ? JSON.stringify(metadata) : undefined
    this.enqueue({ type: 'start', messageId, messageMetadata: metadata })

    if (this.pendingChat) {
      this.enqueue(chatDataChunk(this.pendingChat))
      this.pendingChat = undefined
    }
  }

  private stashChat(update: V0StreamSnapshot): void {
    const chat = serializeChat(update)
    if (!chat) {
      return
    }

    const json = JSON.stringify(chat)
    if (json === this.chatJson) {
      return
    }

    this.chatJson = json
    this.pendingChat = chat
  }

  private syncChat(update: V0StreamSnapshot): void {
    const chat = serializeChat(update)
    if (!chat) {
      return
    }

    const json = JSON.stringify(chat)
    if (json === this.chatJson) {
      return
    }

    this.chatJson = json
    this.enqueue(chatDataChunk(chat))
  }

  private syncMetadata(update: V0StreamSnapshot, messageId: string | undefined): void {
    const metadata = buildMetadata(update, messageId)
    if (!metadata) {
      return
    }

    const json = JSON.stringify(metadata)
    if (json === this.metadataJson) {
      return
    }

    this.metadataJson = json
    this.enqueue({ type: 'message-metadata', messageMetadata: metadata })
  }

  private syncPart(index: number, part: V0StreamSnapshot['parts'][number]): void {
    if (part.type === 'text' || part.type === 'thinking') {
      this.syncTextPart(index, part)
      return
    }

    this.syncDataPart(index, part)
  }

  private syncTextPart(index: number, part: V0TextPart): void {
    const kind = part.type === 'text' ? 'text' : 'reasoning'
    const existing = this.parts[index]
    let state: TextPartState

    if (existing?.kind === kind) {
      state = existing
    } else {
      if (existing && existing.kind !== 'data' && existing.open) {
        this.closeTextPart(existing)
      }
      state = this.openTextPart(index, kind, '')
    }

    if (part.text !== state.text) {
      if (!state.open) {
        state = this.openTextPart(index, kind, state.text)
      }

      const delta = part.text.slice(commonPrefixLength(state.text, part.text))
      if (delta) {
        this.enqueue(
          kind === 'text'
            ? { type: 'text-delta', id: state.id, delta }
            : { type: 'reasoning-delta', id: state.id, delta },
        )
      }
      state.text = part.text
    }

    if (part.finishedAt != null && state.open) {
      this.closeTextPart(state)
    }
  }

  private syncDataPart(index: number, part: V0DataPart): void {
    const existing = this.parts[index]
    if (existing && existing.kind !== 'data' && existing.open) {
      this.closeTextPart(existing)
    }

    const { type, ...rest } = part
    const data = serializeDates(rest)
    const json = JSON.stringify(data)

    if (existing?.kind === 'data' && existing.json === json) {
      return
    }

    this.parts[index] = { kind: 'data', json }
    this.enqueue({ type: `data-${type}`, id: `part-${index}`, data } as V0UIMessageChunk)
  }

  private openTextPart(index: number, kind: TextPartState['kind'], text: string): TextPartState {
    const base = `${kind}-${index}`
    let id = base
    for (let attempt = 1; this.usedTextPartIds.has(id); attempt++) {
      id = `${base}-${attempt}`
    }
    this.usedTextPartIds.add(id)

    const state: TextPartState = { kind, id, text, open: true }
    this.parts[index] = state
    this.enqueue(kind === 'text' ? { type: 'text-start', id } : { type: 'reasoning-start', id })
    return state
  }

  private closeTextPart(state: TextPartState): void {
    state.open = false
    this.enqueue(
      state.kind === 'text'
        ? { type: 'text-end', id: state.id }
        : { type: 'reasoning-end', id: state.id },
    )
  }
}

function messageIdFromEvent(event: V0StreamEvent): string | undefined {
  switch (event.object) {
    case 'message':
    case 'message.parts.chunk':
    case 'message.usage': {
      return event.id
    }
    default: {
      return undefined
    }
  }
}

function buildMetadata(
  update: V0StreamSnapshot,
  messageId: string | undefined,
): V0MessageMetadata | undefined {
  if (update.message) {
    const { role: _role, content: _content, parts: _parts, ...metadata } = update.message
    return serializeDates(metadata)
  }

  const metadata: V0MessageMetadata = {}
  if (messageId != null) {
    metadata.id = messageId
  }
  if (update.chat) {
    metadata.chatId = update.chat.id
  }
  if (update.usage) {
    metadata.usage = update.usage
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined
}

function serializeChat(update: V0StreamSnapshot): Serialized<Chat> | undefined {
  if (!update.chat) {
    return undefined
  }

  return serializeDates({ ...update.chat, title: update.chat.title ?? update.title })
}

function chatDataChunk(chat: Serialized<Chat>): V0UIMessageChunk {
  return { type: 'data-chat', id: 'chat', data: chat, transient: true }
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length)
  let length = 0
  while (length < max && a[length] === b[length]) {
    length++
  }
  return length
}
