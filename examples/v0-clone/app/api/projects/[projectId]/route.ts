import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params

    console.log('Fetching project details for:', projectId)
    console.log('Using baseUrl:', process.env.V0_API_URL || 'default')

    // Fetch project details using v0 SDK
    const project = await v0.projects.getById({ projectId })

    console.log('Project fetched successfully:', project.name)

    return NextResponse.json(project)
  } catch (error) {
    console.error('Project fetch error:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch project',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
