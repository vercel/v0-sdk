# v0

TypeScript SDK for the v0 Platform API.

## Install

```bash
npm install v0
```

## Usage

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

For server-side code deployed on Vercel with OIDC enabled, `auth` can be omitted.

See the repository README for streaming and development examples.
