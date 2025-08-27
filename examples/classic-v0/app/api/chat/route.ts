import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, projectId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      )
    }

    let chat

    if (chatId) {
      // continue existing chat
      chat = await v0.chats.sendMessage({
        chatId: chatId,
        message,
      })
    } else {
      // create new chat
      const chatOptions: any = {
        message: message,
        modelConfiguration: {
          modelId: 'v0-1.5-md',
        },
      }

      // Add projectId if provided
      if (projectId) {
        chatOptions.projectId = projectId
      }

      chat = await v0.chats.create(chatOptions)
    }

    return NextResponse.json({
      id: chat.id,
      demo: chat.demo,
      messages: chat.messages?.map((msg) => ({
        ...msg,
        experimental_content: (msg as any).experimental_content,
      })),
    })
  } catch (error) {
    console.error('V0 API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    )
  }
}
