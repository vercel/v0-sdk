import { NextResponse } from 'next/server'
import { getV0Client, unwrapV0Response } from '@/lib/v0'

export async function GET() {
  try {
    const v0 = getV0Client()
    const response = await v0.chats.list({
      query: {
        limit: 1,
      },
    })

    unwrapV0Response(response)

    return NextResponse.json({
      valid: true,
      message: 'API key is configured correctly',
    })
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      // Check if it's an API key related error
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
          {
            valid: false,
            error: 'API_KEY_MISSING',
            message: error.message,
          },
          { status: 401 },
        )
      }

      // Other errors (network, etc.)
      return NextResponse.json(
        {
          valid: false,
          error: 'VALIDATION_ERROR',
          message: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        valid: false,
        error: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred during validation',
      },
      { status: 500 },
    )
  }
}
