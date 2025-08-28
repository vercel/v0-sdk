import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

// Mock the core module
vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(() => vi.fn()),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.chats.getById', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get chat by ID with messages', async () => {
    const mockResponse = {
      chatId: 'chat-123',
      url: 'https://v0.dev/chat/chat-123',
      messages: [
        {
          messageId: 'msg-1',
          content: 'Hello, world!',
          createdAt: '2024-01-01T00:00:00Z',
          type: 'message' as const,
        },
        {
          messageId: 'msg-2',
          content: 'Here is a React component',
          createdAt: '2024-01-01T00:01:00Z',
          type: 'refinement' as const,
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.getById({ chatId: 'chat-123' })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/chat-123', 'GET', {
      pathParams: { chatId: 'chat-123' },
    })
    expect(result).toEqual(mockResponse)
  })

  it('should handle different message types', async () => {
    const messageTypes = [
      'message',
      'refinement',
      'forked-block',
      'forked-chat',
      'open-in-v0',
      'added-environment-variables',
      'added-integration',
      'deleted-file',
      'moved-file',
      'renamed-file',
      'edited-file',
      'replace-src',
      'reverted-block',
      'fix-with-v0',
      'sync-git',
    ] as const

    const mockResponse = {
      chatId: 'chat-123',
      url: 'https://v0.dev/chat/chat-123',
      messages: messageTypes.map((type, index) => ({
        messageId: `msg-${index}`,
        content: `Message of type ${type}`,
        createdAt: '2024-01-01T00:00:00Z',
        type,
      })),
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.getById({ chatId: 'chat-123' })

    expect(result.messages).toHaveLength(messageTypes.length)
    result.messages.forEach((message, index) => {
      expect(message.type).toBe(messageTypes[index])
    })
  })

  it('should handle empty messages array', async () => {
    const mockResponse = {
      chatId: 'chat-123',
      url: 'https://v0.dev/chat/chat-123',
      messages: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.getById({ chatId: 'chat-123' })

    expect(result.messages).toHaveLength(0)
  })

  it('should handle API errors', async () => {
    const error = new Error('Chat not found')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.chats.getById({ chatId: 'nonexistent-chat' }),
    ).rejects.toThrow('Chat not found')
  })
})
