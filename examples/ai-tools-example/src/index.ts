/**
 * AI Tools Example - Basic Usage
 *
 * This example demonstrates how to use @v0-sdk/ai-tools with the AI SDK
 * to create and manage v0 projects and chats.
 */

import 'dotenv/config'
import { generateText, stepCountIs } from 'ai'
import { v0Tools, v0ToolsByCategory } from '@v0-sdk/ai-tools'

async function main() {
  console.log('🚀 AI Tools Example\n')

  // Example 1: Using all tools (high context usage)
  console.log('📝 Example 1: Using all tools')
  try {
    const result1 = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: 'Create a new v0 chat for building a React todo list component',
      tools: v0Tools({
        apiKey: process.env.V0_API_KEY,
      }),
      stopWhen: stepCountIs(3),
    })

    console.log('Result:', result1.text)
    console.log('Tool calls:', result1.steps.length)
  } catch (error) {
    console.error('Error in example 1:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Example 2: Using selective tools (recommended approach)
  console.log('🎯 Example 2: Using selective tools (recommended)')
  try {
    const tools = v0ToolsByCategory({
      apiKey: process.env.V0_API_KEY,
    })

    const result2 = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt:
        'Create a new project called "My Portfolio Website" and then create a chat within that project',
      tools: {
        // Only include the tools we need
        ...tools.project,
        ...tools.chat,
      },
      stopWhen: stepCountIs(5),
    })

    console.log('Result:', result2.text)
    console.log('Tool calls:', result2.steps.length)
  } catch (error) {
    console.error('Error in example 2:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Example 3: Project management workflow
  console.log('🏗️ Example 3: Project management workflow')
  try {
    const tools = v0ToolsByCategory({
      apiKey: process.env.V0_API_KEY,
    })

    const result3 = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt:
        'List all my existing projects and show me details about the most recent one',
      tools: {
        ...tools.project,
        ...tools.user,
      },
      stopWhen: stepCountIs(3),
    })

    console.log('Result:', result3.text)
    console.log('Tool calls:', result3.steps.length)
  } catch (error) {
    console.error('Error in example 3:', error)
  }

  console.log('\n✅ Examples completed!')
}

// Run the examples
main().catch(console.error)
