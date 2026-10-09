# v0 SDK

TypeScript SDK for the v0 API.

This repository contains the v2 SDK package and compatible examples:

- [`v0`](./packages/v0-sdk) - TypeScript SDK generated from the v0 API OpenAPI schema, with helpers for streaming responses, Vercel OIDC auth, and browser-side Design Mode integration.
- [`@v0-sdk/react`](./packages/react) - AI SDK transport and generated `/swr` hooks for browser clients that call an application-owned v0 proxy.
- [`examples/basic`](./examples/basic) - Small TypeScript scripts for synchronous and streaming chat creation.
- [`examples/react-chat`](./examples/react-chat) - Minimal Next.js chat using AI SDK `useChat` with `V0Transport`.

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

const preview = await v0.chats.getPreview({
  chatId: response.data.chat.id,
})

if (preview.error) {
  throw new Error(preview.error.message)
}

console.log(preview.data?.url)
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

## Design Mode

`v0/browser` exports `createDesignModeBridge` for customer-owned frontends that embed v0 previews. It handles enabling/disabling Design Mode, Apply callbacks, screenshot conversion, selection/layer state, document reloads, and connection cleanup—without exposing an API key in the browser.

`toDesignModeMessage` converts raw runtime payloads, and `parseDesignModeMessage` validates normalized input on your backend. Both are also exported from `v0` for server-side use.

See the [Design Mode integration guide](./packages/v0-sdk/README.md#design-mode) for the browser bridge, authenticated backend forwarding, and preview requirements.

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
