import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

// Mock the core module
vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(() => vi.fn()),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.projects.getByChatId()', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get project for a chat', async () => {
    const mockResponse = {
      id: 'project-123',
      object: 'project',
      name: 'My Project',
      description: 'My Project Description',
      createdAt: '2021-01-01',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.getByChatId({ chatId: 'chat-123' })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/chat-123/project', 'GET', {
      pathParams: { chatId: 'chat-123' },
    })
    expect(result).toEqual(mockResponse)
  })

  it('should handle different project data', async () => {
    const mockResponse = {
      id: 'proj-xyz-789',
      object: 'project',
      name: 'Another Project with Special Characters!',
      description: 'Another Project Description',
      createdAt: '2021-01-01',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.getByChatId({
      chatId: 'chat-with-special-project',
    })

    expect(result.name).toBe('Another Project with Special Characters!')
    expect(result.id).toBe('proj-xyz-789')
  })

  it('should handle API errors', async () => {
    const error = new Error('Chat has no associated project')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.projects.getByChatId({ chatId: 'chat-without-project' }),
    ).rejects.toThrow('Chat has no associated project')
  })
})
