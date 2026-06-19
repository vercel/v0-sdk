import { NextRequest, NextResponse } from 'next/server'
import { getV0Client, unwrapV0Response } from '@/lib/v0'

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        {
          error: 'chatId is required',
          details: {
            chatId: !!chatId,
          },
        },
        { status: 400 },
      )
    }

    const v0 = getV0Client()
    const result = await v0.chats.deploy({
      path: { chatId },
    })

    return NextResponse.json(unwrapV0Response(result))
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      // Check for API key related errors
      if (
        errorMessage.includes('api key is required') ||
        errorMessage.includes('v0_api_key') ||
        errorMessage.includes('v0_api_key is required') ||
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

    return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 })
  }
}
