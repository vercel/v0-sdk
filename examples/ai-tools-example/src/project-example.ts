/**
 * Project Management Example
 *
 * This example shows how to work with v0 project tools
 */

import 'dotenv/config'
import { generateText, stepCountIs } from 'ai'
import { v0ToolsByCategory } from '@v0-sdk/ai-tools'

async function projectExample() {
  console.log('🏗️ Project Management Example\n')

  const tools = v0ToolsByCategory({
    apiKey: process.env.V0_API_KEY,
  })

  try {
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `
        Help me manage my v0 projects:
        1. First, show me all my existing projects
        2. Create a new project called "E-commerce Dashboard" with description "A modern admin dashboard for e-commerce management"
        3. Set up some environment variables for the new project (API_URL and DATABASE_URL)
      `,
      tools: {
        ...tools.project,
      },
      stopWhen: stepCountIs(5),
    })

    console.log('Project management result:', result.text)
    console.log(`Completed ${result.steps.length} steps`)

    // Show the tool calls that were made
    result.steps.forEach((step, index) => {
      if (step.toolCalls) {
        step.toolCalls.forEach((call) => {
          console.log(`Step ${index + 1}: Called ${call.toolName}`)
          // Note: call.result is not available in this AI SDK version
          // Results are processed internally by the AI model
        })
      }
    })
  } catch (error) {
    console.error('Error in project example:', error)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  projectExample().catch(console.error)
}

export { projectExample }
