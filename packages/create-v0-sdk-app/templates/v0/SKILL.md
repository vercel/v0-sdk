---
name: v0
description: Build and modify applications that use the v0 API, TypeScript SDK, and React package.
---

# v0 TypeScript SDK

Use this guidance when building or modifying applications that use the v0 TypeScript SDK.

## Setup

- Install the server SDK from `v0`. For React clients, install `@v0-sdk/react`; add `ai` and `@ai-sdk/react` for AI SDK chat, or `swr` for the generated API hooks.
- Import the default client with `import { v0 } from 'v0'` for simple server-side usage.
- Use `createV0Client` when the application needs custom authentication, a custom base URL, or custom fetch options.
- Read `V0_API_KEY` on the server. Never expose it to client components or browser code.
- The v2 API is organized around chats, messages, files, previews, and deployments.

## Create a chat

Use `v0.chats.create({ message })` when the caller can wait for completion. Non-streaming SDK methods return a result containing `data` or `error`:

```ts
const response = await v0.chats.create({ message })
if (response.error) throw new Error(response.error.message)

const chat = response.data.chat
```

Store `chat.id` so later requests can continue the same workspace. Chat metadata can be used for application grouping, customer IDs, or internal routing.

Use `v0.chats.createStream({ message })` for interactive interfaces that show progress.

## Send follow-up messages

- Use `v0.messages.send({ chatId, message })` to continue an existing chat synchronously.
- Use `v0.messages.sendStream({ chatId, message })` to stream progress for an existing chat.
- Treat messages as the conversation history and agent trace. Render message `parts` when the UI needs to show thinking, file edits, tool calls, and final text.

## Streaming

The SDK stream result can be returned directly from a server with `result.toResponse()`, or consumed with `for await (const update of result.stream)`.

On the client, use `readV0Stream(response)` when consuming the v0 wire format directly. Prefer streaming for chat-style interfaces so the UI can update while v0 thinks, edits files, and reports usage.

## Use React

Keep the `v0` client on the server. React components should call authenticated, application-owned proxy routes rather than the v0 API directly. Validate the request in each route, call the matching `v0` SDK method, and return its data or stream. A streaming route can return `result.toResponse()` directly.

For chat interfaces, prefer AI SDK's `useChat` with `V0Transport`:

```tsx
import { useChat } from '@ai-sdk/react'
import {
  shouldResumeV0Chat,
  toV0UIMessages,
  V0Transport,
  type MessagesListResponse,
  type V0UIMessage,
} from '@v0-sdk/react'
import { useMemo } from 'react'

export function Chat({
  chatId,
  history,
}: {
  chatId?: string
  history: MessagesListResponse['messages']
}) {
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

  const chat = useChat<V0UIMessage>({
    id: chatId,
    messages: toV0UIMessages(history),
    resume: shouldResumeV0Chat(history),
    transport,
  })

  return <button onClick={() => chat.sendMessage({ text: 'Build a dashboard' })}>Send</button>
}
```

- `toV0UIMessages` converts persisted, newest-first v0 history to chronological AI SDK messages while preserving text, reasoning, files, tool activity, metadata, and resumable state.
- Render `chat.messages` by iterating over each message's `parts`; send text with `chat.sendMessage({ text })`.
- For a new chat, use `V0Transport`'s `onChatCreated` callback to store the returned chat ID or navigate to its page.
- To stop generation, call the server through `useStopMessage` for the active assistant message, then call AI SDK's `chat.stop()` locally.

For API reads and mutations outside the live chat stream, import the generated SWR hooks from `@v0-sdk/react/swr`:

```tsx
import { useChat, useMessages, useUpdateChat } from '@v0-sdk/react/swr'

const chat = useChat(`/api/v0/chats/${chatId}`)
const messages = useMessages(`/api/v0/chats/${chatId}/messages`, { limit: 50 })
const update = useUpdateChat(`/api/v0/chats/${chatId}`)
```

Query hooks expose SWR state such as `data`, `error`, `isLoading`, and `mutate`. Mutation hooks expose `trigger` and `isMutating`. Pass `null` as a query URL when required data is not ready. Successful mutations revalidate related mounted queries by default; pass `revalidate: false` in mutation configuration to opt out.

Import browser-safe v0 types, `V0Transport`, message conversion helpers, and `getPendingV0Task` from `@v0-sdk/react`. Import generated query and mutation hooks only from `@v0-sdk/react/swr`.

## Show previews

Use `v0.chats.getPreview({ chatId })` after a chat exists. As with other non-streaming methods, check `response.error` and read the preview from `response.data`.

Generated previews are untrusted code. Embed them through a dedicated preview
proxy deployed on a different registrable domain from the host application, not
on the host origin or a same-site subdomain. Keep that proxy free of host-app
sessions and unrelated application routes.

Use the SDK's `fetchPreview` helper in the dedicated proxy. It obtains and
refreshes short-lived preview credentials, forwards preview requests, and
returns the loading fallback while a preview is stale or starting. Never send
`V0_API_KEY` to the preview URL or browser.

The iframe needs `sandbox="allow-scripts allow-same-origin ..."` for generated
React apps to hydrate and run normally. The separate proxy origin provides the
security boundary; do not remove `allow-same-origin` as a substitute for origin
isolation.

## Documentation

Use the [documentation](https://v0.app/docs/api/v2) for endpoint details.
