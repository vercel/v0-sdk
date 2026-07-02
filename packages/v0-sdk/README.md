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

The default `v0` client uses `VERCEL_TOKEN` when present, then `V0_API_KEY`, otherwise it falls back to Vercel OIDC auth for server-side code deployed on Vercel. Use `createV0Client` when you need custom auth or client options.

See https://v0.app/docs/api/v2 for full documentation and API reference.
