import { NextRequest, NextResponse } from 'next/server'
import { createClient, ChatDetail } from 'v0-sdk'

// Create v0 client with custom baseUrl if V0_API_URL is set
const v0 = createClient(
  process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {},
)

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, streaming, attachments } = await request.json()

    // Debug logging
    console.log('API request:', { message, chatId, streaming })
    console.log('Using baseUrl:', process.env.V0_API_URL || 'default')

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      )
    }

    let chat

    if (chatId) {
      // continue existing chat
      if (streaming) {
        // Return streaming response for existing chat
        console.log('Sending streaming message to existing chat:', {
          chatId,
          message,
          responseMode: 'experimental_stream',
        })
        chat = await v0.chats.sendMessage({
          chatId: chatId,
          message,
          responseMode: 'experimental_stream',
          ...(attachments && attachments.length > 0 && { attachments }),
        })
        console.log('Streaming message sent to existing chat successfully')

        // Return the stream directly
        return new Response(chat as ReadableStream<Uint8Array>, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      } else {
        // Non-streaming response for existing chat
        chat = await v0.chats.sendMessage({
          chatId: chatId,
          message,
          ...(attachments && attachments.length > 0 && { attachments }),
        })
      }
    } else {
      // create new chat
      if (streaming) {
        // Return streaming response
        console.log('Creating streaming chat with params:', {
          message,
          responseMode: 'experimental_stream',
        })
        chat = await v0.chats.create({
          message,
          responseMode: 'experimental_stream',
          ...(attachments && attachments.length > 0 && { attachments }),
        })
        console.log('Streaming chat created successfully')

        // Return the stream directly
        return new Response(chat as ReadableStream<Uint8Array>, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      } else {
        // Use sync mode
        console.log('Creating sync chat with params:', {
          message,
          responseMode: 'sync',
        })
        chat = await v0.chats.create({
          message,
          responseMode: 'sync',
          ...(attachments && attachments.length > 0 && { attachments }),
        })
        console.log('Sync chat created successfully')
      }
    }

    // Type guard to ensure we have a ChatDetail and not a stream
    if (chat instanceof ReadableStream) {
      throw new Error('Unexpected streaming response')
    }

    const chatDetail = chat as ChatDetail

    return NextResponse.json({
      id: chatDetail.id,
      demo: chatDetail.demo,
      messages: chatDetail.messages?.map((msg) => ({
        ...msg,
        experimental_content: (msg as any).experimental_content,
      })),
    })
  } catch (error) {
    console.error('V0 API Error:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
