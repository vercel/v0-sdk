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

const preview = await v0.chats.getPreview({
  chatId: response.data.chat.id,
})

if (preview.error) {
  throw new Error(preview.error.message)
}

console.log(preview.data?.url)
```

The default `v0` client uses `V0_API_KEY` when present, otherwise it falls back to Vercel OIDC auth for server-side code deployed on Vercel. Use `createV0Client` when you need custom auth or client options.

See https://v0.app/docs/api/v2 for full documentation and API reference.
