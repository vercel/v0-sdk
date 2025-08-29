/**
 * Chat-focused Example
 *
 * This example shows how to work specifically with v0 chat tools
 */

import 'dotenv/config'
import { generateText, stepCountIs } from 'ai'
import { v0ToolsByCategory } from '@v0-sdk/ai-tools'

async function chatExample() {
  console.log('💬 Chat Management Example\n')

  const tools = v0ToolsByCategory({
    apiKey: process.env.V0_API_KEY,
  })

  try {
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `
        I want to create a new chat for building a React dashboard component.
        After creating the chat, send a follow-up message asking for dark mode support.
        Then list all my recent chats to see the new one.
      `,
      tools: {
        ...tools.chat,
      },
      stopWhen: stepCountIs(5),
    })

    console.log('Chat workflow result:', result.text)
    console.log(`Completed ${result.steps.length} steps`)

    // Show the tool calls that were made
    result.steps.forEach((step, index) => {
      if (step.toolCalls) {
        step.toolCalls.forEach((call) => {
          console.log(`Step ${index + 1}: Called ${call.toolName}`)
        })
      }
    })
  } catch (error) {
    console.error('Error in chat example:', error)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  chatExample().catch(console.error)
}

export { chatExample }
