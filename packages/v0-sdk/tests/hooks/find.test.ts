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

describe('v0.hooks.find', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should find all hooks', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'hook-123',
          object: 'hook',
          name: 'Deployment Hook',
          url: 'https://example.com/webhook',
          events: ['deployment.created', 'deployment.updated'],
          chatId: 'chat-123',
          projectId: 'project-123',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T01:00:00Z',
        },
        {
          id: 'hook-456',
          object: 'hook',
          name: 'Chat Hook',
          url: 'https://example.com/chat-webhook',
          events: ['chat.message.created'],
          chatId: 'chat-456',
          createdAt: '2023-01-02T00:00:00Z',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.find()

    expect(mockFetcher).toHaveBeenCalledWith('/hooks', 'GET', {})

    expect(result).toEqual(mockResponse)
  })

  it('should handle empty hooks list', async () => {
    const mockResponse = {
      object: 'list',
      data: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.find()

    expect(mockFetcher).toHaveBeenCalledWith('/hooks', 'GET', {})

    expect(result).toEqual(mockResponse)
  })

  it('should handle hooks with different event types', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'hook-001',
          object: 'hook',
          name: 'Project Hook',
          url: 'https://api.example.com/hooks/project',
          events: ['project.created', 'project.updated', 'project.deleted'],
          projectId: 'project-789',
          createdAt: '2023-01-03T00:00:00Z',
        },
        {
          id: 'hook-002',
          object: 'hook',
          name: 'Multi Event Hook',
          url: 'https://api.example.com/hooks/multi',
          events: [
            'chat.created',
            'chat.message.created',
            'deployment.created',
            'deployment.completed',
          ],
          projectId: 'project-abc',
          createdAt: '2023-01-03T12:00:00Z',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.find()

    expect(mockFetcher).toHaveBeenCalledWith('/hooks', 'GET', {})

    expect(result).toEqual(mockResponse)
  })
})
