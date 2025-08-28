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

describe('v0.hooks.getById', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get a specific hook by ID', async () => {
    const mockResponse = {
      id: 'hook-123',
      object: 'hook',
      name: 'Deployment Hook',
      url: 'https://example.com/webhook',
      events: ['deployment.created', 'deployment.completed'],
      chatId: 'chat-123',
      projectId: 'project-123',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T01:00:00Z',
      lastTriggered: '2023-01-01T02:00:00Z',
      status: 'active',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.getById({
      hookId: 'hook-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-123', 'GET', {
      pathParams: { hookId: 'hook-123' },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle different hook IDs', async () => {
    const mockResponse = {
      id: 'hook-456',
      object: 'hook',
      name: 'Chat Message Hook',
      url: 'https://api.example.com/chat-webhook',
      events: ['chat.message.created', 'chat.message.updated'],
      chatId: 'chat-456',
      createdAt: '2023-01-02T00:00:00Z',
      status: 'active',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.getById({
      hookId: 'hook-456',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-456', 'GET', {
      pathParams: { hookId: 'hook-456' },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle hook with project only', async () => {
    const mockResponse = {
      id: 'hook-project-only',
      object: 'hook',
      name: 'Project Only Hook',
      url: 'https://api.example.com/project-webhook',
      events: ['project.created', 'project.deleted'],
      projectId: 'project-789',
      createdAt: '2023-01-03T00:00:00Z',
      status: 'paused',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.getById({
      hookId: 'hook-project-only',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/hooks/hook-project-only',
      'GET',
      {
        pathParams: { hookId: 'hook-project-only' },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle hook with different status', async () => {
    const mockResponse = {
      id: 'hook-inactive',
      object: 'hook',
      name: 'Inactive Hook',
      url: 'https://api.example.com/inactive-webhook',
      events: ['deployment.failed'],
      projectId: 'project-abc',
      createdAt: '2023-01-04T00:00:00Z',
      updatedAt: '2023-01-04T01:00:00Z',
      status: 'inactive',
      errorCount: 5,
      lastError: '2023-01-04T01:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.getById({
      hookId: 'hook-inactive',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-inactive', 'GET', {
      pathParams: { hookId: 'hook-inactive' },
    })

    expect(result).toEqual(mockResponse)
  })
})
