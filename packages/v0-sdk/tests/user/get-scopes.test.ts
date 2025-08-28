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

describe('v0.user.getScopes()', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should find scopes', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'scope-1',
          object: 'scope',
          name: 'Personal Scope',
        },
        {
          id: 'scope-2',
          object: 'scope',
          name: 'Team Scope',
        },
        {
          id: 'scope-3',
          object: 'scope',
          // name is optional
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getScopes()

    expect(mockFetcher).toHaveBeenCalledWith('/user/scopes', 'GET', {})
    expect(result).toEqual(mockResponse)
    expect(result.data).toHaveLength(3)
    expect(result.data[0].name).toBe('Personal Scope')
    expect(result.data[2].name).toBeUndefined()
  })

  it('should handle empty scopes list', async () => {
    const mockResponse = {
      object: 'list',
      data: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getScopes()

    expect(result.data).toHaveLength(0)
  })

  it('should handle API errors', async () => {
    const error = new Error('Unauthorized to access scopes')
    mockFetcher.mockRejectedValue(error)

    await expect(v0.user.getScopes()).rejects.toThrow(
      'Unauthorized to access scopes',
    )
  })
})
