import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

// Mock the core module
vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.chats.create', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should create a chat with minimal parameters', async () => {
    const mockResponse = {
      id: 'chat-123',
      url: 'https://v0.dev/chat/chat-123',
      text: 'Hello, world!',
      modelConfiguration: {
        modelId: 'v0-1.5-md',
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.create({
      message: 'Hello, world!',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats', 'POST', {
      body: {
        message: 'Hello, world!',
        attachments: undefined,
        system: undefined,
        chatPrivacy: undefined,
        projectId: undefined,
        modelConfiguration: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle different chat privacy options', async () => {
    const privacyOptions = [
      'public',
      'private',
      'team-edit',
      'team',
      'unlisted',
    ] as const

    for (const privacy of privacyOptions) {
      mockFetcher.mockResolvedValue({
        chatId: 'test',
        url: 'test',
        text: 'test',
        modelConfiguration: { modelId: 'v0-1.5-md' },
      })

      await v0.chats.create({
        message: 'Test message',
        chatPrivacy: privacy,
      })

      expect(mockFetcher).toHaveBeenCalledWith('/chats', 'POST', {
        body: expect.objectContaining({
          chatPrivacy: privacy,
        }),
      })
    }
  })

  it('should handle different model configurations', async () => {
    const modelIds = ['v0-1.5-sm', 'v0-1.5-md', 'v0-1.5-lg'] as const

    for (const modelId of modelIds) {
      mockFetcher.mockResolvedValue({
        chatId: 'test',
        url: 'test',
        text: 'test',
        modelConfiguration: { modelId },
      })

      await v0.chats.create({
        message: 'Test message',
        modelConfiguration: { modelId },
      })

      expect(mockFetcher).toHaveBeenCalledWith('/chats', 'POST', {
        body: expect.objectContaining({
          modelConfiguration: { modelId },
        }),
      })
    }
  })

  it('should handle multiple attachments', async () => {
    const attachments = [
      { url: 'https://example.com/image1.png' },
      { url: 'https://example.com/image2.jpg' },
      { url: 'https://example.com/document.pdf' },
    ]

    mockFetcher.mockResolvedValue({
      chatId: 'test',
      url: 'test',
      text: 'test',
      modelConfiguration: { modelId: 'v0-1.5-md' },
    })

    await v0.chats.create({
      message: 'Analyze these files',
      attachments,
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats', 'POST', {
      body: expect.objectContaining({
        attachments,
      }),
    })
  })

  it('should handle API errors', async () => {
    const error = new Error('API Error')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.chats.create({
        message: 'Test message',
      }),
    ).rejects.toThrow('API Error')
  })
})
