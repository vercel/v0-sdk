# @v0-sdk/ai-tools

AI SDK tools for the v0 Platform API.

The tools are generated at build time from `packages/v0-sdk/openapi.json`, the
checked-in SDK copy of the v0 repo's `api/openapi-v2.json` spec. This is the
same OpenAPI document used to generate the `v0` SDK. Every OpenAPI operation is
exposed with a canonical key derived from its full `operationId`.

```ts
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { v0Tools, v0ToolsByCategory } from '@v0-sdk/ai-tools'

const allTools = v0Tools({ auth: process.env.V0_API_KEY })

const { chats, messages } = v0ToolsByCategory({
  auth: process.env.V0_API_KEY,
})

await generateText({
  model: openai('gpt-4.1'),
  tools: {
    ...chats,
    ...messages,
  },
  prompt: 'Create a new v0 chat for a pricing page.',
})
```

## Tool names

Tool keys are canonical operation names, not friendly aliases:

- `chats.create` becomes `chatsCreate`
- `messages.send` becomes `messagesSend`
- `organizations.teams.listApiKeys` becomes `organizationsTeamsListApiKeys`

## Categories

Use `v0ToolsByCategory(config)` to select operations by the first
`operationId` segment:

```ts
const tools = v0ToolsByCategory({ auth: process.env.V0_API_KEY })

tools.chats
tools.messages
tools.mcpServers
tools.organizations
tools.webhooks
```

The keys inside each category are still globally unique canonical names, so
multiple categories can be safely spread together.
