import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching all chats...')
    console.log('Using baseUrl:', process.env.V0_API_URL || 'default')

    // Fetch all chats using v0 SDK
    const chats = await v0.chats.find()

    console.log('Chats fetched successfully:', chats.data?.length || 0, 'chats')

    return NextResponse.json(chats)
  } catch (error) {
    console.error('Chats fetch error:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch chats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
