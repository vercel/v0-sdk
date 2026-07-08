import type { DataUIPart, InferUIMessageChunk, UIMessage } from 'ai'
import type { Messages } from '../generated/sdk.gen'
import type { Chat, Message } from '../generated/types.gen'

/**
 * Maps a v0 API type to its JSON wire format: `Date` fields become ISO 8601
 * strings, everything else is preserved. UI messages cross the network as
 * JSON, so timestamps are typed the way they actually arrive in the browser.
 */
export type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer Item>
  ? Array<Serialized<Item>>
  : T extends object
  ? { [Key in keyof T]: Serialized<T[Key]> }
  : T

/**
 * Metadata carried on every {@link V0UIMessage}, derived from {@link Message}.
 * Everything except `role`, `content`, and `parts` (which the UI message
 * itself represents) flows through: `id`, `chatId`, `createdAt`, `updatedAt`,
 * `finishReason`, `attachments`, `authorId`, and `usage`. Fields are partial
 * because they arrive incrementally while a response streams.
 */
export type V0MessageMetadata = Serialized<Partial<Omit<Message, 'role' | 'content' | 'parts'>>>

type V0MessagePart = Message['parts'][number]

type V0DataPartType = Exclude<V0MessagePart['type'], 'text' | 'thinking'>

/**
 * The AI SDK data parts of a {@link V0UIMessage}, derived from
 * {@link Message}'s `parts` union. Every v0 part except `text` and `thinking`
 * (which map to the AI SDK's native `text` and `reasoning` parts) becomes a
 * `data-*` part carrying the v0 payload, e.g. `data-file-edit`, `data-bash`,
 * and `data-tool-call`. The extra `data-chat` part is transient: it streams
 * {@link Chat} snapshots (including the generated title) to `onData` while a
 * response is being generated, and is not persisted on the message.
 */
export type V0DataParts = {
  [Type in V0DataPartType]: Serialized<Omit<Extract<V0MessagePart, { type: Type }>, 'type'>>
} & {
  chat: Serialized<Chat>
}

/**
 * A v0 {@link Message} as an AI SDK `UIMessage`. Pass it as the message type
 * of `useChat` and every part, metadata field, and data part is fully typed:
 *
 * ```ts
 * useChat<V0UIMessage>()
 * ```
 */
export type V0UIMessage = UIMessage<V0MessageMetadata, V0DataParts, Record<never, never>>

/** The AI SDK stream chunk type produced for a {@link V0UIMessage}. */
export type V0UIMessageChunk = InferUIMessageChunk<V0UIMessage>

/** @internal */
export function serializeDates<T>(value: T): Serialized<T> {
  if (value instanceof Date) {
    return value.toISOString() as Serialized<T>
  }

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

/**
 * Converts a v0 {@link Message} into a {@link V0UIMessage}. Attachments become
 * AI SDK `file` parts, `text` and `thinking` parts become `text` and
 * `reasoning` parts, and every other part becomes its corresponding `data-*`
 * part. The remaining message fields are preserved as metadata.
 */
export function toUIMessage(message: Message): V0UIMessage {
  const { role, content: _content, parts, ...metadata } = message

  const uiParts: V0UIMessage['parts'] = (message.attachments ?? []).map((attachment) => ({
    type: 'file',
    url: attachment.url,
    mediaType: attachment.contentType ?? 'application/octet-stream',
    filename: attachment.name,
  }))

  parts.forEach((part, index) => {
    uiParts.push(toUIMessagePart(part, index))
  })

  return {
    id: message.id,
    role,
    metadata: serializeDates(metadata),
    parts: uiParts,
  }
}

/**
 * Converts v0 messages (for example from `v0.messages.list`, which returns
 * them newest first) into {@link V0UIMessage}s ordered oldest first, ready to
 * be passed as the initial `messages` of `useChat`.
 */
export function toUIMessages(messages: ReadonlyArray<Message>): V0UIMessage[] {
  return [...messages]
    .sort((a, b) => {
      const delta = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (delta !== 0) {
        return delta
      }
      if (a.role === b.role) {
        return 0
      }
      return a.role === 'user' ? -1 : 1
    })
    .map((message) => toUIMessage(message))
}

type MessagesSendParameters = Parameters<Messages['send']>[0]

/**
 * Extracts the v0 `message` text and `attachments` from an AI SDK `UIMessage`,
 * ready to be spread into `v0.chats.create`, `v0.chats.createStream`,
 * `v0.messages.send`, or `v0.messages.sendStream`.
 */
export function fromUIMessage(
  message: UIMessage,
): Pick<MessagesSendParameters, 'message' | 'attachments'> {
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n\n')

  const attachments = message.parts
    .filter((part) => part.type === 'file')
    .map((part) => ({ url: part.url }))

  return attachments.length > 0 ? { message: text, attachments } : { message: text }
}

function toUIMessagePart(part: V0MessagePart, index: number): V0UIMessage['parts'][number] {
  switch (part.type) {
    case 'text': {
      return { type: 'text', text: part.text, state: 'done' }
    }
    case 'thinking': {
      return { type: 'reasoning', text: part.text, state: 'done' }
    }
    default: {
      const { type, ...data } = part
      return {
        type: `data-${type}`,
        id: `part-${index}`,
        data: serializeDates(data),
      } as DataUIPart<V0DataParts>
    }
  }
}
