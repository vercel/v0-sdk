import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching Vercel projects...')
    console.log('Using baseUrl:', process.env.V0_API_URL || 'default')

    // Fetch Vercel projects using v0 SDK
    const projects = await v0.integrations.vercel.projects.find()

    console.log(
      'Vercel projects fetched successfully:',
      projects.data?.length || 0,
      'projects',
    )

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Vercel Integration Error:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch Vercel projects',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
