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

describe('v0.user.getBilling', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get user billing information without parameters', async () => {
    const mockResponse = {
      billingType: 'subscription',
      data: {
        subscription: {
          id: 'sub_123456789',
          status: 'active',
          currentPeriodStart: 1672531200,
          currentPeriodEnd: 1675209600,
          plan: {
            id: 'plan_pro',
            name: 'Pro Plan',
            amount: 2000,
            currency: 'usd',
            interval: 'month',
          },
          usage: {
            current: 1500,
            limit: 10000,
            items: [
              {
                type: 'api_calls',
                current: 1200,
                limit: 8000,
              },
              {
                type: 'storage',
                current: 300,
                limit: 2000,
              },
            ],
          },
        },
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getBilling()

    expect(mockFetcher).toHaveBeenCalledWith('/user/billing', 'GET', {})

    expect(result).toEqual(mockResponse)
  })

  it('should get user billing information with scope parameter', async () => {
    const mockResponse = {
      billingType: 'subscription',
      data: {
        subscription: {
          id: 'sub_team_123',
          status: 'active',
          currentPeriodStart: 1672531200,
          currentPeriodEnd: 1675209600,
          plan: {
            id: 'plan_team',
            name: 'Team Plan',
            amount: 5000,
            currency: 'usd',
            interval: 'month',
          },
          usage: {
            current: 3500,
            limit: 50000,
            items: [
              {
                type: 'api_calls',
                current: 2800,
                limit: 40000,
              },
              {
                type: 'storage',
                current: 700,
                limit: 10000,
              },
            ],
          },
        },
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getBilling({
      scope: 'team',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/user/billing', 'GET', {
      query: {
        scope: 'team',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle legacy billing type', async () => {
    const mockResponse = {
      billingType: 'legacy',
      data: {
        remaining: 500,
        reset: 1675209600,
        limit: 1000,
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getBilling({
      scope: 'personal',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/user/billing', 'GET', {
      query: {
        scope: 'personal',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle different subscription statuses', async () => {
    const mockResponse = {
      billingType: 'subscription',
      data: {
        subscription: {
          id: 'sub_paused_123',
          status: 'paused',
          currentPeriodStart: 1672531200,
          currentPeriodEnd: 1675209600,
          plan: {
            id: 'plan_basic',
            name: 'Basic Plan',
            amount: 1000,
            currency: 'usd',
            interval: 'month',
          },
          usage: {
            current: 750,
            limit: 5000,
            items: [
              {
                type: 'api_calls',
                current: 600,
                limit: 4000,
              },
              {
                type: 'storage',
                current: 150,
                limit: 1000,
              },
            ],
          },
        },
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getBilling()

    expect(mockFetcher).toHaveBeenCalledWith('/user/billing', 'GET', {})

    expect(result).toEqual(mockResponse)
  })

  it('should handle cancelled subscription', async () => {
    const mockResponse = {
      billingType: 'subscription',
      data: {
        subscription: {
          id: 'sub_cancelled_123',
          status: 'cancelled',
          currentPeriodStart: 1672531200,
          currentPeriodEnd: 1675209600,
          cancelledAt: 1674000000,
          plan: {
            id: 'plan_pro',
            name: 'Pro Plan',
            amount: 2000,
            currency: 'usd',
            interval: 'month',
          },
          usage: {
            current: 800,
            limit: 10000,
            items: [
              {
                type: 'api_calls',
                current: 650,
                limit: 8000,
              },
              {
                type: 'storage',
                current: 150,
                limit: 2000,
              },
            ],
          },
        },
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getBilling({
      scope: 'organization',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/user/billing', 'GET', {
      query: {
        scope: 'organization',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle different scope values', async () => {
    const mockResponse = {
      billingType: 'subscription',
      data: {
        subscription: {
          id: 'sub_enterprise_123',
          status: 'active',
          currentPeriodStart: 1672531200,
          currentPeriodEnd: 1675209600,
          plan: {
            id: 'plan_enterprise',
            name: 'Enterprise Plan',
            amount: 10000,
            currency: 'usd',
            interval: 'month',
          },
          usage: {
            current: 15000,
            limit: 100000,
            items: [
              {
                type: 'api_calls',
                current: 12000,
                limit: 80000,
              },
              {
                type: 'storage',
                current: 3000,
                limit: 20000,
              },
            ],
          },
        },
      },
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.getBilling({
      scope: 'enterprise',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/user/billing', 'GET', {
      query: {
        scope: 'enterprise',
      },
    })

    expect(result).toEqual(mockResponse)
  })
})
