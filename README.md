# v0 SDK

TypeScript SDK for the v0 Platform API.

This repository contains the v2 SDK package and compatible examples:

- [`v0`](./packages/v0-sdk) - TypeScript SDK generated from the v0 Platform API OpenAPI schema, with helpers for streaming responses and Vercel OIDC auth.
- [`examples/basic`](./examples/basic) - Small Bun scripts for synchronous and streaming chat creation.
- [`examples/simple-v0`](./examples/simple-v0) - Next.js app that uses the v2 SDK to generate, preview, manage, and deploy v0 chats.

## Install

```bash
npm install v0
# or
pnpm add v0
# or
yarn add v0
# or
bun add v0
```

## Usage

Get an API key from [v0.app/settings](https://v0.app/settings), then pass it to `createV0Client`.

```ts
import { createV0Client } from 'v0'

const v0 = createV0Client({
  auth: process.env.V0_API_KEY!,
})

const response = await v0.chats.create({
  body: {
    type: 'prompt',
    message: 'Build me a personal website',
  },
})

if (response.error) {
  throw new Error(response.error.message)
}

console.log(response.data.chat.id)
```

For server-side code deployed on Vercel with OIDC enabled, `auth` can be omitted and the SDK will use Vercel OIDC auth by default.

## Streaming

```ts
import { createV0Client, readV0Stream } from 'v0'

const v0 = createV0Client({
  auth: process.env.V0_API_KEY!,
})

const serverResult = await v0.chats.createStream({
  body: {
    type: 'prompt',
    message: 'Build a hello world button',
  },
})

const result = readV0Stream(serverResult.toResponse())

for await (const update of result.stream) {
  console.log(update)
}

console.log(await result.final)
```

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
