import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'
import { getUserIP, associateProjectWithIP } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const { chatId, projectId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Get user's IP
    const userIP = getUserIP(request)

    // Fork the chat using v0 SDK
    const forkedChat = await v0.chats.fork({
      chatId: chatId,
      ...(projectId && { projectId }), // Include projectId if provided
    })

    // If a project was created/returned, associate it with the user's IP
    if (forkedChat.projectId) {
      await associateProjectWithIP(forkedChat.projectId, userIP)
    }

    return NextResponse.json(forkedChat)
  } catch (error) {
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

      return NextResponse.json(
        { error: `Failed to fork chat: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: 'Failed to fork chat' }, { status: 500 })
  }
}
