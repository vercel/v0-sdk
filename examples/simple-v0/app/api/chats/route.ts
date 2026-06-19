import { NextResponse } from 'next/server'
import { getV0Client, listChats } from '@/lib/v0'

export async function GET() {
  try {
    const v0 = getV0Client()
    const chats = await listChats(v0)

    return NextResponse.json({ chats })
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

      return NextResponse.json(
        { error: `Failed to fetch chats: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}
