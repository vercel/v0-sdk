import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'
import {
  getUserIP,
  getUserProjects,
  associateProjectWithIP,
} from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Get user's IP
    const userIP = getUserIP(request)

    // Get all projects from v0
    const response = await v0.projects.find()
    const allProjects = response.data || response || []

    // Get user's project IDs from Redis
    const userProjectIds = await getUserProjects(userIP)

    // Filter projects to only include those owned by this user
    const userProjects = allProjects.filter((project: any) =>
      userProjectIds.includes(project.id),
    )

    return NextResponse.json({ data: userProjects })
  } catch (error) {
    // Check if it's an API key error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (
        errorMessage.includes('api key is required') ||
        errorMessage.includes('v0_api_key') ||
        errorMessage.includes('config.apikey')
      ) {
        return NextResponse.json(
          { error: 'API_KEY_MISSING', message: error.message },
          { status: 401 },
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 },
      )
    }

    // Get user's IP
    const userIP = getUserIP(request)

    // Create project using v0 SDK
    const project = await v0.projects.create({
      name: name.trim(),
    })

    // Associate the project with the user's IP
    if (project.id) {
      await associateProjectWithIP(project.id, userIP)
    }

    return NextResponse.json(project)
  } catch (error) {
    // Check if it's an API key error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (
        errorMessage.includes('api key is required') ||
        errorMessage.includes('v0_api_key') ||
        errorMessage.includes('config.apikey')
      ) {
        return NextResponse.json(
          { error: 'API_KEY_MISSING', message: error.message },
          { status: 401 },
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 },
    )
  }
}
