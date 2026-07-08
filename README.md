# v0 SDK

TypeScript SDK for the v0 Platform API.

This repository contains the v2 SDK package and compatible examples:

- [`v0`](./packages/v0-sdk) - TypeScript SDK generated from the v0 Platform API OpenAPI schema, with helpers for streaming responses and Vercel OIDC auth.
- [`examples/basic`](./examples/basic) - Small Bun scripts for synchronous and streaming chat creation.
- [`examples/simple-v0`](./examples/simple-v0) - Next.js app that uses the v2 SDK to generate, preview, manage, and deploy v0 chats.

## Install

```bash
npm install v0@canary
# or
pnpm add v0@canary
# or
yarn add v0@canary
# or
bun add v0@canary
```

## Usage

Set `V0_API_KEY`, or deploy server-side code on Vercel with OIDC enabled, then use the default client.

You can get an API key from [v0.app/settings](https://v0.app/settings)

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

Use `createV0Client` when you need to customize auth, `baseUrl`, or fetch options.

```ts
import { createV0Client } from 'v0'

const v0 = createV0Client({
  auth: process.env.CUSTOM_V0_API_KEY!,
})
```

## Streaming

```ts
import { readV0Stream, v0 } from 'v0'

const serverResult = await v0.chats.createStream({
  message: 'Build a hello world button',
})

const result = readV0Stream(serverResult.toResponse())

for await (const update of result.stream) {
  console.log(update)
}

console.log(await result.final)
```

## AI SDK

The `v0/ai-sdk` and `v0/react` entry points adapt v0 chats to the [AI SDK](https://ai-sdk.dev), with `ai`, `@ai-sdk/react`, and `react` as optional peer dependencies.

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
```

```tsx
'use client'

import { useV0Chat } from 'v0/react'

const { messages, sendMessage, chatId } = useV0Chat()
```

Messages are fully typed (`V0UIMessage`), derived from the SDK's `Message` type. `toUIMessages` converts `v0.messages.list` responses into initial `useChat` messages, and `resume: true` reconnects to in-flight generations. See the [package README](./packages/v0-sdk/README.md#ai-sdk) for the full guide.

## Development

This repo uses Bun workspaces.

```bash
bun install
bun run generate
bun run build
bun run typecheck
bun run lint
bun run fmt:check
```

The generated SDK is built from [`packages/v0-sdk/openapi.json`](./packages/v0-sdk/openapi.json) with [`@hey-api/openapi-ts`](https://heyapi.dev/openapi-ts/get-started).

## License

Apache 2.0
