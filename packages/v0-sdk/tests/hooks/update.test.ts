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

describe('v0.hooks.update', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should update a hook with all fields', async () => {
    const mockResponse = {
      id: 'hook-123',
      object: 'hook',
      name: 'Updated Hook Name',
      url: 'https://updated.example.com/webhook',
      events: ['deployment.created', 'deployment.failed'],
      chatId: 'chat-123',
      projectId: 'project-123',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T02:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.update({
      hookId: 'hook-123',
      name: 'Updated Hook Name',
      url: 'https://updated.example.com/webhook',
      events: ['deployment.created', 'deployment.failed'],
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-123', 'PATCH', {
      pathParams: { hookId: 'hook-123' },
      body: {
        name: 'Updated Hook Name',
        events: ['deployment.created', 'deployment.failed'],
        url: 'https://updated.example.com/webhook',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a hook with only name', async () => {
    const mockResponse = {
      id: 'hook-456',
      object: 'hook',
      name: 'New Name Only',
      url: 'https://example.com/webhook',
      events: ['chat.message.created'],
      chatId: 'chat-456',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T01:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.update({
      hookId: 'hook-456',
      name: 'New Name Only',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-456', 'PATCH', {
      pathParams: { hookId: 'hook-456' },
      body: {
        name: 'New Name Only',
        events: undefined,
        url: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a hook with only URL', async () => {
    const mockResponse = {
      id: 'hook-789',
      object: 'hook',
      name: 'Project Hook',
      url: 'https://new-endpoint.example.com/webhook',
      events: ['project.created', 'project.updated'],
      projectId: 'project-789',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T01:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.update({
      hookId: 'hook-789',
      url: 'https://new-endpoint.example.com/webhook',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-789', 'PATCH', {
      pathParams: { hookId: 'hook-789' },
      body: {
        name: undefined,
        events: undefined,
        url: 'https://new-endpoint.example.com/webhook',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a hook with only events', async () => {
    const mockResponse = {
      id: 'hook-events',
      object: 'hook',
      name: 'Multi Event Hook',
      url: 'https://api.example.com/webhook',
      events: ['chat.created', 'chat.updated', 'chat.deleted'],
      projectId: 'project-abc',
      createdAt: '2023-01-04T00:00:00Z',
      updatedAt: '2023-01-04T01:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.update({
      hookId: 'hook-events',
      events: ['chat.created', 'chat.updated', 'chat.deleted'],
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-events', 'PATCH', {
      pathParams: { hookId: 'hook-events' },
      body: {
        name: undefined,
        events: ['chat.created', 'chat.updated', 'chat.deleted'],
        url: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a hook with name and events', async () => {
    const mockResponse = {
      id: 'hook-partial',
      object: 'hook',
      name: 'Deployment Monitor',
      url: 'https://api.example.com/deploy-webhook',
      events: [
        'deployment.started',
        'deployment.completed',
        'deployment.failed',
      ],
      projectId: 'project-def',
      createdAt: '2023-01-05T00:00:00Z',
      updatedAt: '2023-01-05T01:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.update({
      hookId: 'hook-partial',
      name: 'Deployment Monitor',
      events: [
        'deployment.started',
        'deployment.completed',
        'deployment.failed',
      ],
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-partial', 'PATCH', {
      pathParams: { hookId: 'hook-partial' },
      body: {
        name: 'Deployment Monitor',
        events: [
          'deployment.started',
          'deployment.completed',
          'deployment.failed',
        ],
        url: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a hook with single event', async () => {
    const mockResponse = {
      id: 'hook-single',
      object: 'hook',
      name: 'Error Monitor',
      url: 'https://api.example.com/error-webhook',
      events: ['deployment.failed'],
      projectId: 'project-single',
      createdAt: '2023-01-06T00:00:00Z',
      updatedAt: '2023-01-06T01:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.update({
      hookId: 'hook-single',
      events: ['deployment.failed'],
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-single', 'PATCH', {
      pathParams: { hookId: 'hook-single' },
      body: {
        name: undefined,
        events: ['deployment.failed'],
        url: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })
})
