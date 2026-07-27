# @v0-sdk/react

React hooks for building apps with the v0 API.

## Install

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
import { useChat, useMessages, useSendMessage } from '@v0-sdk/react'

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
