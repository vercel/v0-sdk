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

describe('v0.deployments.findLogs', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should find deployment logs', async () => {
    const mockResponse = {
      logs: [
        '2024-01-01T00:00:00Z [INFO] Starting deployment',
        '2024-01-01T00:00:01Z [INFO] Building application',
        '2024-01-01T00:00:05Z [INFO] Deployment successful',
      ],
      nextSince: 1704067205,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.deployments.findLogs({
      deploymentId: 'deployment-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/deployments/deployment-123/logs',
      'GET',
      {
        pathParams: { deploymentId: 'deployment-123' },
      },
    )
    expect(result).toEqual(mockResponse)
    expect(result.logs).toHaveLength(3)
    expect(result.nextSince).toBe(1704067205)
  })

  it('should handle empty logs', async () => {
    const mockResponse = {
      logs: [],
      nextSince: 1704067200,
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.deployments.findLogs({
      deploymentId: 'deployment-empty',
    })

    expect(result.logs).toHaveLength(0)
    expect(result.nextSince).toBe(1704067200)
  })

  it('should handle error response', async () => {
    const mockResponse = {
      error: 'Deployment not found',
      logs: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.deployments.findLogs({
      deploymentId: 'nonexistent-deployment',
    })

    expect(result.error).toBe('Deployment not found')
    expect(result.logs).toHaveLength(0)
  })

  it('should handle API errors', async () => {
    const error = new Error('Network error')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.deployments.findLogs({ deploymentId: 'deployment-123' }),
    ).rejects.toThrow('Network error')
  })
})
