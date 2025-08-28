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

describe('v0.chats.getVersion', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get a specific version from a chat', async () => {
    const mockResponse = {
      id: 'version-123',
      object: 'version',
      status: 'completed',
      demoUrl: 'https://v0.dev/demo/version-123',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T01:00:00Z',
      files: [
        {
          object: 'file',
          name: 'App.tsx',
          content: 'export default function App() { return <div>Hello</div>; }',
          locked: false,
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.getVersion({
      chatId: 'chat-123',
      versionId: 'version-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/versions/version-123',
      'GET',
      {
        pathParams: {
          chatId: 'chat-123',
          versionId: 'version-123',
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle different chat and version IDs', async () => {
    const mockResponse = {
      id: 'ver-456',
      object: 'version',
      status: 'pending',
      createdAt: '2023-01-02T12:00:00Z',
      files: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.getVersion({
      chatId: 'chat-456',
      versionId: 'ver-456',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-456/versions/ver-456',
      'GET',
      {
        pathParams: {
          chatId: 'chat-456',
          versionId: 'ver-456',
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle failed version status', async () => {
    const mockResponse = {
      id: 'version-789',
      object: 'version',
      status: 'failed',
      createdAt: '2023-01-03T08:00:00Z',
      files: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.getVersion({
      chatId: 'chat-789',
      versionId: 'version-789',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-789/versions/version-789',
      'GET',
      {
        pathParams: {
          chatId: 'chat-789',
          versionId: 'version-789',
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })
})
