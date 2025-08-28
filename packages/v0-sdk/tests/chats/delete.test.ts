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

describe('v0.chats.delete', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should delete a chat successfully', async () => {
    const mockResponse = { success: true }
    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.delete({ chatId: 'chat-123' })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/chat-123', 'DELETE', {
      pathParams: { chatId: 'chat-123' },
    })
    expect(result).toEqual(mockResponse)
  })

  it('should handle different chat IDs', async () => {
    const chatIds = [
      'chat-abc',
      'chat-xyz-123',
      'very-long-chat-id-with-dashes',
    ]

    for (const chatId of chatIds) {
      mockFetcher.mockResolvedValue({ success: true })

      await v0.chats.delete({ chatId })

      expect(mockFetcher).toHaveBeenCalledWith(`/chats/${chatId}`, 'DELETE', {
        pathParams: { chatId },
      })
    }
  })

  it('should handle API errors', async () => {
    const error = new Error('Chat not found')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.chats.delete({ chatId: 'nonexistent-chat' }),
    ).rejects.toThrow('Chat not found')
  })
})
