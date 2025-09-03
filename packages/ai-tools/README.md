# @v0-sdk/ai-tools

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

AI SDK tools for the v0 Platform API. This package provides a comprehensive collection of tools that can be used with the AI SDK to interact with v0's API endpoints, enabling AI agents to create, manage, and deploy v0 projects and chats.

## Requirements

- **AI SDK**: ^5.0.0
- **Zod**: ^3.23.8 (required for AI SDK 5 compatibility)
- **Node.js**: >=22

## Installation

```bash
npm install @v0-sdk/ai-tools ai zod@^3.23.8
```

## Quick Start

```typescript
import { generateText } from 'ai'
import { v0Tools } from '@v0-sdk/ai-tools'

const result = await generateText({
  model: 'openai/gpt-4',
  prompt: 'Create a new React component for a todo list',
  tools: v0Tools({
    apiKey: process.env.V0_API_KEY,
  }),
})
```

That's it! `v0Tools()` returns all available tools in a flat structure ready to use with the AI SDK.

## Usage Patterns

### Organized by Category (Recommended - Better Context Management)

```typescript
import { v0ToolsByCategory } from '@v0-sdk/ai-tools'

const tools = v0ToolsByCategory({ apiKey: process.env.V0_API_KEY })

const result = await generateText({
  model: 'openai/gpt-4',
  prompt: 'Help me manage my v0 projects',
  tools: {
    // Only include specific categories you need
    ...tools.chat,
    ...tools.project,
  },
})
```

### All Tools (High Context Usage)

⚠️ **Note**: This includes all ~20+ tools which adds significant context to your AI calls.

```typescript
import { v0Tools } from '@v0-sdk/ai-tools'

const result = await generateText({
  model: 'openai/gpt-4',
  prompt: 'Complete workflow: create project, chat, and deploy',
  tools: v0Tools({ apiKey: process.env.V0_API_KEY }), // All tools available
})
```

### Organized by Category (Alternative Pattern)

```typescript
import { v0ToolsByCategory } from '@v0-sdk/ai-tools'

const tools = v0ToolsByCategory({ apiKey: process.env.V0_API_KEY })

const result = await generateText({
  model: 'openai/gpt-4',
  prompt: 'Help me manage my v0 projects',
  tools: {
    // Only include specific categories
    ...tools.chat,
    ...tools.project,
  },
})
```

### Individual Tool Creators (For Granular Control)

```typescript
import { createChatTools, createProjectTools } from '@v0-sdk/ai-tools'

const chatTools = createChatTools({ apiKey: process.env.V0_API_KEY })
const projectTools = createProjectTools({ apiKey: process.env.V0_API_KEY })

const result = await generateText({
  model: 'openai/gpt-4',
  prompt: 'Create a chat in my existing project',
  tools: {
    // Pick specific tools
    createChat: chatTools.createChat,
    sendMessage: chatTools.sendMessage,
    getProject: projectTools.getProject,
    assignChatToProject: projectTools.assignChatToProject,
  },
})
```

## Available Tools

### Chat Tools (`tools.chat`)

| Tool           | Description                                   |
| -------------- | --------------------------------------------- |
| `createChat`   | Create a new chat with v0                     |
| `sendMessage`  | Send a message to an existing chat            |
| `getChat`      | Get details of an existing chat               |
| `updateChat`   | Update chat properties (name, privacy)        |
| `deleteChat`   | Delete an existing chat                       |
| `favoriteChat` | Toggle favorite status of a chat              |
| `forkChat`     | Fork an existing chat to create a new version |
| `listChats`    | List all chats with filtering options         |

### Project Tools (`tools.project`)

| Tool                         | Description                                |
| ---------------------------- | ------------------------------------------ |
| `createProject`              | Create a new project in v0                 |
| `getProject`                 | Get details of an existing project         |
| `updateProject`              | Update project properties                  |
| `listProjects`               | List all projects                          |
| `assignChatToProject`        | Assign a chat to a project                 |
| `getProjectByChat`           | Get project details by chat ID             |
| `createEnvironmentVariables` | Create environment variables for a project |
| `listEnvironmentVariables`   | List environment variables for a project   |
| `updateEnvironmentVariables` | Update environment variables               |
| `deleteEnvironmentVariables` | Delete environment variables               |

### Deployment Tools (`tools.deployment`)

| Tool                  | Description                                    |
| --------------------- | ---------------------------------------------- |
| `createDeployment`    | Create a new deployment from a chat version    |
| `getDeployment`       | Get details of an existing deployment          |
| `deleteDeployment`    | Delete an existing deployment                  |
| `listDeployments`     | List deployments by project, chat, and version |
| `getDeploymentLogs`   | Get logs for a deployment                      |
| `getDeploymentErrors` | Get errors for a deployment                    |

### User Tools (`tools.user`)

| Tool             | Description                          |
| ---------------- | ------------------------------------ |
| `getCurrentUser` | Get current user information         |
| `getUserBilling` | Get current user billing information |
| `getUserPlan`    | Get current user plan information    |
| `getUserScopes`  | Get user scopes/permissions          |
| `getRateLimits`  | Get current rate limit information   |

### Hook Tools (`tools.hook`)

| Tool         | Description                              |
| ------------ | ---------------------------------------- |
| `createHook` | Create a new webhook for v0 events       |
| `getHook`    | Get details of an existing webhook       |
| `updateHook` | Update properties of an existing webhook |
| `deleteHook` | Delete an existing webhook               |
| `listHooks`  | List all webhooks                        |

## Configuration

### Environment Variables

Set your v0 API key as an environment variable:

```bash
export V0_API_KEY=your_api_key_here
```

### Direct Configuration

```typescript
import { v0Tools } from '@v0-sdk/ai-tools'

const tools = v0Tools({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://api.v0.dev', // optional, defaults to v0's API
})
```

## Examples

### Complete Workflow Example

```typescript
import { generateText } from 'ai'
import { v0Tools } from '@v0-sdk/ai-tools'

const result = await generateText({
  model: 'openai/gpt-4',
  prompt: `Help me with a complete v0 workflow:
  1. Create a new project for an e-commerce site
  2. Create a chat in that project to design a product catalog
  3. Send a message asking for a React component
  4. Deploy the result
  5. Check deployment logs`,
  tools: v0Tools({
    apiKey: process.env.V0_API_KEY,
  }),
})

console.log(result.text)
```

### Project Management Example

```typescript
import { generateText } from 'ai'
import { v0ToolsByCategory } from '@v0-sdk/ai-tools'

const tools = v0ToolsByCategory({ apiKey: process.env.V0_API_KEY })

const result = await generateText({
  model: 'openai/gpt-4',
  prompt:
    'Create a new project called "My Portfolio" with environment variables for API keys',
  tools: {
    // Only include project tools for this specific task
    ...tools.project,
  },
})
```

## TypeScript Support

The package is written in TypeScript and provides full type safety:

```typescript
import type { V0ToolsConfig } from '@v0-sdk/ai-tools'

const config: V0ToolsConfig = {
  apiKey: process.env.V0_API_KEY,
  baseUrl: 'https://api.v0.dev',
}

const tools = v0Tools(config)
```

## Error Handling

All tools include proper error handling and will throw descriptive errors if the v0 API returns an error:

```typescript
try {
  const result = await generateText({
    model: 'openai/gpt-4',
    prompt: 'Create a chat',
    tools: v0Tools({ apiKey: 'invalid-key' }),
  })
} catch (error) {
  console.error('Error:', error.message)
}
```

## Contributing

This package is part of the v0 SDK monorepo. See the main repository for contribution guidelines.

## License

Apache 2.0
