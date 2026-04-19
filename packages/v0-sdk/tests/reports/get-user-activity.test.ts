import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.reports.getUserActivity', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should fetch user activity with no filters', async () => {
    const mockResponse = {
      object: 'list',
      data: [],
      meta: {
        totalCount: 0,
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.reports.getUserActivity()

    expect(mockFetcher).toHaveBeenCalledWith(
      '/reports/user-activity',
      'GET',
      {},
    )
    expect(result).toEqual(mockResponse)
  })

  it('should pass date range query params', async () => {
    mockFetcher.mockResolvedValue({
      object: 'list',
      data: [],
      meta: { totalCount: 0, dateRange: {} },
    })

    await v0.reports.getUserActivity({
      startDate: '2024-03-01',
      endDate: '2024-03-31',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/reports/user-activity',
      'GET',
      { query: { startDate: '2024-03-01', endDate: '2024-03-31' } },
    )
  })

  it('should return user activity data with correct shape', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'activity-1',
          object: 'user_activity',
          user: {
            id: 'user-abc',
            object: 'user',
            email: 'dev@example.com',
            avatar: 'https://example.com/avatar.png',
            createdAt: '2024-01-01T00:00:00Z',
            teamV0Role: 'V0Builder',
          },
          chatCount: 42,
          messageCount: 300,
          activeDays: 20,
          firstActivity: '2024-03-01T00:00:00Z',
          lastActivity: '2024-03-31T00:00:00Z',
        },
      ],
      meta: {
        totalCount: 1,
        dateRange: { start: '2024-03-01', end: '2024-03-31' },
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.reports.getUserActivity()

    expect(result.data[0].chatCount).toBe(42)
    expect(result.data[0].user.email).toBe('dev@example.com')
    expect(result.meta.totalCount).toBe(1)
  })

  it('should handle API errors', async () => {
    mockFetcher.mockRejectedValue(new Error('HTTP 403: Forbidden'))

    await expect(v0.reports.getUserActivity()).rejects.toThrow(
      'HTTP 403: Forbidden',
    )
  })
})