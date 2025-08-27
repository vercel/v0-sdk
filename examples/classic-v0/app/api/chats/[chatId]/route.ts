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

    // Get actual chat versions for history (same as /api/chats/[chatId]/versions)
    const versionsResponse = await v0.chats.findVersions({ chatId })
    const history = versionsResponse.data
      .map((version: any, index: number) => ({
        id: version.id,
        prompt: version.messages?.[0]?.content || `Version ${index}`,
        demoUrl: version.demoUrl || 'about:blank',
        timestamp: new Date(version.createdAt || Date.now()),
      }))
      // Sort by timestamp (oldest to newest) to ensure v0, v1, v2... order
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

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
