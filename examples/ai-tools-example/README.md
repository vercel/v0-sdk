# AI Tools Example

This example demonstrates how to use `@v0-sdk/ai-tools` with the AI SDK to interact with the v0 platform programmatically.

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in this directory:

   ```env
   V0_API_KEY=your_v0_api_key_here
   AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here
   ```

3. **Get your API keys:**
   - **v0 API Key**: Get from [v0.dev](https://v0.dev) account settings
   - **AI Gateway API Key**: Get from [vercel.com](https://vercel.com) AI Gateway settings

## Examples

### Simple Example (Recommended Start)

```bash
pnpm dev
```

Shows the basic structure and available tools without AI SDK complexity.

### Full AI Integration Examples

```bash
# Complete workflow examples
pnpm dev:full

# Chat-focused example
pnpm dev:chat

# Project management example
pnpm dev:project

# Advanced agent patterns example
pnpm dev:agent
```

**Note**: The full AI integration examples require compatible versions of AI SDK and may have type compatibility issues. Start with the simple example first.

## Key Concepts

### 1. All Tools (High Context)

```typescript
import { v0Tools } from '@v0-sdk/ai-tools'

const result = await generateText({
  model: 'openai/gpt-4o-mini',
  prompt: 'Create a new React component',
  tools: v0Tools({ apiKey: process.env.V0_API_KEY }),
})
```

⚠️ **Note**: This includes all ~20+ tools which adds significant context to your AI calls.

### 2. Selective Tools (Recommended)

```typescript
import { v0ToolsByCategory } from '@v0-sdk/ai-tools'

const tools = v0ToolsByCategory({ apiKey: process.env.V0_API_KEY })

const result = await generateText({
  model: 'openai/gpt-4o-mini',
  prompt: 'Create a new project and chat',
  tools: {
    ...tools.project, // Only project tools
    ...tools.chat, // Only chat tools
  },
})
```

### 3. Available Tool Categories

- **`tools.chat`** - Create, manage, and interact with v0 chats
- **`tools.project`** - Create and manage v0 projects
- **`tools.deployment`** - Handle deployments and logs
- **`tools.user`** - Get user information and billing details
- **`tools.hook`** - Manage webhooks for events

## Agent Patterns

The `dev:agent` example demonstrates advanced AI agent patterns:

### 1. Multi-Step Agent with `stopWhen`

- Autonomous agents that can plan and execute complex workflows
- Uses `stepCountIs()` to control execution length
- Structured answers with answer tools

### 2. Sequential Processing (Chains)

- Step-by-step workflows where each step builds on the previous
- Quality checks and iterative improvement
- Requirements analysis → Project creation → Validation

### 3. Routing Agent

- Intelligent request classification and routing
- Dynamic model selection based on complexity
- Context-aware tool selection

### 4. Parallel Processing

- Independent tasks executed simultaneously
- Efficient resource utilization
- Result synthesis from multiple analyses

### 5. Evaluator-Optimizer

- Feedback loops for continuous improvement
- Quality assessment and iterative refinement
- Self-improving workflows

## Tips

1. **Start with selective tools** - Only include the categories you need to reduce context size
2. **Use `stopWhen`** - Control agent execution with conditions like `stepCountIs(n)`
3. **Handle errors** - Wrap AI calls in try-catch blocks
4. **Monitor usage** - Check your API usage on both v0 and AI Gateway platforms

## Troubleshooting

- **"Invalid API key"**: Check your `.env` file and API key validity
- **"Tool not found"**: Ensure you're using the correct tool category
- **Rate limits**: Both v0 and AI Gateway have rate limits - add delays if needed
