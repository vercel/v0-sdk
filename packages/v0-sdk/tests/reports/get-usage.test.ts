import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.reports.getUsage', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should fetch usage with no filters', async () => {
    const mockResponse = {
      object: 'list',
      data: [],
      pagination: { hasMore: false },
      meta: { totalCount: 0 },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.reports.getUsage()

    expect(mockFetcher).toHaveBeenCalledWith('/reports/usage', 'GET', {})
    expect(result).toEqual(mockResponse)
  })

  it('should pass date range filters as query params', async () => {
    mockFetcher.mockResolvedValue({
      object: 'list',
      data: [],
      pagination: { hasMore: false },
      meta: { totalCount: 0 },
    })

    await v0.reports.getUsage({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/reports/usage', 'GET', {
      query: { startDate: '2024-01-01', endDate: '2024-01-31' },
    })
  })

  it('should pass chatId and messageId filters', async () => {
    mockFetcher.mockResolvedValue({
      object: 'list',
      data: [],
      pagination: { hasMore: false },
      meta: { totalCount: 0 },
    })

    await v0.reports.getUsage({ chatId: 'chat-abc', messageId: 'msg-xyz' })

    expect(mockFetcher).toHaveBeenCalledWith('/reports/usage', 'GET', {
      query: { chatId: 'chat-abc', messageId: 'msg-xyz' },
    })
  })

  it('should convert numeric limit to string in query params', async () => {
    mockFetcher.mockResolvedValue({
      object: 'list',
      data: [],
      pagination: { hasMore: false },
      meta: { totalCount: 0 },
    })

    await v0.reports.getUsage({ limit: 50 })

    expect(mockFetcher).toHaveBeenCalledWith('/reports/usage', 'GET', {
      query: { limit: '50' },
    })
  })

  it('should handle paginated results', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'event-1',
          object: 'usage_event',
          type: 'message',
          totalCost: '0.05',
          createdAt: '2024-01-15T10:00:00Z',
        },
      ],
      pagination: { hasMore: true, nextCursor: 'cursor-abc' },
      meta: { totalCount: 100 },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.reports.getUsage({ cursor: 'cursor-abc' })

    expect(mockFetcher).toHaveBeenCalledWith('/reports/usage', 'GET', {
      query: { cursor: 'cursor-abc' },
    })
    expect(result.pagination.hasMore).toBe(true)
  })

  it('should handle API errors', async () => {
    mockFetcher.mockRejectedValue(new Error('HTTP 403: Forbidden'))

    await expect(v0.reports.getUsage()).rejects.toThrow('HTTP 403: Forbidden')
  })
})