import { NextRequest, NextResponse } from 'next/server'
import { getV0Client, normalizeChat, unwrapV0Response } from '@/lib/v0'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const v0 = getV0Client()
    const response = await v0.chats.get({
      path: { chatId },
    })
    const chat = unwrapV0Response(response)

    return NextResponse.json(normalizeChat(chat))
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

      return NextResponse.json({ error: `Failed to get chat: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to get chat' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const v0 = getV0Client()
    const response = await v0.chats.delete({
      path: { chatId },
    })

    unwrapV0Response(response)

    return NextResponse.json({ success: true })
  } catch (error) {
    // Check if it's an API key error
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
    }

    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params
    const { name } = await request.json()

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 },
      )
    }

    const v0 = getV0Client()
    const response = await v0.chats.update({
      path: { chatId },
      body: {
        title: name.trim(),
      },
    })

    return NextResponse.json(normalizeChat(unwrapV0Response(response)))
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
        { error: `Failed to update chat: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 })
  }
}
