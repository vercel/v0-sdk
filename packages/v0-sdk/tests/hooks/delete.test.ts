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

describe('v0.hooks.delete', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should delete a hook successfully', async () => {
    const mockResponse = {
      id: 'hook-123',
      object: 'hook',
      deleted: true,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.delete({
      hookId: 'hook-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-123', 'DELETE', {
      pathParams: { hookId: 'hook-123' },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle different hook IDs', async () => {
    const mockResponse = {
      id: 'hook-456',
      object: 'hook',
      deleted: true,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.delete({
      hookId: 'hook-456',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-456', 'DELETE', {
      pathParams: { hookId: 'hook-456' },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle deletion of project hook', async () => {
    const mockResponse = {
      id: 'hook-project-123',
      object: 'hook',
      deleted: true,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.delete({
      hookId: 'hook-project-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/hooks/hook-project-123',
      'DELETE',
      {
        pathParams: { hookId: 'hook-project-123' },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle deletion of chat hook', async () => {
    const mockResponse = {
      id: 'hook-chat-789',
      object: 'hook',
      deleted: true,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.delete({
      hookId: 'hook-chat-789',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/hooks/hook-chat-789', 'DELETE', {
      pathParams: { hookId: 'hook-chat-789' },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle deletion with complex hook ID', async () => {
    const mockResponse = {
      id: 'hook-abc-def-123-456',
      object: 'hook',
      deleted: true,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.hooks.delete({
      hookId: 'hook-abc-def-123-456',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/hooks/hook-abc-def-123-456',
      'DELETE',
      {
        pathParams: { hookId: 'hook-abc-def-123-456' },
      },
    )

    expect(result).toEqual(mockResponse)
  })
})
