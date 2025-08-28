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

describe('v0.chats.favorite', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should favorite a chat successfully', async () => {
    const mockResponse = { id: 'chat-123', object: 'chat', favorited: true }
    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.favorite({
      chatId: 'chat-123',
      isFavorite: true,
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/favorite',
      'PUT',
      {
        pathParams: { chatId: 'chat-123' },
        body: { isFavorite: true },
      },
    )

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/favorite',
      'PUT',
      {
        pathParams: { chatId: 'chat-123' },
        body: { isFavorite: true },
      },
    )
    expect(result).toEqual(mockResponse)
  })

  it('should unfavorite a chat successfully', async () => {
    const mockResponse = { id: 'chat-123', object: 'chat', favorited: false }
    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.favorite({
      chatId: 'chat-123',
      isFavorite: false,
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/favorite',
      'PUT',
      {
        pathParams: { chatId: 'chat-123' },
        body: { isFavorite: false },
      },
    )
    expect(result).toEqual(mockResponse)
  })

  it('should handle error response', async () => {
    const mockResponse = {
      error: { message: 'Chat not found', type: 'not_found_error' },
    }
    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.favorite({
      chatId: 'nonexistent-chat',
      isFavorite: true,
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle API errors', async () => {
    const error = new Error('Network error')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.chats.favorite({ chatId: 'chat-123', isFavorite: true }),
    ).rejects.toThrow('Network error')
  })
})
