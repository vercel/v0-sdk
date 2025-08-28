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

describe('v0.chats.updateVersion', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should update a version with new files', async () => {
    const mockResponse = {
      id: 'version-123',
      object: 'version',
      status: 'completed',
      demoUrl: 'https://v0.dev/demo/version-123',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T02:00:00Z',
      files: [
        {
          object: 'file',
          name: 'App.tsx',
          content:
            'export default function App() { return <div>Updated Hello</div>; }',
          locked: false,
        },
        {
          object: 'file',
          name: 'styles.css',
          content: '.container { padding: 20px; }',
          locked: false,
        },
      ],
    }

    const updateFiles = [
      {
        name: 'App.tsx',
        content:
          'export default function App() { return <div>Updated Hello</div>; }',
      },
      {
        name: 'styles.css',
        content: '.container { padding: 20px; }',
      },
    ]

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.updateVersion({
      chatId: 'chat-123',
      versionId: 'version-123',
      files: updateFiles,
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/versions/version-123',
      'PATCH',
      {
        pathParams: {
          chatId: 'chat-123',
          versionId: 'version-123',
        },
        body: {
          files: updateFiles,
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should update a version with single file', async () => {
    const mockResponse = {
      id: 'version-456',
      object: 'version',
      status: 'completed',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T01:00:00Z',
      files: [
        {
          object: 'file',
          name: 'Component.tsx',
          content: 'export const Component = () => <span>Updated</span>;',
          locked: false,
        },
      ],
    }

    const updateFiles = [
      {
        name: 'Component.tsx',
        content: 'export const Component = () => <span>Updated</span>;',
      },
    ]

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.updateVersion({
      chatId: 'chat-456',
      versionId: 'version-456',
      files: updateFiles,
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-456/versions/version-456',
      'PATCH',
      {
        pathParams: {
          chatId: 'chat-456',
          versionId: 'version-456',
        },
        body: {
          files: updateFiles,
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle empty files array', async () => {
    const mockResponse = {
      id: 'version-789',
      object: 'version',
      status: 'completed',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T01:00:00Z',
      files: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.updateVersion({
      chatId: 'chat-789',
      versionId: 'version-789',
      files: [],
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-789/versions/version-789',
      'PATCH',
      {
        pathParams: {
          chatId: 'chat-789',
          versionId: 'version-789',
        },
        body: {
          files: [],
        },
      },
    )

    expect(result).toEqual(mockResponse)
  })
})
