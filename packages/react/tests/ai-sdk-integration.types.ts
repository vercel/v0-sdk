import { useChat } from '@ai-sdk/react'
import type { Message } from 'v0/browser'

import { shouldResumeV0Chat, toV0UIMessages, V0Transport, type V0UIMessage } from '../src'
import { useStopMessage } from '../src/swr'

// Compile-only proof that consumers use the real AI SDK hook directly.
export function useV0IntegrationFixture(history: Message[]) {
  const initialChatId = history[0]?.chatId
  const transport = new V0Transport({
    chatId: initialChatId,
    messages: history,
    urls: {
      create: '/api/v0/chats/stream',
      send: (chatId) => `/api/v0/chats/${chatId}/messages/stream`,
      resume: (chatId) => `/api/v0/chats/${chatId}/resume`,
    },
  })

  const chat = useChat<V0UIMessage>({
    id: initialChatId,
    messages: toV0UIMessages(history),
    resume: shouldResumeV0Chat(history),
    transport,
  })
  const assistant = [...chat.messages].reverse().find((message) => message.role === 'assistant')
  const chatId = assistant?.metadata?.chatId ?? transport.chatId
  const stop = useStopMessage(
    chatId && assistant
      ? `/api/v0/chats/${chatId}/messages/${assistant.id}/stop`
      : '/api/v0/disabled',
  )

  const stopGeneration = async () => {
    if (chatId && assistant) await stop.trigger()
    await chat.stop()
  }

  return { ...chat, stopGeneration, v0ChatId: transport.chatId }
}
