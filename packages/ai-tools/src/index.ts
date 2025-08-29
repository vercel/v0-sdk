import type { V0ToolsConfig } from './types'
import { createChatTools } from './tools/chat-tools'
import { createProjectTools } from './tools/project-tools'
import { createDeploymentTools } from './tools/deployment-tools'
import { createUserTools } from './tools/user-tools'
import { createHookTools } from './tools/hook-tools'

/**
 * Creates all v0 AI SDK tools as a flat object.
 *
 * ⚠️ Note: This includes ALL available tools (~20+ tools) which adds significant context.
 * Consider using v0ToolsByCategory() to select only the tools you need.
 *
 * @param config Configuration for v0 client
 * @returns Flat object with all v0 tools ready to use with AI SDK
 *
 * @example
 * ```typescript
 * import { generateText } from 'ai'
 * import { v0Tools } from '@v0-sdk/ai-tools'
 *
 * const result = await generateText({
 *   model: 'openai/gpt-4',
 *   prompt: 'Create a new React component',
 *   tools: v0Tools({
 *     apiKey: process.env.V0_API_KEY
 *   })
 * })
 * ```
 */
export function v0Tools(config: V0ToolsConfig = {}) {
  // Use environment variable if apiKey not provided
  const clientConfig = {
    ...config,
    apiKey: config.apiKey || process.env.V0_API_KEY,
  }

  const chatTools = createChatTools(clientConfig)
  const projectTools = createProjectTools(clientConfig)
  const deploymentTools = createDeploymentTools(clientConfig)
  const userTools = createUserTools(clientConfig)
  const hookTools = createHookTools(clientConfig)

  return {
    ...chatTools,
    ...projectTools,
    ...deploymentTools,
    ...userTools,
    ...hookTools,
  }
}

/**
 * Creates v0 tools organized by category for selective usage (recommended).
 * This allows you to include only the tools you need, reducing context size.
 *
 * @param config Configuration for v0 client
 * @returns Object containing all v0 tools organized by category
 *
 * @example
 * ```typescript
 * import { generateText } from 'ai'
 * import { v0ToolsByCategory } from '@v0-sdk/ai-tools'
 *
 * const tools = v0ToolsByCategory({
 *   apiKey: process.env.V0_API_KEY
 * })
 *
 * // Only include chat and project tools
 * const result = await generateText({
 *   model: 'openai/gpt-4',
 *   prompt: 'Create a new React component',
 *   tools: {
 *     ...tools.chat,
 *     ...tools.project
 *   }
 * })
 * ```
 */
export function v0ToolsByCategory(config: V0ToolsConfig = {}) {
  // Use environment variable if apiKey not provided
  const clientConfig = {
    ...config,
    apiKey: config.apiKey || process.env.V0_API_KEY,
  }

  return {
    /**
     * Chat-related tools for creating, managing, and interacting with v0 chats
     */
    chat: createChatTools(clientConfig),

    /**
     * Project-related tools for creating and managing v0 projects
     */
    project: createProjectTools(clientConfig),

    /**
     * Deployment-related tools for creating and managing deployments
     */
    deployment: createDeploymentTools(clientConfig),

    /**
     * User-related tools for getting user information, billing, and rate limits
     */
    user: createUserTools(clientConfig),

    /**
     * Webhook tools for creating and managing event hooks
     */
    hook: createHookTools(clientConfig),
  }
}

/**
 * @deprecated Use v0Tools instead (now returns flat structure by default)
 */
export function v0ToolsFlat(config: V0ToolsConfig = {}) {
  return v0Tools(config)
}

// Export individual tool creators for more granular usage
export { createChatTools } from './tools/chat-tools'
export { createProjectTools } from './tools/project-tools'
export { createDeploymentTools } from './tools/deployment-tools'
export { createUserTools } from './tools/user-tools'
export { createHookTools } from './tools/hook-tools'

// Export types
export type { V0ToolsConfig } from './types'

// Default export
export default v0Tools
