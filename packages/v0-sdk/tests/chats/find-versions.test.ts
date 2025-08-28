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

describe('v0.chats.findVersions', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should find versions for a chat with minimal parameters', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'version-123',
          object: 'version',
          status: 'completed',
          demoUrl: 'https://v0.dev/demo/version-123',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T01:00:00Z',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.findVersions({
      chatId: 'chat-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/versions',
      'GET',
      {
        pathParams: { chatId: 'chat-123' },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should find versions with pagination parameters', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'version-123',
          object: 'version',
          status: 'pending',
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: 'version-456',
          object: 'version',
          status: 'completed',
          demoUrl: 'https://v0.dev/demo/version-456',
          createdAt: '2023-01-01T01:00:00Z',
          updatedAt: '2023-01-01T02:00:00Z',
        },
      ],
      cursor: 'next-cursor',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.findVersions({
      chatId: 'chat-123',
      limit: '10',
      cursor: 'page-cursor',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/versions',
      'GET',
      {
        pathParams: { chatId: 'chat-123' },
        query: {
          limit: '10',
          cursor: 'page-cursor',
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle only limit parameter', async () => {
    const mockResponse = {
      object: 'list',
      data: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    await v0.chats.findVersions({
      chatId: 'chat-123',
      limit: '5',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/versions',
      'GET',
      {
        pathParams: { chatId: 'chat-123' },
        query: {
          limit: '5',
        },
      },
    )
  })

  it('should handle only cursor parameter', async () => {
    const mockResponse = {
      object: 'list',
      data: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    await v0.chats.findVersions({
      chatId: 'chat-123',
      cursor: 'some-cursor',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/versions',
      'GET',
      {
        pathParams: { chatId: 'chat-123' },
        query: {
          cursor: 'some-cursor',
        },
      },
    )
  })
})
