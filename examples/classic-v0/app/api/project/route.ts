import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 },
      )
    }

    // Create a new project
    const project = await v0.projects.create({
      name,
      description: description || `Project for: ${name}`,
    })

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
    })
  } catch (error) {
    console.error('V0 Project API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 },
    )
  }
}
