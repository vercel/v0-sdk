import type { UIMessageChunk } from 'ai'
import type { Message, V0StreamFinal, V0StreamResult, V0StreamUpdate } from 'v0/browser'

import {
  getV0PartId,
  serializeDates,
  toV0UIMessageMetadata,
  type V0UIDataTypes,
  type V0UIMessageMetadata,
} from './messages'

type V0Chunk = UIMessageChunk<V0UIMessageMetadata, V0UIDataTypes>
type V0Part = Message['parts'][number]
type V0MessageSnapshot = Pick<Message, 'id' | 'chatId' | 'parts' | 'finishReason'>

/** Converts accumulated v0 message snapshots into incremental AI SDK chunks. */
export class V0SnapshotChunkReducer {
  private previous: V0MessageSnapshot | undefined
  private metadata: V0UIMessageMetadata | undefined
  private metadataJson: string | undefined
  private started = false
  private finished = false
  private readonly activeText = new Map<number, { id: string; type: 'text' | 'thinking' }>()
  private readonly textPartAttempts = new Map<number, number>()

  constructor(seed?: Message) {
    this.previous = seed
    this.metadata = seed ? toV0UIMessageMetadata(seed) : undefined
  }

  push(update: V0StreamUpdate | V0StreamFinal, final = update.status === 'done'): V0Chunk[] {
    const message = getMessageSnapshot(update, this.previous)
    if (!message || this.finished) return []

    const chunks: V0Chunk[] = []
    this.metadata = getUpdateMetadata(update, message, this.metadata)
    const metadataJson = JSON.stringify(this.metadata)
    const metadataChanged = metadataJson !== this.metadataJson
    if (!this.started) {
      chunks.push({
        type: 'start',
        messageId: message.id,
        messageMetadata: this.metadata,
      })
      this.started = true
      this.metadataJson = metadataJson
    } else if (metadataChanged) {
      chunks.push({
        type: 'message-metadata',
        messageMetadata: this.metadata,
      })
      this.metadataJson = metadataJson
    }

    message.parts.forEach((part, index) => {
      const previousPart = this.previous?.parts[index]
      switch (part.type) {
        case 'text':
        case 'thinking':
          chunks.push(...this.updateTextPart(message, part, previousPart, index))
          break
        default: {
          const data = serializePartData(part)
          if (
            previousPart?.type !== part.type ||
            JSON.stringify(data) !== JSON.stringify(serializePartData(previousPart))
          ) {
            chunks.push({
              type: `data-v0-${part.type}`,
              id: getV0PartId(message.id, index),
              data,
            } as V0Chunk)
          }
        }
      }
    })

    this.previous = message

    if (final) {
      for (const { id, type } of this.activeText.values()) {
        chunks.push({ type: type === 'text' ? 'text-end' : 'reasoning-end', id })
      }
      this.activeText.clear()
      chunks.push({
        type: 'finish',
        ...(message.finishReason ? { finishReason: message.finishReason } : {}),
        messageMetadata: this.metadata,
      })
      this.finished = true
    }

    return chunks
  }

  private updateTextPart(
    message: V0MessageSnapshot,
    part: Extract<V0Part, { type: 'text' | 'thinking' }>,
    previousPart: V0Part | undefined,
    index: number,
  ): V0Chunk[] {
    const chunks: V0Chunk[] = []
    const previousText = previousPart?.type === part.type ? previousPart.text : ''
    // AI SDK text chunks are append-only, so non-append snapshot rewrites cannot
    // be represented without corrupting the already-rendered text.
    const delta = part.text.startsWith(previousText) ? part.text.slice(previousText.length) : ''
    let active = this.activeText.get(index)

    if (active && active.type !== part.type) {
      chunks.push({ type: active.type === 'text' ? 'text-end' : 'reasoning-end', id: active.id })
      this.activeText.delete(index)
      active = undefined
    }

    if ((!previousPart || delta) && !active) {
      const attempt = this.textPartAttempts.get(index) ?? 0
      const suffix =
        attempt === 0
          ? previousPart?.type === part.type
            ? ':continuation'
            : ''
          : `:continuation:${attempt}`
      const id = `${getV0PartId(message.id, index)}${suffix}`
      this.textPartAttempts.set(index, attempt + 1)
      active = { id, type: part.type }
      this.activeText.set(index, active)
      chunks.push({ type: part.type === 'text' ? 'text-start' : 'reasoning-start', id })
    }

    if (delta && active) {
      chunks.push({
        type: part.type === 'text' ? 'text-delta' : 'reasoning-delta',
        id: active.id,
        delta,
      })
    }

    if (active && part.finishedAt) {
      chunks.push({ type: part.type === 'text' ? 'text-end' : 'reasoning-end', id: active.id })
      this.activeText.delete(index)
    }

    return chunks
  }
}

/** Adapts a parsed v0 stream to the stream consumed by AI SDK `useChat`. */
export function v0StreamToUIMessageStream(
  result: V0StreamResult,
  options: {
    seed?: Message
    /**
     * Return `false` to stop forwarding the stream without surfacing an error
     * to the consumer.
     */
    onUpdate?: (update: V0StreamUpdate | V0StreamFinal) => boolean | void
    onClose?: () => void
    abort?: (reason?: unknown) => void
  } = {},
): ReadableStream<V0Chunk> {
  const reducer = new V0SnapshotChunkReducer(options.seed)
  let iterator: AsyncIterator<V0StreamUpdate> | undefined
  let canceled = false
  let closed = false
  const close = () => {
    if (closed) return
    closed = true
    options.onClose?.()
  }

  return new ReadableStream<V0Chunk>({
    async start(controller) {
      try {
        iterator = result.stream[Symbol.asyncIterator]()
        while (!canceled) {
          const next = await iterator.next()
          if (next.done) break
          if (options.onUpdate?.(next.value) === false) {
            canceled = true
            options.abort?.()
            await iterator.return?.()
            controller.close()
            return
          }
          for (const chunk of reducer.push(next.value)) controller.enqueue(chunk)
        }

        if (!canceled) {
          const final = await result.final
          if (options.onUpdate?.(final) === false) {
            canceled = true
            options.abort?.()
            await iterator.return?.()
            controller.close()
            return
          }
          for (const chunk of reducer.push(final, true)) controller.enqueue(chunk)
          controller.close()
        }
      } catch (error) {
        if (!canceled) controller.error(error)
      } finally {
        close()
      }
    },
    async cancel(reason) {
      canceled = true
      options.abort?.(reason)
      await iterator?.return?.()
      close()
    },
  })
}

function getMessageSnapshot(
  update: V0StreamUpdate | V0StreamFinal,
  previous: V0MessageSnapshot | undefined,
): V0MessageSnapshot | undefined {
  if (update.message) {
    return {
      id: update.message.id,
      chatId: update.message.chatId,
      parts: update.parts,
      finishReason: update.message.finishReason,
    }
  }

  if (
    !previous &&
    update.chat &&
    (update.event.object === 'message.parts.chunk' || update.event.object === 'message.usage')
  ) {
    return createAssistantSnapshot(update)
  }

  if (previous && update.status === 'done') {
    return { ...previous, parts: update.parts }
  }

  if (
    previous &&
    (update.event.object === 'message.parts.chunk' || update.event.object === 'message.usage')
  ) {
    return { ...previous, parts: update.parts }
  }

  return undefined
}

function getUpdateMetadata(
  update: V0StreamUpdate | V0StreamFinal,
  message: V0MessageSnapshot,
  previous: V0UIMessageMetadata | undefined,
): V0UIMessageMetadata {
  if (update.message) {
    return {
      ...toV0UIMessageMetadata(update.message),
      ...(update.usage ? { usage: update.usage } : {}),
    }
  }

  return {
    ...previous,
    id: message.id,
    chatId: update.chat?.id ?? previous?.chatId ?? message.chatId,
    ...(update.usage ? { usage: update.usage } : {}),
  }
}

function serializePartData(part: V0Part | undefined): unknown {
  if (!part) return undefined
  const { type: _type, ...data } = part
  return serializeDates(data)
}

function createAssistantSnapshot(update: V0StreamUpdate | V0StreamFinal): V0MessageSnapshot {
  return {
    id: update.event.id,
    chatId: update.chat!.id,
    parts: update.parts,
    finishReason: null,
  }
}
