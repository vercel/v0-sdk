import type { UIMessage } from 'ai'
import type { Message } from 'v0/browser'

type V0Part = Message['parts'][number]
export type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer Item>
    ? Array<Serialized<Item>>
    : T extends object
      ? { [Key in keyof T]: Serialized<T[Key]> }
      : T

export type V0UIMessageMetadata = Serialized<Partial<Omit<Message, 'role' | 'content' | 'parts'>>>

type V0DataPart = Exclude<V0Part, { type: 'text' | 'thinking' }>

export type V0UIDataTypes = {
  [Part in V0DataPart as `v0-${Part['type']}`]: Serialized<Omit<Part, 'type'>>
}

export type V0UIMessage = UIMessage<V0UIMessageMetadata, V0UIDataTypes>

/** Converts a persisted v0 message to an AI SDK UI message. */
export function toV0UIMessage(message: Message): V0UIMessage {
  const parts: V0UIMessage['parts'] = []

  for (const attachment of message.attachments ?? []) {
    parts.push({
      type: 'file',
      url: attachment.url,
      mediaType: attachment.contentType || 'application/octet-stream',
      ...(attachment.name ? { filename: attachment.name } : {}),
    })
  }

  message.parts.forEach((part, index) => {
    switch (part.type) {
      case 'text':
        parts.push({
          type: 'text',
          text: part.text,
          state: part.finishedAt || message.finishReason !== null ? 'done' : 'streaming',
        })
        break
      case 'thinking':
        parts.push({
          type: 'reasoning',
          text: part.text,
          state: part.finishedAt || message.finishReason !== null ? 'done' : 'streaming',
        })
        break
      default: {
        const { type, ...data } = part
        parts.push({
          type: `data-v0-${type}`,
          id: getV0PartId(message.id, index),
          data: serializeDates(data),
        } as V0UIMessage['parts'][number])
      }
    }
  })

  return {
    id: message.id,
    role: message.role,
    metadata: toV0UIMessageMetadata(message),
    parts,
  }
}

/** Converts SDK history to chronological AI SDK UI messages. */
export function toV0UIMessages(
  messages: readonly Message[],
  options: { newestFirst?: boolean } = {},
): V0UIMessage[] {
  const source = options.newestFirst === false ? messages : [...messages].reverse()
  return source.map(toV0UIMessage)
}

export function toV0UIMessageMetadata(message: Message): V0UIMessageMetadata {
  const { role: _role, content: _content, parts: _parts, ...metadata } = message
  return serializeDates(metadata)
}

export function serializeDates<T>(value: T): Serialized<T> {
  if (value instanceof Date) return value.toISOString() as Serialized<T>
  if (Array.isArray(value)) {
    return value.map((item) => serializeDates(item)) as Serialized<T>
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeDates(entry)]),
    ) as Serialized<T>
  }
  return value as Serialized<T>
}

export function getV0PartId(messageId: string, index: number): string {
  return `${messageId}:part:${index}`
}
