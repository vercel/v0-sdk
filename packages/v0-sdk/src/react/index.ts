'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { ChatInit } from 'ai'
import { fromUIMessage } from '../ai-sdk/ui-message'
import type { V0UIMessage } from '../ai-sdk/ui-message'
import type { Chat } from '../generated/types.gen'
import { useNewChatId } from './use-new-chat-id'

export type {
  Serialized,
  V0DataParts,
  V0MessageMetadata,
  V0UIMessage,
  V0UIMessageChunk,
} from '../ai-sdk/ui-message'

type TransportOptions = NonNullable<
  ConstructorParameters<typeof DefaultChatTransport<V0UIMessage>>[0]
>

type UseChatPassthroughOptions = Pick<
  NonNullable<Parameters<typeof useChat<V0UIMessage>>[0]>,
  'experimental_throttle' | 'resume'
>

export type UseV0ChatOptions = Omit<ChatInit<V0UIMessage>, 'id' | 'transport'> &
  Pick<TransportOptions, 'api' | 'body' | 'credentials' | 'fetch' | 'headers'> &
  UseChatPassthroughOptions & {
    /**
     * The id of the v0 chat to continue. Omit it to start a new chat: v0
     * assigns the id when the first message is sent, and it is picked up from
     * the streamed message metadata.
     */
    chatId?: Chat['id']
  }

export type UseV0ChatHelpers = ReturnType<typeof useChat<V0UIMessage>> & {
  /**
   * The id of the v0 chat: the `chatId` option when provided, otherwise
   * derived from the latest message metadata once v0 creates the chat.
   * Persist it (for example in the URL) to continue the conversation later.
   */
  chatId: Chat['id'] | undefined
}

/**
 * `useChat` preconfigured for v0: messages are typed as {@link V0UIMessage},
 * requests carry the `{ chatId, message, attachments }` body expected by a
 * v0-backed route handler, and the v0 chat id is derived from the
 * conversation automatically.
 *
 * ```tsx
 * const { messages, sendMessage, chatId } = useV0Chat()
 * ```
 *
 * Pass `resume: true` together with `chatId` to reconnect to a generation
 * that is still streaming.
 */
export function useV0Chat(options: UseV0ChatOptions = {}): UseV0ChatHelpers {
  const {
    api,
    body,
    chatId,
    credentials,
    experimental_throttle,
    fetch,
    headers,
    resume,
    ...chatInit
  } = options

  const { nextChatId, generateNextChatId } = useNewChatId(chatId)

  let resolvedChatId = chatId ?? nextChatId ?? chatIdFromMessages(options.messages)

  const transport = new DefaultChatTransport<V0UIMessage>({
    api,
    body,
    credentials,
    fetch,
    headers,
    prepareSendMessagesRequest: async ({ body, messages }) => {
      const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')

      let id = resolvedChatId ?? chatIdFromMessages(messages) ?? (await generateNextChatId())

      return {
        body: { ...body, chatId: id, ...(lastUserMessage ? fromUIMessage(lastUserMessage) : {}) },
      }
    },
    prepareReconnectToStreamRequest: ({ api, id }) => ({
      api: `${api}?chatId=${encodeURIComponent(id)}`,
    }),
  })

  const helpers = useChat<V0UIMessage>({
    ...chatInit,
    id: resolvedChatId,
    transport,
    experimental_throttle,
    resume,
  })

  if (resolvedChatId == null) {
    resolvedChatId = chatIdFromMessages(helpers.messages)
  }

  return { ...helpers, chatId: resolvedChatId }
}

function chatIdFromMessages(messages: readonly V0UIMessage[] | undefined): Chat['id'] | undefined {
  if (messages == null) {
    return undefined
  }

  for (let index = messages.length - 1; index >= 0; index--) {
    const chatId = messages[index]?.metadata?.chatId
    if (chatId != null) {
      return chatId
    }
  }

  return undefined
}
