import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params

    // Get chat versions using v0.chats.findVersions()
    const response = await v0.chats.findVersions({ chatId })

    // Transform the data to match our HistoryItem interface
    const historyItems = response.data.map((version: any, index: number) => ({
      id: version.id,
      prompt: version.messages?.[0]?.content || `Version ${index}`,
      demoUrl: version.demo || 'about:blank',
      timestamp: new Date(version.createdAt || Date.now()),
    }))

    return NextResponse.json(historyItems)
  } catch (error) {
    console.error('Error fetching chat versions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat versions' },
      { status: 500 },
    )
  }
}
