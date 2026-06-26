# v0

TypeScript SDK for the v0 API.

## Install

```sh
npm install v0
```

## Usage

```ts
import { createV0Client } from 'v0'

const v0 = createV0Client({
  auth: process.env.V0_API_KEY!,
})

const response = await v0.chats.create({
  message: 'Build me a personal website',
})

if (response.error) {
  throw new Error(response.error.message)
}

console.log(response.data.chat.id)
```

See https://v0.app/docs/api/v2 for full documentation and API reference.
