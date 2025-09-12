import { v0 } from 'v0-sdk'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use v0.user.get() to verify they are authenticated correctly
    // This is more accurate than projects.find() for authentication verification
    const user = await v0.user.get()

    return NextResponse.json({
      valid: true,
      message: 'API key is configured correctly',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      // Check if it's an API key related error
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
