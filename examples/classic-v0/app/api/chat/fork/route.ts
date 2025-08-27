import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'

export async function POST(request: NextRequest) {
  try {
    const { chatId, projectId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Fork the chat using v0.chats.fork()
    const forkedChat = await v0.chats.fork({
      chatId,
      ...(projectId && { projectId }), // Only include projectId if provided
    })

    return NextResponse.json({
      id: forkedChat.id,
      demo: forkedChat.demo,
      originalChatId: chatId,
      projectId: projectId,
      messages: forkedChat.messages?.map((msg) => ({
        ...msg,
        experimental_content: (msg as any).experimental_content,
      })),
    })
  } catch (error) {
    console.error('V0 Chat Fork API Error:', error)
    return NextResponse.json({ error: 'Failed to fork chat' }, { status: 500 })
  }
}
