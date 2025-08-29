/**
 * Agent Example - Advanced AI Agent Patterns
 *
 * This example demonstrates various agent patterns using @v0-sdk/ai-tools:
 * - Multi-step tool usage with stopWhen
 * - Sequential processing (chains)
 * - Routing based on context
 * - Parallel processing
 * - Evaluator-optimizer pattern
 * - Structured answers with answer tools
 */

import 'dotenv/config'
import { generateText, generateObject, tool, stepCountIs } from 'ai'
import { v0ToolsByCategory } from '@v0-sdk/ai-tools'
import { z } from 'zod'

// Initialize v0 tools
const tools = v0ToolsByCategory({
  apiKey: process.env.V0_API_KEY,
})

/**
 * Example 1: Multi-Step Agent with stopWhen
 * An agent that can autonomously create a complete v0 project workflow
 */
async function projectCreationAgent() {
  console.log('🤖 Example 1: Multi-Step Project Creation Agent\n')

  const { text, steps } = await generateText({
    model: 'openai/gpt-4o',
    tools: {
      ...tools.project,
      ...tools.chat,
      // Answer tool for structured final output
      projectSummary: tool({
        description:
          'Provide a structured summary of the completed project setup',
        inputSchema: z.object({
          projectId: z.string(),
          projectName: z.string(),
          chatId: z.string(),
          steps: z.array(z.string()),
          nextActions: z.array(z.string()),
        }),
        // No execute function - this terminates the agent
      }),
    },
    stopWhen: stepCountIs(8),
    system: `You are a v0 project setup agent. Your goal is to:
    1. Create a new project with a meaningful name and description
    2. Set up environment variables for the project
    3. Create a chat within that project to start development
    4. Provide a structured summary of what was accomplished
    
    Work step by step and use the available tools to accomplish this workflow.`,
    prompt: `Create a complete v0 project setup for an "E-commerce Product Catalog" application. 
    This should be a modern web app for browsing and managing product listings.
    
    Include appropriate environment variables and create an initial chat to start development.`,
  })

  console.log('Agent Result:', text)
  console.log(`Completed in ${steps.length} steps`)

  // Show all tool calls made by the agent
  const allToolCalls = steps.flatMap((step) => step.toolCalls)
  console.log('\nTool calls made:')
  allToolCalls.forEach((call, index) => {
    console.log(`${index + 1}. ${call.toolName}`)
  })
}

/**
 * Example 2: Sequential Processing (Chain)
 * A workflow that processes user requirements through multiple steps
 */
async function sequentialWorkflowAgent() {
  console.log('\n' + '='.repeat(60) + '\n')
  console.log('🔗 Example 2: Sequential Processing Chain\n')

  const userRequirement =
    'Build a dashboard for tracking fitness goals with charts and progress indicators'

  // Step 1: Analyze requirements
  const { object: analysis } = await generateObject({
    model: 'openai/gpt-4o',
    schema: z.object({
      projectType: z.string(),
      complexity: z.enum(['simple', 'medium', 'complex']),
      requiredFeatures: z.array(z.string()),
      suggestedTech: z.array(z.string()),
    }),
    prompt: `Analyze this project requirement: "${userRequirement}"
    
    Determine the project type, complexity level, required features, and suggested technologies.`,
  })

  console.log('Requirements Analysis:', analysis)

  // Step 2: Create project based on analysis
  const { text: projectResult } = await generateText({
    model: 'openai/gpt-4o',
    tools: {
      ...tools.project,
    },
    stopWhen: stepCountIs(3),
    system: `Create a v0 project based on the analyzed requirements. Use the analysis to inform your project setup.`,
    prompt: `Create a project for: "${userRequirement}"
    
    Based on analysis:
    - Type: ${analysis.projectType}
    - Complexity: ${analysis.complexity}
    - Features: ${analysis.requiredFeatures.join(', ')}
    - Tech: ${analysis.suggestedTech.join(', ')}`,
  })

  console.log('Project Creation Result:', projectResult)

  // Step 3: Quality check
  const { object: qualityCheck } = await generateObject({
    model: 'openai/gpt-4o',
    schema: z.object({
      completeness: z.number().min(1).max(10),
      alignment: z.number().min(1).max(10),
      suggestions: z.array(z.string()),
    }),
    prompt: `Evaluate how well this project setup aligns with the original requirement:
    
    Original: "${userRequirement}"
    Result: "${projectResult}"
    
    Rate completeness and alignment (1-10) and provide suggestions.`,
  })

  console.log('Quality Check:', qualityCheck)
}

/**
 * Example 3: Routing Agent
 * Routes different types of requests to appropriate workflows
 */
async function routingAgent(userRequest: string) {
  console.log('\n' + '='.repeat(60) + '\n')
  console.log('🚦 Example 3: Routing Agent\n')

  // Step 1: Classify the request
  const { object: classification } = await generateObject({
    model: 'openai/gpt-4o',
    schema: z.object({
      category: z.enum([
        'project_management',
        'chat_interaction',
        'deployment',
        'user_account',
      ]),
      complexity: z.enum(['simple', 'complex']),
      urgency: z.enum(['low', 'medium', 'high']),
      reasoning: z.string(),
    }),
    prompt: `Classify this user request: "${userRequest}"
    
    Determine the category, complexity, urgency, and provide reasoning.`,
  })

  console.log('Request Classification:', classification)

  // Step 2: Route based on classification
  const modelChoice =
    classification.complexity === 'simple' ? 'gpt-4o-mini' : 'gpt-4o'
  const toolSet = {
    project_management: tools.project,
    chat_interaction: tools.chat,
    deployment: tools.deployment,
    user_account: tools.user,
  }[classification.category]

  const systemPrompts = {
    project_management:
      'You are a project management specialist focused on v0 project operations.',
    chat_interaction:
      'You are a chat management specialist helping with v0 conversations.',
    deployment:
      'You are a deployment specialist managing v0 application deployments.',
    user_account:
      'You are a user account specialist handling v0 user operations.',
  }

  const { text: response } = await generateText({
    model: `openai/${modelChoice}`,
    tools: toolSet,
    system: systemPrompts[classification.category],
    stopWhen: stepCountIs(classification.complexity === 'simple' ? 3 : 6),
    prompt: userRequest,
  })

  console.log(`Routed to: ${classification.category} (${modelChoice})`)
  console.log('Response:', response)
}

/**
 * Example 4: Parallel Processing Agent
 * Performs multiple independent tasks simultaneously
 */
async function parallelProcessingAgent() {
  console.log('\n' + '='.repeat(60) + '\n')
  console.log('⚡ Example 4: Parallel Processing Agent\n')

  // Run multiple independent analyses in parallel
  const [projectAnalysis, userAnalysis, deploymentAnalysis] = await Promise.all(
    [
      // Analyze projects
      generateText({
        model: 'openai/gpt-4o-mini',
        tools: { ...tools.project },
        stopWhen: stepCountIs(2),
        system:
          'You are a project analyst. Focus on project metrics and insights.',
        prompt:
          'Analyze my v0 projects and provide insights about project patterns and usage.',
      }),

      // Analyze user account
      generateText({
        model: 'openai/gpt-4o-mini',
        tools: { ...tools.user },
        stopWhen: stepCountIs(2),
        system:
          'You are a user account analyst. Focus on account status and usage patterns.',
        prompt: 'Analyze my v0 account status, billing, and usage patterns.',
      }),

      // Analyze deployments
      generateText({
        model: 'openai/gpt-4o-mini',
        tools: { ...tools.deployment },
        stopWhen: stepCountIs(2),
        system:
          'You are a deployment analyst. Focus on deployment health and performance.',
        prompt:
          'Analyze my v0 deployments for health, performance, and any issues.',
      }),
    ],
  )

  console.log('Project Analysis:', projectAnalysis.text)
  console.log('\nUser Analysis:', userAnalysis.text)
  console.log('\nDeployment Analysis:', deploymentAnalysis.text)

  // Synthesize results
  const { text: synthesis } = await generateText({
    model: 'openai/gpt-4o',
    system:
      'You are a senior analyst synthesizing multiple reports into actionable insights.',
    prompt: `Synthesize these three analyses into key insights and recommendations:
    
    Project Analysis: ${projectAnalysis.text}
    User Analysis: ${userAnalysis.text}
    Deployment Analysis: ${deploymentAnalysis.text}`,
  })

  console.log('\nSynthesized Insights:', synthesis)
}

/**
 * Example 5: Evaluator-Optimizer Agent
 * Uses feedback loops to improve results iteratively
 */
async function evaluatorOptimizerAgent() {
  console.log('\n' + '='.repeat(60) + '\n')
  console.log('🔄 Example 5: Evaluator-Optimizer Agent\n')

  let currentResult = ''
  let iterations = 0
  const MAX_ITERATIONS = 3

  const projectIdea = 'AI-powered recipe recommendation system'

  // Initial project creation
  const { text: initialProject } = await generateText({
    model: 'openai/gpt-4o-mini',
    tools: { ...tools.project },
    stopWhen: stepCountIs(2),
    system: 'Create a v0 project based on the given idea.',
    prompt: `Create a project for: ${projectIdea}`,
  })

  currentResult = initialProject

  // Evaluation-optimization loop
  while (iterations < MAX_ITERATIONS) {
    // Evaluate current result
    const { object: evaluation } = await generateObject({
      model: 'openai/gpt-4o',
      schema: z.object({
        completeness: z.number().min(1).max(10),
        clarity: z.number().min(1).max(10),
        innovation: z.number().min(1).max(10),
        issues: z.array(z.string()),
        improvements: z.array(z.string()),
      }),
      system: 'You are an expert project evaluator.',
      prompt: `Evaluate this project setup for: "${projectIdea}"
      
      Current result: ${currentResult}
      
      Rate completeness, clarity, and innovation (1-10) and identify issues and improvements.`,
    })

    console.log(`Iteration ${iterations + 1} Evaluation:`, evaluation)

    // Check if quality meets threshold
    if (
      evaluation.completeness >= 8 &&
      evaluation.clarity >= 8 &&
      evaluation.innovation >= 7
    ) {
      console.log('Quality threshold met!')
      break
    }

    // Improve based on feedback
    const { text: improvedResult } = await generateText({
      model: 'openai/gpt-4o',
      tools: { ...tools.project },
      stopWhen: stepCountIs(3),
      system: 'Improve the project setup based on the evaluation feedback.',
      prompt: `Improve this project setup based on feedback:
      
      Issues: ${evaluation.issues.join(', ')}
      Improvements: ${evaluation.improvements.join(', ')}
      
      Current: ${currentResult}`,
    })

    currentResult = improvedResult
    iterations++
  }

  console.log(`Final Result (after ${iterations} iterations):`, currentResult)
}

/**
 * Main function to run all agent examples
 */
async function runAgentExamples() {
  console.log('🚀 AI Agent Patterns with v0 SDK Tools\n')

  try {
    // Example 1: Multi-step agent
    await projectCreationAgent()

    // Example 2: Sequential processing
    await sequentialWorkflowAgent()

    // Example 3: Routing agent
    await routingAgent(
      "I need to check my account billing and see if I'm close to any limits",
    )

    // Example 4: Parallel processing
    await parallelProcessingAgent()

    // Example 5: Evaluator-optimizer
    await evaluatorOptimizerAgent()

    console.log('\n✅ All agent examples completed!')
  } catch (error) {
    console.error('Error running agent examples:', error)
  }
}

// Run if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('agent-example.ts')) {
  runAgentExamples().catch(console.error)
}

export { runAgentExamples }
