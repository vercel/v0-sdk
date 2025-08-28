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

describe('v0.chats.sendMessage', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should create a message with minimal parameters', async () => {
    const mockResponse = {
      chatId: 'chat-123',
      url: 'https://v0.dev/chat/chat-123',
      text: 'Response to your message',
      modelConfiguration: {
        modelId: 'v0-1.5-md',
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.sendMessage({
      chatId: 'chat-123',
      message: 'Follow up message',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/messages',
      'POST',
      {
        pathParams: { chatId: 'chat-123' },
        body: {
          message: 'Follow up message',
          attachments: undefined,
          modelConfiguration: undefined,
        },
      },
    )
    expect(result).toEqual(mockResponse)
  })

  it('should create a message with all parameters', async () => {
    const mockResponse = {
      chatId: 'chat-456',
      url: 'https://v0.dev/chat/chat-456',
      files: [
        {
          lang: 'tsx',
          meta: { component: 'Button' },
          source: 'export const Button = () => <button>Click me</button>',
        },
      ],
      demo: 'https://demo.v0.dev/demo-123',
      text: 'Here is your updated component',
      modelConfiguration: {
        modelId: 'v0-1.5-lg',
        imageGenerations: true,
        thinking: true,
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.sendMessage({
      chatId: 'chat-456',
      message: 'Update the button component',
      attachments: [{ url: 'https://example.com/design.png' }],
      modelConfiguration: {
        modelId: 'v0-1.5-lg',
        imageGenerations: true,
        thinking: true,
      },
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-456/messages',
      'POST',
      {
        pathParams: { chatId: 'chat-456' },
        body: {
          message: 'Update the button component',
          attachments: [{ url: 'https://example.com/design.png' }],
          modelConfiguration: {
            modelId: 'v0-1.5-lg',
            imageGenerations: true,
            thinking: true,
          },
        },
      },
    )
    expect(result).toEqual(mockResponse)
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

      await v0.chats.sendMessage({
        chatId: 'chat-test',
        message: 'Test message',
        modelConfiguration: { modelId },
      })

      expect(mockFetcher).toHaveBeenCalledWith(
        '/chats/chat-test/messages',
        'POST',
        {
          pathParams: { chatId: 'chat-test' },
          body: expect.objectContaining({
            modelConfiguration: { modelId },
          }),
        },
      )
    }
  })

  it('should handle API errors', async () => {
    const error = new Error('Message creation failed')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.chats.sendMessage({
        chatId: 'chat-123',
        message: 'Test message',
      }),
    ).rejects.toThrow('Message creation failed')
  })
})
