import { NextRequest, NextResponse } from 'next/server'
import { getV0Client, normalizeChat, unwrapV0Response } from '@/lib/v0'

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const v0 = getV0Client()

    const response = await v0.chats.duplicate({
      path: { chatId },
      body: {
        privacy: 'private',
        title: 'Fork',
      },
    })
    const forkedChat = unwrapV0Response(response)

    return NextResponse.json(normalizeChat(forkedChat))
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (
        errorMessage.includes('api key is required') ||
        errorMessage.includes('v0_api_key') ||
        errorMessage.includes('v0_api_key is required') ||
        errorMessage.includes('config.apikey')
      ) {
        return NextResponse.json(
          { error: 'API_KEY_MISSING', message: error.message },
          { status: 401 },
        )
      }

      return NextResponse.json({ error: `Failed to fork chat: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fork chat' }, { status: 500 })
  }
}
