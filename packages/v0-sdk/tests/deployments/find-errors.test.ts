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

describe('v0.deployments.findErrors', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should find errors for a deployment', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'error-123',
          object: 'error',
          message: 'Build failed: Module not found',
          timestamp: '2023-01-01T00:00:00Z',
          level: 'error',
          source: 'build',
        },
        {
          id: 'error-456',
          object: 'error',
          message: 'Warning: Deprecated API usage',
          timestamp: '2023-01-01T00:01:00Z',
          level: 'warning',
          source: 'runtime',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.deployments.findErrors({
      deploymentId: 'deployment-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/deployments/deployment-123/errors',
      'GET',
      {
        pathParams: { deploymentId: 'deployment-123' },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle empty errors list', async () => {
    const mockResponse = {
      object: 'list',
      data: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.deployments.findErrors({
      deploymentId: 'deployment-456',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/deployments/deployment-456/errors',
      'GET',
      {
        pathParams: { deploymentId: 'deployment-456' },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle different deployment IDs', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'error-789',
          object: 'error',
          message: 'Critical error: Database connection failed',
          timestamp: '2023-01-02T12:00:00Z',
          level: 'critical',
          source: 'database',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.deployments.findErrors({
      deploymentId: 'deploy-abc-def',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/deployments/deploy-abc-def/errors',
      'GET',
      {
        pathParams: { deploymentId: 'deploy-abc-def' },
      },
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle multiple error types and levels', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'error-001',
          object: 'error',
          message: 'Syntax error in component',
          timestamp: '2023-01-03T09:00:00Z',
          level: 'error',
          source: 'compile',
          file: 'src/components/Button.tsx',
          line: 42,
        },
        {
          id: 'error-002',
          object: 'error',
          message: 'Network timeout during deployment',
          timestamp: '2023-01-03T09:01:00Z',
          level: 'warning',
          source: 'network',
        },
        {
          id: 'error-003',
          object: 'error',
          message: 'Memory usage exceeds threshold',
          timestamp: '2023-01-03T09:02:00Z',
          level: 'info',
          source: 'runtime',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.deployments.findErrors({
      deploymentId: 'deployment-complex',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/deployments/deployment-complex/errors',
      'GET',
      {
        pathParams: { deploymentId: 'deployment-complex' },
      },
    )

    expect(result).toEqual(mockResponse)
  })
})
