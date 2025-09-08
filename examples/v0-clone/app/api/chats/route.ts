import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { auth } from '@/app/(auth)/auth'
import { getChatIdsByUserId } from '@/lib/db/queries'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Anonymous users don't have saved chats
    if (!session?.user?.id) {
      return NextResponse.json({ data: [] })
    }

    console.log('Fetching chats for user:', session.user.id)

    // Get user's chat IDs from our ownership mapping
    const userChatIds = await getChatIdsByUserId({ userId: session.user.id })

    if (userChatIds.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Fetch actual chat data from v0 API
    const allChats = await v0.chats.find()

    // Filter to only include chats owned by this user
    const userChats =
      allChats.data?.filter((chat) => userChatIds.includes(chat.id)) || []

    console.log('Chats fetched successfully:', userChats.length, 'chats')

    return NextResponse.json({ data: userChats })
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
