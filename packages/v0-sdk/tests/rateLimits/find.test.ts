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

describe('v0.rateLimits.find', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should find rate limits with all fields', async () => {
    const mockResponse = {
      remaining: 95,
      reset: 1704067800, // 2024-01-01T00:10:00Z
      limit: 100,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.rateLimits.find()

    expect(mockFetcher).toHaveBeenCalledWith('/rate-limits', 'GET', {})
    expect(result).toEqual(mockResponse)
    expect(result.remaining).toBe(95)
    expect(result.reset).toBe(1704067800)
    expect(result.limit).toBe(100)
  })

  it('should handle rate limits without optional fields', async () => {
    const mockResponse = {
      limit: 1000,
      // remaining and reset are optional
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.rateLimits.find()

    expect(result.limit).toBe(1000)
    expect(result.remaining).toBeUndefined()
    expect(result.reset).toBeUndefined()
  })

  it('should handle rate limits when exhausted', async () => {
    const mockResponse = {
      remaining: 0,
      reset: 1704067800,
      limit: 100,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.rateLimits.find()

    expect(result.remaining).toBe(0)
    expect(result.limit).toBe(100)
  })

  it('should handle different limit values', async () => {
    const limitValues = [10, 100, 1000, 5000]

    for (const limit of limitValues) {
      const mockResponse = {
        remaining: Math.floor(limit * 0.8), // 80% remaining
        reset: 1704067800,
        limit,
      }

      mockFetcher.mockResolvedValue(mockResponse)

      const result = await v0.rateLimits.find()

      expect(result.limit).toBe(limit)
      expect(result.remaining).toBe(Math.floor(limit * 0.8))
    }
  })

  it('should handle API errors', async () => {
    const error = new Error('Rate limit information unavailable')
    mockFetcher.mockRejectedValue(error)

    await expect(v0.rateLimits.find()).rejects.toThrow(
      'Rate limit information unavailable',
    )
  })
})
