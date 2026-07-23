---
name: v0
description: Build and modify applications that use the v0 TypeScript SDK and Platform API v2.
---

# v0 TypeScript SDK

Use this guidance when building or modifying applications that use the v0 TypeScript SDK.

## Setup

- Install the SDK from the `v0` package.
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

## Show previews

Use `v0.chats.getPreview({ chatId })` after a chat exists. As with other non-streaming methods, check `response.error` and read the preview from `response.data`.

The preview data may be `null` while the VM is starting. Poll until it is available. Preview access uses a short-lived token. If embedding the preview in an iframe, proxy requests through a server route and forward the token as `x-v0-preview-token`. Never send `V0_API_KEY` to the preview URL or browser.

## Documentation

Use the [v0 Platform API v2 documentation](https://v0.app/docs/api/v2) for endpoint details.
