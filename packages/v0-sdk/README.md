# v0

TypeScript SDK for the v0 API.

## Install

```sh
npm install v0
```

## Usage

```ts
import { v0 } from 'v0'

const response = await v0.chats.create({
  message: 'Build me a personal website',
})

if (response.error) {
  throw new Error(response.error.message)
}

console.log(response.data.chat.id)
```

The default `v0` client uses `V0_API_KEY` when present, otherwise it falls back
to Vercel OIDC auth for server-side code deployed on Vercel. Use
`createV0Client` when you need custom auth or client options.

## AI SDK

`v0/ai-sdk` and `v0/react` adapt v0 chats to the [AI SDK](https://ai-sdk.dev) so
`useChat` works out of the box, including streaming and stream resumption. They
are opt-in: install the peer dependencies you use.

```sh
npm install ai          # for v0/ai-sdk
npm install @ai-sdk/react react  # additionally, for v0/react
```

Stream v0 responses from a route handler:

```ts
// app/api/chat/route.ts
import { v0 } from 'v0'
import { toUIMessageStreamResponse } from 'v0/ai-sdk'

export async function POST(request: Request) {
  const { chatId, message, attachments } = await request.json()

  return toUIMessageStreamResponse(
    chatId
      ? await v0.messages.sendStream({ chatId, message, attachments })
      : await v0.chats.createStream({ message, attachments }),
  )
}

export async function GET(request: Request) {
  const chatId = new URL(request.url).searchParams.get('chatId')
  if (!chatId) return new Response(null, { status: 204 })

  try {
    return toUIMessageStreamResponse(await v0.chats.resume({ chatId }))
  } catch {
    return new Response(null, { status: 204 })
  }
}
```

And consume them with `useV0Chat`, a `useChat` preconfigured for the route
above:

```tsx
'use client'

import { useV0Chat } from 'v0/react'

export function Chat() {
  const { messages, sendMessage, status, chatId } = useV0Chat()

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case 'text':
                return <p key={index}>{part.text}</p>
              case 'reasoning':
                return <em key={index}>{part.text}</em>
              case 'data-file-edit':
                return (
                  <code
                    key={index}
                  >{`${part.data.operation} ${part.data.path}`}</code>
                )
              default:
                return null
            }
          })}
        </div>
      ))}
      <button
        disabled={status !== 'ready'}
        onClick={() => sendMessage({ text: 'Make it pop' })}
      >
        Send
      </button>
    </>
  )
}
```

Every part, metadata field, and data part is typed, derived from the SDK's
`Message` type: `text` and `thinking` parts map to the AI SDK's `text` and
`reasoning` parts, every other v0 part becomes a typed `data-*` part
(`data-file-edit`, `data-bash`, `data-tool-call`, ...), and the remaining
`Message` fields (`chatId`, `finishReason`, `usage`, ...) are the message
metadata.

`useV0Chat` sends `{ chatId, message, attachments }` request bodies, tracks the
v0 `chatId` from the response metadata for follow-up messages, and passes a
provided `chatId` through as the `useChat` id. Anything `useChat` accepts
(callbacks, initial `messages`, `resume`, ...) is accepted too. Prefer the plain
hook? `useChat<V0UIMessage>()` works with the same route handler.

Load an existing conversation with `toUIMessages`:

```ts
import { v0 } from 'v0'
import { toUIMessages } from 'v0/ai-sdk'

const response = await v0.messages.list({ chatId, limit: 100 })

if (response.error) {
  throw new Error(response.error.message)
}

const messages = toUIMessages(response.data.messages)
```

```tsx
useV0Chat({ chatId, messages })
```

To resume a generation that is still streaming (for example after a reload, or
after creating a chat with `v0.chats.createAsync` and redirecting), pass
`resume: true` together with `chatId`; the hook reconnects through the `GET`
handler above.

```tsx
useV0Chat({ chatId, messages, resume: true })
```

While a response streams, chat snapshots (including the generated title) arrive
as transient `data-chat` parts:

```tsx
useV0Chat({
  onData: (part) => {
    if (part.type === 'data-chat') {
      console.log(part.data.title)
    }
  },
})
```

See https://v0.app/docs/api/v2 for full documentation and API reference.
