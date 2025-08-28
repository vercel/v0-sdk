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

describe('v0.chats.getMessage', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get a specific message from a chat', async () => {
    const mockResponse = {
      id: 'message-123',
      object: 'message',
      content: 'Hello, world!',
      role: 'user',
      createdAt: '2023-01-01T00:00:00Z',
      chatId: 'chat-123',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.getMessage({
      chatId: 'chat-123',
      messageId: 'message-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/messages/message-123',
      'GET',
      {
        pathParams: {
          chatId: 'chat-123',
          messageId: 'message-123',
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle different chat and message IDs', async () => {
    const mockResponse = {
      id: 'msg-456',
      object: 'message',
      content: 'Different message',
      role: 'assistant',
      createdAt: '2023-01-02T12:00:00Z',
      chatId: 'chat-456',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.getMessage({
      chatId: 'chat-456',
      messageId: 'msg-456',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-456/messages/msg-456',
      'GET',
      {
        pathParams: {
          chatId: 'chat-456',
          messageId: 'msg-456',
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })
})
