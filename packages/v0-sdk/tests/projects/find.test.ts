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

describe('v0.projects.find', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should find projects', async () => {
    const mockResponse = [
      {
        id: 'project-1',
        name: 'First Project',
        url: 'https://v0.dev/project/project-1',
        env: ['NODE_ENV', 'API_KEY'],
      },
      {
        id: 'project-2',
        name: 'Second Project',
        url: 'https://v0.dev/project/project-2',
        env: ['DATABASE_URL', 'SECRET_KEY', 'PORT'],
      },
    ]

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.find()

    expect(mockFetcher).toHaveBeenCalledWith('/projects', 'GET', {})
    expect(result).toEqual(mockResponse)
    expect(result).toHaveLength(2)
  })

  it('should handle empty projects list', async () => {
    const mockResponse: any[] = []
    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.find()

    expect(result).toHaveLength(0)
  })

  it('should handle projects with different environment variables', async () => {
    const mockResponse = [
      {
        id: 'project-no-env',
        name: 'Project with no env vars',
        url: 'https://v0.dev/project/project-no-env',
        env: [],
      },
      {
        id: 'project-many-env',
        name: 'Project with many env vars',
        url: 'https://v0.dev/project/project-many-env',
        env: ['VAR1', 'VAR2', 'VAR3', 'VAR4', 'VAR5'],
      },
    ]

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.find()

    expect(result[0].env).toHaveLength(0)
    expect(result[1].env).toHaveLength(5)
  })

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch projects')
    mockFetcher.mockRejectedValue(error)

    await expect(v0.projects.find()).rejects.toThrow('Failed to fetch projects')
  })
})
