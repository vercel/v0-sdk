'use client'

import { useChat as useAIChat } from '@ai-sdk/react'
import {
  shouldResumeV0Chat,
  toV0UIMessages,
  useMessages,
  useStopMessage,
  V0Transport,
  type MessagesListResponse,
  type V0UIMessage,
} from '@v0-sdk/react'
import { useEffect, useMemo, useRef, useState } from 'react'

export function ChatPage({ chatId }: { chatId?: string }) {
  const history = useMessages(chatId ? `/api/v0/chats/${chatId}/messages` : null, {
    limit: 50,
  })

  if (chatId && history.isLoading) return <main className="shell">Loading chat…</main>
  if (history.error) return <main className="shell error">Unable to load this chat.</main>

  return (
    <ChatRuntime
      key={chatId ?? 'new'}
      initialChatId={chatId}
      history={history.data?.messages ?? []}
    />
  )
}

function ChatRuntime({
  initialChatId,
  history,
}: {
  initialChatId?: string
  history: MessagesListResponse['messages']
}) {
  const [input, setInput] = useState('')
  const [createdChatId, setCreatedChatId] = useState<string>()
  const navigated = useRef(false)
  const transport = useMemo(
    () =>
      new V0Transport({
        chatId: initialChatId,
        messages: history,
        urls: {
          create: '/api/v0/chats/stream',
          send: (id) => `/api/v0/chats/${id}/messages/stream`,
          resume: (id) => `/api/v0/chats/${id}/resume`,
        },
        onChatCreated: setCreatedChatId,
      }),
    [history, initialChatId],
  )
  const chat = useAIChat<V0UIMessage>({
    id: initialChatId,
    messages: toV0UIMessages(history),
    resume: shouldResumeV0Chat(history),
    transport,
  })

  useEffect(() => {
    if (!initialChatId && createdChatId && !navigated.current) {
      navigated.current = true
      window.history.pushState(null, '', `/chat/${createdChatId}`)
    }
  }, [createdChatId, initialChatId])

  const latestAssistant = [...chat.messages]
    .reverse()
    .find((message) => message.role === 'assistant')
  const activeAssistant = chat.status === 'streaming' ? latestAssistant : undefined
  const activeChatId = activeAssistant?.metadata?.chatId ?? createdChatId ?? transport.chatId
  const stopServer = useStopMessage(
    activeChatId && activeAssistant
      ? `/api/v0/chats/${activeChatId}/messages/${activeAssistant.id}/stop`
      : '/api/v0/disabled',
  )
  const generating = chat.status === 'submitted' || chat.status === 'streaming'

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">@v0-sdk/react + AI SDK</p>
          <h1>v0 chat</h1>
        </div>
        {initialChatId ? <a href="/">New chat</a> : null}
      </header>

      <section className="messages" aria-live="polite">
        {chat.messages.length === 0 ? (
          <p className="empty">Ask v0 to build or change an application.</p>
        ) : (
          chat.messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <strong>{message.role}</strong>
              {message.parts.map((part, index) => (
                <MessagePart key={`${message.id}:${index}`} part={part} />
              ))}
            </article>
          ))
        )}
      </section>

      {chat.error ? <p className="error">{chat.error.message}</p> : null}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          const text = input.trim()
          if (!text || generating) return
          setInput('')
          void chat.sendMessage({ text })
        }}
      >
        <textarea
          aria-label="Message"
          onChange={(event) => setInput(event.target.value)}
          placeholder="Build a project dashboard…"
          rows={3}
          value={input}
        />
        <div className="actions">
          <button disabled={!input.trim() || generating} type="submit">
            Send
          </button>
          <button
            disabled={!generating || !activeChatId || !activeAssistant || stopServer.isMutating}
            onClick={() => {
              void (async () => {
                try {
                  await stopServer.trigger()
                } finally {
                  await chat.stop()
                }
              })()
            }}
            type="button"
          >
            Stop
          </button>
          <span>{chat.status}</span>
        </div>
      </form>
    </main>
  )
}

function MessagePart({ part }: { part: V0UIMessage['parts'][number] }) {
  switch (part.type) {
    case 'text':
      return <div className="text">{part.text}</div>
    case 'reasoning':
      return (
        <details>
          <summary>Reasoning</summary>
          <div className="text">{part.text}</div>
        </details>
      )
    case 'file':
      return <a href={part.url}>{part.filename ?? part.url}</a>
    case 'data-v0-file-read':
    case 'data-v0-file-edit':
    case 'data-v0-search':
    case 'data-v0-bash':
    case 'data-v0-tool-call':
    case 'data-v0-agent-action':
      return <pre>{JSON.stringify(part.data, null, 2)}</pre>
    default:
      return null
  }
}
