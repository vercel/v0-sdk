import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../../../src/sdk/v0'
import * as core from '../../../../src/sdk/core'

// Mock the core module
vi.mock('../../../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(() => vi.fn()),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.integrations.vercel.projects.find', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should find Vercel integration projects', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          id: 'vercel-proj-1',
          object: 'vercel_project',
          name: 'My First Vercel Project',
        },
        {
          id: 'vercel-proj-2',
          object: 'vercel_project',
          name: 'Another Vercel Project',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.integrations.vercel.projects.find()

    expect(mockFetcher).toHaveBeenCalledWith(
      '/integrations/vercel/projects',
      'GET',
      {},
    )
    expect(result).toEqual(mockResponse)
    expect(result.data).toHaveLength(2)
  })

  it('should handle empty projects list', async () => {
    const mockResponse = { object: 'list', data: [] }
    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.integrations.vercel.projects.find()

    expect(result.data).toHaveLength(0)
  })

  it('should handle API errors', async () => {
    const error = new Error('Vercel integration not configured')
    mockFetcher.mockRejectedValue(error)

    await expect(v0.integrations.vercel.projects.find()).rejects.toThrow(
      'Vercel integration not configured',
    )
  })
})
