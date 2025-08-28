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

describe('v0.chats.find', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should fetch chats with favorites and history', async () => {
    const mockResponse = {
      favorites: [
        {
          chatId: 'fav-chat-1',
          shareable: true,
          privacy: 'public',
          title: 'My Favorite Chat',
          updatedAt: '2024-01-01T00:00:00Z',
          favorite: true,
          authorId: 'user-123',
        },
      ],
      history: [
        {
          chatId: 'hist-chat-1',
          shareable: false,
          privacy: 'private',
          title: 'Recent Chat',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.find()

    expect(mockFetcher).toHaveBeenCalledWith('/chats', 'GET', {})
    expect(result).toEqual(mockResponse)
  })

  it('should handle empty response', async () => {
    const mockResponse = {
      data: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.find()

    expect(result.data).toHaveLength(0)
  })

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch chats')
    mockFetcher.mockRejectedValue(error)

    await expect(v0.chats.find()).rejects.toThrow('Failed to fetch chats')
  })
})
