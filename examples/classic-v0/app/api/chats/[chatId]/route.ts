import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Get chat data from v0
    const chat = await v0.chats.getById({ chatId })

    // Extract the initial prompt from messages
    const initialMessage = chat.messages?.[0]
    const prompt = initialMessage?.content || 'Unknown prompt'

    // Build history from messages (each message represents an iteration)
    const history =
      chat.messages?.map((message, index) => ({
        id: `msg-${index}`,
        prompt: message.content,
        demoUrl: chat.demo, // Each message might have different demo URLs in real implementation
        timestamp: new Date(message.createdAt || Date.now()),
      })) || []

    return NextResponse.json({
      id: chat.id,
      projectId: chat.projectId,
      prompt: prompt,
      generation: {
        id: chat.id,
        demoUrl: chat.demo,
        label: 'A', // This should be determined by the chat's position in the project
      },
      history: history,
    })
  } catch (error) {
    console.error('V0 Chat API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 })
  }
}
