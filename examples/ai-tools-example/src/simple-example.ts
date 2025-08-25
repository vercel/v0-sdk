/**
 * Simple AI Tools Example
 *
 * This example shows the basic structure and usage of @v0-sdk/ai-tools
 * without complex AI SDK integration to avoid version compatibility issues.
 */

import 'dotenv/config'
import { v0Tools, v0ToolsByCategory } from '@v0-sdk/ai-tools'

async function simpleExample() {
  console.log('🔧 Simple AI Tools Example\n')

  // Example 1: Get all tools (flat structure)
  console.log('📝 Example 1: All tools (flat structure)')
  const allTools = v0Tools({
    apiKey: process.env.V0_API_KEY,
  })

  console.log('Available tools:', Object.keys(allTools).length)
  console.log(
    'Tool names:',
    Object.keys(allTools).slice(0, 5).join(', '),
    '...',
  )

  console.log('\n' + '='.repeat(50) + '\n')

  // Example 2: Get tools by category (recommended)
  console.log('🎯 Example 2: Tools by category (recommended)')
  const toolsByCategory = v0ToolsByCategory({
    apiKey: process.env.V0_API_KEY,
  })

  console.log('Available categories:', Object.keys(toolsByCategory))

  // Show tools in each category
  Object.entries(toolsByCategory).forEach(([category, tools]) => {
    console.log(`\n${category} tools:`, Object.keys(tools).join(', '))
  })

  console.log('\n' + '='.repeat(50) + '\n')

  // Example 3: Inspect a specific tool
  console.log('🔍 Example 3: Inspect a specific tool')
  const chatTools = toolsByCategory.chat
  const createChatTool = chatTools.createChat

  console.log('createChat tool structure:')
  console.log('- description:', createChatTool.description)
  console.log('- has inputSchema:', !!createChatTool.inputSchema)
  console.log(
    '- has execute function:',
    typeof createChatTool.execute === 'function',
  )

  // Show the input schema structure (if available)
  if (createChatTool.inputSchema && '_def' in createChatTool.inputSchema) {
    const schema = createChatTool.inputSchema as any
    if (schema._def?.shape) {
      console.log('- input parameters:', Object.keys(schema._def.shape))
    }
  }

  console.log('\n✅ Simple examples completed!')
  console.log('\n💡 Next steps:')
  console.log('1. Set up your V0_API_KEY in .env file')
  console.log(
    '2. Use these tools with AI SDK generateText() or similar functions',
  )
  console.log('3. Check the README.md for full integration examples')
}

// Run the examples
simpleExample().catch(console.error)
