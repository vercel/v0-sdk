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

describe('v0.user.getPlan', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get user plan information', async () => {
    const mockResponse = {
      plan: 'pro',
      billingCycle: {
        start: 1704067200, // 2024-01-01 00:00:00 UTC
        end: 1706745600, // 2024-02-01 00:00:00 UTC
      },
      balance: {
        remaining: 750,
        total: 1000,
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getPlan()

    expect(mockFetcher).toHaveBeenCalledWith('/user/plan', 'GET', {})
    expect(result).toEqual(mockResponse)
    expect(result.plan).toBe('pro')
    expect(result.balance.remaining).toBe(750)
    expect(result.balance.total).toBe(1000)
  })

  it('should handle different plan types', async () => {
    const planTypes = ['free', 'pro', 'enterprise']

    for (const plan of planTypes) {
      const mockResponse = {
        plan,
        billingCycle: {
          start: 1704067200,
          end: 1706745600,
        },
        balance: {
          remaining: plan === 'free' ? 100 : plan === 'pro' ? 1000 : 5000,
          total: plan === 'free' ? 100 : plan === 'pro' ? 1000 : 5000,
        },
      }

      mockFetcher.mockResolvedValue(mockResponse)

      const result = await v0.user.getPlan()

      expect(result.plan).toBe(plan)
    }
  })

  it('should handle user with no remaining balance', async () => {
    const mockResponse = {
      plan: 'pro',
      billingCycle: {
        start: 1704067200,
        end: 1706745600,
      },
      balance: {
        remaining: 0,
        total: 1000,
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getPlan()

    expect(result.balance.remaining).toBe(0)
    expect(result.balance.total).toBe(1000)
  })

  it('should handle API errors', async () => {
    const error = new Error('Plan information unavailable')
    mockFetcher.mockRejectedValue(error)

    await expect(v0.user.getPlan()).rejects.toThrow(
      'Plan information unavailable',
    )
  })
})
