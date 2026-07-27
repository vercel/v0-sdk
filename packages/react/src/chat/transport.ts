import type { ChatTransport, UIMessageChunk } from 'ai'
import {
  readV0Stream,
  type ChatsCreateStreamData,
  type Message,
  type MessagesSendStreamData,
  type V0StreamFinal,
  type V0StreamUpdate,
} from 'v0/browser'

import { requestV0Operation, type V0Operation, type V0RequestOptions } from '../request'
import { v0StreamToUIMessageStream } from './chunks'
import { getResumableV0Assistant } from './composition'
import type { V0UIMessage } from './messages'

export type V0TransportChatUrl = string | ((chatId: string) => string)

export interface V0TransportUrls {
  create: string
  send: V0TransportChatUrl
  resume: V0TransportChatUrl
}

export interface V0TransportOptions {
  urls: V0TransportUrls
  chatId?: string
  /** Newest-first SDK history, used to seed a resumed assistant. */
  messages?: readonly Message[]
  create?: Omit<ChatsCreateStreamData['body'], 'message' | 'attachments'>
  send?: Omit<MessagesSendStreamData['body'], 'message' | 'attachments'>
  request?: V0RequestOptions
  onChatCreated?: (chatId: string) => void
}

const streamOperation: V0Operation<Response> = {
  id: 'ai-sdk.stream',
  method: 'POST',
  response: 'stream',
}

/** AI SDK chat transport backed by caller-owned v0 proxy routes. */
export class V0Transport implements ChatTransport<V0UIMessage> {
  private currentChatId: string | undefined
  private reconnecting = false
  private readonly seed: Message | undefined
  private readonly options: V0TransportOptions

  constructor(options: V0TransportOptions) {
    this.options = options
    this.currentChatId = options.chatId ?? options.messages?.[0]?.chatId
    this.seed = getResumableV0Assistant(options.messages ?? [])
  }

  get chatId(): string | undefined {
    return this.currentChatId
  }

  async sendMessages(
    options: Parameters<ChatTransport<V0UIMessage>['sendMessages']>[0],
  ): Promise<ReadableStream<UIMessageChunk>> {
    if (options.trigger === 'regenerate-message') {
      throw new Error(
        'V0Transport does not support regeneration because the v0 API has no regeneration operation',
      )
    }

    const userMessage = [...options.messages].reverse().find((message) => message.role === 'user')
    if (!userMessage) throw new Error('V0Transport requires a user message to submit')

    const message = userMessage.parts
      .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
      .map((part) => part.text)
      .join('\n\n')
    const attachments = userMessage.parts
      .filter((part): part is Extract<typeof part, { type: 'file' }> => part.type === 'file')
      .map((part) => ({ url: part.url }))
    const extraBody = isObject(options.body) ? options.body : {}
    const controller = new AbortController()
    const request = mergeRequestOptions(
      this.options.request,
      options.headers,
      combineSignals(this.options.request?.signal, options.abortSignal, controller.signal),
    )

    const url = this.currentChatId
      ? resolveChatUrl(this.options.urls.send, this.currentChatId)
      : this.options.urls.create
    const body = this.currentChatId
      ? ({
          ...this.options.send,
          ...extraBody,
          message,
          ...(attachments.length ? { attachments } : {}),
        } satisfies MessagesSendStreamData['body'])
      : ({
          ...this.options.create,
          ...extraBody,
          message,
          ...(attachments.length ? { attachments } : {}),
        } satisfies ChatsCreateStreamData['body'])

    const response = await requestV0Operation<Response>(url, streamOperation, body, request)

    return v0StreamToUIMessageStream(readV0Stream(response), {
      onUpdate: (update) => this.captureChatId(update),
      abort: (reason) => controller.abort(reason),
    })
  }

  async reconnectToStream(
    options: Parameters<ChatTransport<V0UIMessage>['reconnectToStream']>[0],
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    if (this.reconnecting) return null
    const chatId = this.currentChatId ?? options.chatId
    if (!chatId || !this.seed) return null

    this.reconnecting = true
    const controller = new AbortController()

    try {
      const url = resolveChatUrl(this.options.urls.resume, chatId)
      const response = await requestV0Operation<Response>(
        url,
        streamOperation,
        undefined,
        mergeRequestOptions(
          this.options.request,
          options.headers,
          combineSignals(this.options.request?.signal, controller.signal),
        ),
      )

      if (response.status === 204) {
        this.reconnecting = false
        return null
      }

      return v0StreamToUIMessageStream(readV0Stream(response), {
        seed: this.seed,
        onUpdate: (update) => this.captureChatId(update),
        abort: (reason) => controller.abort(reason),
        onClose: () => {
          this.reconnecting = false
        },
      })
    } catch (error) {
      this.reconnecting = false
      throw error
    }
  }

  private captureChatId(update: V0StreamUpdate | V0StreamFinal) {
    const chatId = update.chat?.id ?? update.message?.chatId
    if (!chatId || chatId === this.currentChatId) return
    this.currentChatId = chatId
    this.options.onChatCreated?.(chatId)
  }
}

function resolveChatUrl(url: V0TransportChatUrl, chatId: string): string {
  return typeof url === 'function' ? url(chatId) : url
}

function mergeRequestOptions(
  request: V0RequestOptions | undefined,
  extraHeaders: HeadersInit | undefined,
  signal: AbortSignal,
): V0RequestOptions {
  const headers = new Headers(request?.headers)
  new Headers(extraHeaders).forEach((value, key) => headers.set(key, value))
  return { ...request, headers, signal }
}

function combineSignals(...values: Array<AbortSignal | null | undefined>): AbortSignal {
  const signals = values.filter(
    (value): value is AbortSignal => value !== null && value !== undefined,
  )
  if (signals.length === 1) return signals[0]!

  const controller = new AbortController()
  const abort = (signal: AbortSignal) => {
    if (!controller.signal.aborted) controller.abort(signal.reason)
  }

  for (const signal of signals) {
    if (signal.aborted) {
      abort(signal)
      break
    }
    signal.addEventListener('abort', () => abort(signal), { once: true })
  }
  return controller.signal
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
