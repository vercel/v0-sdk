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

describe('v0.hooks.create', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should create a hook with all parameters', async () => {
    const mockResponse = {
      id: 'hook-123',
      object: 'hook',
      name: 'New Deployment Hook',
      url: 'https://example.com/webhook',
      events: ['chat.created', 'chat.updated'],
      chatId: 'chat-123',
      createdAt: '2023-01-01T00:00:00Z',
    }

    const createParams = {
      name: 'New Deployment Hook',
      url: 'https://example.com/webhook',
      events: ['chat.created', 'chat.updated'],
      chatId: 'chat-123',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.create(createParams)

    expect(mockFetcher).toHaveBeenCalledWith('/hooks', 'POST', {
      body: {
        name: 'New Deployment Hook',
        events: ['chat.created', 'chat.updated'],
        chatId: 'chat-123',
        url: 'https://example.com/webhook',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create a hook with minimal parameters (chat only)', async () => {
    const mockResponse = {
      id: 'hook-456',
      object: 'hook',
      name: 'Chat Hook',
      url: 'https://example.com/chat-webhook',
      events: ['chat.message.created'],
      chatId: 'chat-456',
      createdAt: '2023-01-02T00:00:00Z',
    }

    const createParams = {
      name: 'Chat Hook',
      url: 'https://example.com/chat-webhook',
      events: ['message.created'],
      chatId: 'chat-456',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.create(createParams)

    expect(mockFetcher).toHaveBeenCalledWith('/hooks', 'POST', {
      body: {
        name: 'Chat Hook',
        events: ['message.created'],
        chatId: 'chat-456',
        url: 'https://example.com/chat-webhook',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create a hook without chatId', async () => {
    const mockResponse = {
      id: 'hook-789',
      object: 'hook',
      name: 'General Hook',
      url: 'https://api.example.com/hooks/general',
      events: ['chat.created', 'chat.deleted'],
      createdAt: '2023-01-03T00:00:00Z',
    }

    const createParams = {
      name: 'General Hook',
      url: 'https://api.example.com/hooks/general',
      events: ['chat.created', 'chat.deleted'],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.create(createParams)

    expect(mockFetcher).toHaveBeenCalledWith('/hooks', 'POST', {
      body: {
        name: 'General Hook',
        events: ['chat.created', 'chat.deleted'],
        url: 'https://api.example.com/hooks/general',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create a hook with single event', async () => {
    const mockResponse = {
      id: 'hook-single',
      object: 'hook',
      name: 'Single Event Hook',
      url: 'https://api.example.com/single',
      events: ['message.deleted'],
      createdAt: '2023-01-04T00:00:00Z',
    }

    const createParams = {
      name: 'Single Event Hook',
      url: 'https://api.example.com/single',
      events: ['message.deleted'],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.create(createParams)

    expect(mockFetcher).toHaveBeenCalledWith('/hooks', 'POST', {
      body: {
        name: 'Single Event Hook',
        events: ['message.deleted'],
        url: 'https://api.example.com/single',
      },
    })

    expect(result).toEqual(mockResponse)
  })
})
