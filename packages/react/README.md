# @v0-sdk/react

React hooks for building apps with the v0 API.

## Install

For the AI SDK transport:

```sh
npm install @v0-sdk/react react ai @ai-sdk/react
```

Add SWR when using the generated API hooks:

```sh
npm install @v0-sdk/react react swr
```

## Getting started

Create backend routes that authenticate with the server-side `v0` SDK, then pass those route URLs to the hooks. For example, this Next.js route proxies a streaming message request while keeping `V0_API_KEY` on the server:

```ts
// app/api/v0/chats/[chatId]/messages/stream/route.ts
import { v0 } from 'v0'

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  // Perform your own authentication and validation

  const { chatId } = await params
  const body = await request.json()

  const result = await v0.messages.sendStream({ chatId, ...body })

  return result.toResponse()
}
```

The client can call that route with the corresponding hook:

```tsx
import { useChat, useMessages, useSendMessage } from '@v0-sdk/react/swr'

export function Chat({ chatId }: { chatId: string }) {
  const chat = useChat(`/api/v0/chats/${chatId}`)
  const messages = useMessages(`/api/v0/chats/${chatId}/messages`, {
    limit: 50,
  })
  const send = useSendMessage(`/api/v0/chats/${chatId}/messages/stream`)

  if (chat.isLoading || messages.isLoading) {
    return <p>Loading…</p>
  }

  if (chat.error || messages.error) {
    return <p>Unable to load the chat.</p>
  }

  return (
    <main>
      <h1>{chat.data?.title}</h1>

      {messages.data?.messages.map((message) => (
        <article key={message.id}>{message.content}</article>
      ))}

      <button
        disabled={send.isMutating}
        onClick={async () => {
          const response = await send.trigger({ message: 'Build a dashboard' })
          await response.text()
          await messages.mutate()
        }}
      >
        Send message
      </button>
    </main>
  )
}
```

## AI SDK `useChat`

Use AI SDK directly with `V0Transport`. The transport points at your create, send, and resume proxy routes; v0 credentials remain on the server.

```tsx
import { useChat as useAIChat } from '@ai-sdk/react'
import {
  shouldResumeV0Chat,
  toV0UIMessages,
  V0Transport,
  type MessagesListResponse,
  type V0UIMessage,
} from '@v0-sdk/react'
import { useMemo } from 'react'

export function AIChat({ history }: { history: MessagesListResponse['messages'] }) {
  const chatId = history[0]?.chatId
  const transport = useMemo(
    () =>
      new V0Transport({
        chatId,
        messages: history,
        urls: {
          create: '/api/v0/chats/stream',
          send: (id) => `/api/v0/chats/${id}/messages/stream`,
          resume: (id) => `/api/v0/chats/${id}/resume`,
        },
      }),
    [chatId, history],
  )

  const chat = useAIChat<V0UIMessage>({
    id: chatId,
    messages: toV0UIMessages(history),
    resume: shouldResumeV0Chat(history),
    transport,
  })

  return <button onClick={() => chat.sendMessage({ text: 'Build a dashboard' })}>Send</button>
}
```

`toV0UIMessages` maps persisted newest-first v0 history to chronological AI SDK messages. Text, reasoning, files, tools, rich v0 data parts, metadata, and resumable state are preserved. To stop generation, import `useStopMessage` from `@v0-sdk/react/swr`, call it for the active assistant on the server, then call the AI SDK's `chat.stop()` locally.

When a newly created chat should immediately navigate to a different page, stop
the current transport directly from `onChatCreated`:

```tsx
const transport = new V0Transport({
  urls,
  onChatCreated(chatId, { stop }) {
    stop()
    router.push(`/chats/${chatId}`)
  },
})
```

## Pending tasks

Use `getPendingV0Task` to find the latest questions, plan, integration request,
or permission request carried by a v0 UI message:

```tsx
import { getPendingV0Task } from '@v0-sdk/react'

const pendingTask = getPendingV0Task(chat.messages.at(-1)!)
```

## Cache revalidation

Related mounted queries are revalidated after successful mutations:

- `useDeleteChat` revalidates chat lists.
- `useRestoreMessage` and `useUpdateChatFiles` revalidate messages and files.
- `useUpdateChat` revalidates the chat and chat lists.

Pass `revalidate: false` to the mutation configuration to opt out.

See [`examples/react-chat`](../../examples/react-chat) for a complete one-page app and authenticated proxy routes.
