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

describe('v0.integrations.vercel.projects.create', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should create a Vercel integration project', async () => {
    const mockResponse = {
      id: 'vercel-proj-123',
      object: 'vercel_project',
      name: 'My Vercel Project',
    }
    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.integrations.vercel.projects.create({
      projectId: 'vercel-project-123',
      name: 'My Vercel Project',
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/integrations/vercel/projects',
      'POST',
      {
        body: {
          projectId: 'vercel-project-123',
          name: 'My Vercel Project',
        },
      },
    )
    expect(result).toEqual(mockResponse)
  })

  it('should handle different project names and IDs', async () => {
    const testCases = [
      { projectId: 'simple-id', name: 'Simple Project' },
      {
        projectId: 'project-with-dashes-123',
        name: 'Project with Special Characters & Symbols!',
      },
      {
        projectId: 'very_long_project_id_with_underscores',
        name: 'A Very Long Project Name That Contains Multiple Words',
      },
    ]

    for (const { projectId, name } of testCases) {
      const mockResponse = {
        id: `vercel-proj-${projectId}`,
        object: 'vercel_project',
        name,
      }
      mockFetcher.mockResolvedValue(mockResponse)

      const result = await v0.integrations.vercel.projects.create({
        projectId,
        name,
      })

      expect(mockFetcher).toHaveBeenCalledWith(
        '/integrations/vercel/projects',
        'POST',
        {
          body: { projectId, name },
        },
      )
      expect(result.id).toBe(`vercel-proj-${projectId}`)
      expect(result.object).toBe('vercel_project')
      expect(result.name).toBe(name)
    }
  })

  it('should handle API errors', async () => {
    const error = new Error('Project already exists')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.integrations.vercel.projects.create({
        projectId: 'existing-project',
        name: 'Existing Project',
      }),
    ).rejects.toThrow('Project already exists')
  })

  it('should handle validation errors', async () => {
    const error = new Error('Invalid project ID format')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.integrations.vercel.projects.create({
        projectId: '',
        name: 'Empty Project ID',
      }),
    ).rejects.toThrow('Invalid project ID format')
  })
})
