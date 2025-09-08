import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'
import { auth } from '@/app/(auth)/auth'
import { getChatOwnership } from '@/lib/db/queries'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await auth()
    const { chatId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Check if user owns this chat
    const ownership = await getChatOwnership({ v0ChatId: chatId })
    if (!ownership || ownership.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 },
      )
    }

    const { privacy } = await request.json()

    if (
      !privacy ||
      !['public', 'private', 'team', 'team-edit', 'unlisted'].includes(privacy)
    ) {
      return NextResponse.json(
        { error: 'Invalid privacy setting' },
        { status: 400 },
      )
    }

    console.log('Changing chat visibility:', chatId, 'to:', privacy)

    // Update chat privacy via v0 API
    const updatedChat = await v0.chats.update({
      chatId,
      privacy,
    })

    console.log('Chat visibility changed successfully:', chatId)

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error('Change Chat Visibility Error:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to change chat visibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
