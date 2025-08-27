import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 },
      )
    }

    // Get project data from v0
    const project = await v0.projects.getById({ projectId })

    // Check if project has chats property
    let chats = project.chats || []

    // If no chats in project directly, try to find chats and filter by project
    if (chats.length === 0) {
      try {
        const allChats = await v0.chats.find()

        // Filter chats by projectId if the data structure supports it
        // This depends on how v0.chats.find() returns the data
        if (allChats.data) {
          // Try to find chats that belong to this project
          chats = allChats.data.filter(
            (chat: any) =>
              chat.projectId === projectId ||
              (chat.project && chat.project.id === projectId),
          )
        }
      } catch (error) {
        console.error('Error fetching chats:', error)
      }
    }

    // Format the response with generations (chats) - limit to 3 most recent
    let generations = []

    if (chats.length > 0) {
      // Sort chats by creation date (most recent first) and take only first 3
      const sortedChats = chats
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime()
          const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime()
          return dateB - dateA // Most recent first
        })
        .slice(0, 3) // Only take first 3

      // Get full chat details for each chat to get demo URLs
      const chatDetailsPromises = sortedChats.map((chat: any) =>
        v0.chats.getById({ chatId: chat.id || chat.chatId }),
      )

      try {
        const chatDetails = await Promise.all(chatDetailsPromises)
        generations = chatDetails.map((chat, index) => ({
          id: chat.id,
          demoUrl: chat.demo,
          label: String.fromCharCode(65 + index), // A, B, C for the 3 most recent
        }))
      } catch (error) {
        console.error('Error fetching chat details:', error)
        // Fallback to using what we have
        generations = sortedChats.map((chat: any, index: number) => ({
          id: chat.id || chat.chatId,
          demoUrl: chat.demo || 'about:blank',
          label: String.fromCharCode(65 + index),
        }))
      }
    } else {
      // If still no chats found, create mock data for now

      generations = [
        {
          id: 'mock-a',
          demoUrl: 'https://v0.dev/demo/placeholder-a',
          label: 'A',
        },
        {
          id: 'mock-b',
          demoUrl: 'https://v0.dev/demo/placeholder-b',
          label: 'B',
        },
        {
          id: 'mock-c',
          demoUrl: 'https://v0.dev/demo/placeholder-c',
          label: 'C',
        },
      ]
    }

    return NextResponse.json({
      id: project.id,
      name: project.name || 'Untitled Project',
      description: project.description || '',
      generations: generations,
    })
  } catch (error) {
    console.error('V0 Projects API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 },
    )
  }
}
