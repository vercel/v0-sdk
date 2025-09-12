import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'

export async function POST(request: NextRequest) {
  try {
    const { projectId, chatId, versionId } = await request.json()

    if (!projectId || !chatId || !versionId) {
      return NextResponse.json(
        {
          error: 'projectId, chatId, and versionId are required',
          details: {
            projectId: !!projectId,
            chatId: !!chatId,
            versionId: !!versionId,
          },
        },
        { status: 400 },
      )
    }

    // Create deployment using v0 SDK
    try {
      const result = await v0.deployments.create({
        projectId,
        chatId,
        versionId,
      })

      return NextResponse.json(result)
    } catch (deployError) {
      // Check if the error is about missing Vercel project ID
      if (
        deployError instanceof Error &&
        deployError.message.includes('Project has no Vercel project ID')
      ) {
        // Try to create a Vercel project first
        try {
          // Get project details to use as the Vercel project name
          const project = await v0.projects.getById({ projectId })
          const vercelProjectName = project.name || `v0-project-${projectId}`

          await v0.integrations.vercel.projects.create({
            projectId,
            name: vercelProjectName,
          })

          // Retry deployment after creating Vercel project
          const result = await v0.deployments.create({
            projectId,
            chatId,
            versionId,
          })

          return NextResponse.json(result)
        } catch (vercelError) {
          // If Vercel project creation fails, return that error
          throw new Error(
            `Failed to create Vercel project: ${vercelError instanceof Error ? vercelError.message : 'Unknown error'}`,
          )
        }
      }

      // Re-throw the original deployment error if it's not about Vercel project ID
      throw deployError
    }
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      // Check for API key related errors
      if (
        errorMessage.includes('api key is required') ||
        errorMessage.includes('v0_api_key') ||
        errorMessage.includes('config.apikey') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('invalid api key') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('401')
      ) {
        return NextResponse.json(
          { error: 'API_KEY_MISSING', message: error.message },
          { status: 401 },
        )
      }

      // Other specific errors
      return NextResponse.json(
        { error: `Failed to create deployment: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create deployment' },
      { status: 500 },
    )
  }
}
