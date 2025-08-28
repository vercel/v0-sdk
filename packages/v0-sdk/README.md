# v0-sdk

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

A TypeScript SDK for interacting with the v0 Platform API to create and manage AI-powered chat conversations, projects, integrations, and more.

## Installation

```bash
npm install v0-sdk
# or
yarn add v0-sdk
# or
pnpm add v0-sdk
```

## Quick Start

Get your API key from [v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys).

Set `V0_API_KEY` environment variable.

### Create Chat and Generate Code

```typescript
import { v0 } from 'v0-sdk'

// Create a new chat
const chat = await v0.chats.create({
  message: 'Create a responsive navbar with Tailwind CSS',
  system: 'You are an expert React developer',
})
console.log(`Chat created: ${chat.webUrl}`)

// Preview generated code
console.log(`Preview URL: ${chat.latestVersion?.demoUrl}`)

// Use in your application
const previewHtml = `<iframe src="${chat.latestVersion?.demoUrl}" width="100%" height="600px"></iframe>`
```

## Features

- Full TypeScript support with complete type definitions
- Chat management - Create, manage, and interact with AI chats
- Project operations - Create and manage v0 projects
- Vercel integrations - Seamless Vercel project integration
- User management - Access user information and billing
- Deployment logs - Monitor and retrieve deployment information
- Comprehensive testing - Extensive test coverage for all functions
- Error handling - Robust error handling with detailed error types

## Configuration

The SDK supports two ways to create a client:

### Default Client

Use the default client with environment variables:

```typescript
import { v0 } from 'v0-sdk'

// Uses V0_API_KEY environment variable
const chat = await v0.chats.create({
  message: 'Create a responsive navbar with Tailwind CSS',
})
```

### Custom Client

Create a custom client with specific configuration:

```typescript
import { createClient } from 'v0-sdk'

// Create client with custom API key
const v0 = createClient({
  apiKey: process.env.V0_API_KEY_FOR_MY_ORG,
})

// Use the custom client
const chat = await v0.chats.create({
  message: 'Create a login form',
})
```

## API Reference

### Chat Operations

#### Create a Chat

Create a new chat conversation with the AI.

```typescript
const result = await v0.chats.create({
  message: 'Create a login form with validation',
  system: 'You are an expert in React and form validation',
  chatPrivacy: 'private',
  attachments: [{ url: 'https://example.com/design.png' }],
  modelConfiguration: {
    modelId: 'v0-1.5-md',
    imageGenerations: false,
  },
})
```

#### Streaming Chat Creation

Create a chat with streaming response for real-time output:

```typescript
import { parseStreamingResponse } from 'v0-sdk'

const stream = await v0.chats.create({
  message: 'Create a React button component',
  responseMode: 'experimental_stream',
})

// Parse the streaming response
for await (const event of parseStreamingResponse(stream)) {
  if (event.event === 'message') {
    console.log('Received chunk:', event.data)
  }
}
```

#### Get Chat by ID

```typescript
const chat = await v0.chats.getById({ chatId: 'chat_id' })
```

#### Add Messages to Chat

```typescript
const response = await v0.chats.sendMessage({
  chatId: 'chat_id',
  message: 'Add password strength indicator',
})
```

#### Other Chat Operations

- `v0.chats.find()` - Get chat history
- `v0.chats.delete({ chatId })` - Delete a chat
- `v0.chats.favorite({ chatId })` - Favorite a chat
- `v0.chats.unfavorite({ chatId })` - Unfavorite a chat
- `v0.projects.getByChatId({ chatId })` - Get chat's associated project

### Project Operations

```typescript
// Create a project
const project = await v0.projects.create({
  name: 'My New Project',
  description: 'A sample project',
})

// Find projects
const projects = await v0.projects.find()
```

### Vercel Integration

```typescript
// Create Vercel integration project
const integration = await v0.integrations.vercel.projects.create({
  projectId: 'vercel_project_id',
  name: 'project_name',
})

// Find Vercel projects
const projects = await v0.integrations.vercel.projects.find()
```

### User Management

```typescript
// Get user information
const userResponse = await v0.user.get()

// Get user plan and billing
const planResponse = await v0.user.getPlan()

// Get user scopes
const scopesResponse = await v0.user.getScopes()
```

### Other Operations

```typescript
// Find deployment logs
const logs = await v0.deployments.findLogs({ deploymentId: 'deployment_id' })

// Check rate limits
const rateLimits = await v0.rateLimits.find()
```

## TypeScript Support

The SDK includes complete type definitions for all API operations:

```typescript
import type {
  ChatsCreateRequest,
  ChatsCreateResponse,
  UserDetail,
  ProjectDetail,
  V0ClientConfig,
} from 'v0-sdk'

// Type-safe client configuration
const config: V0ClientConfig = {
  apiKey: 'your_api_key',
  baseUrl: 'https://api.v0.dev/v1', // optional
}

const v0 = createClient(config)
```

## Error Handling

The SDK provides detailed error information:

```typescript
try {
  const chat = await v0.chats.create({
    message: 'Create a component',
  })
} catch (error) {
  if (error.status === 403) {
    console.error('Authentication error:', error.message)
  } else if (error.status === 429) {
    console.error('Rate limit exceeded:', error.message)
  }
}
```

## Testing

The SDK includes comprehensive test coverage. Run tests with:

```bash
pnpm test
```

## Development

### Building

```bash
pnpm build
```

### Generating SDK

The SDK is generated from the OpenAPI specification:

```bash
pnpm sdk:generate
```

### Running Tests

```bash
# Run tests once (CI mode)
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Resources

- [v0 Documentation](https://v0.dev/docs)
- [API Terms](https://vercel.com/legal/api-terms)

## License

Apache 2.0
