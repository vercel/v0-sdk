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

describe('v0.projects.update', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should update a project with all fields', async () => {
    const mockResponse = {
      id: 'project-123',
      object: 'project',
      name: 'Updated Project',
      description: 'Updated description',
      instructions: 'Updated instructions',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T02:00:00Z',
      apiUrl: 'https://api.v0.dev/projects/project-123',
      webUrl: 'https://v0.dev/projects/project-123',
      chats: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.update({
      projectId: 'project-123',
      name: 'Updated Project',
      description: 'Updated description',
      instructions: 'Updated instructions',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/projects/project-123', 'PATCH', {
      pathParams: { projectId: 'project-123' },
      body: {
        name: 'Updated Project',
        description: 'Updated description',
        instructions: 'Updated instructions',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a project with only name', async () => {
    const mockResponse = {
      id: 'project-456',
      object: 'project',
      name: 'New Name Only',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T01:00:00Z',
      apiUrl: 'https://api.v0.dev/projects/project-456',
      webUrl: 'https://v0.dev/projects/project-456',
      chats: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.update({
      projectId: 'project-456',
      name: 'New Name Only',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/projects/project-456', 'PATCH', {
      pathParams: { projectId: 'project-456' },
      body: {
        name: 'New Name Only',
        description: undefined,
        instructions: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a project with only description', async () => {
    const mockResponse = {
      id: 'project-789',
      object: 'project',
      description: 'New description only',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T01:00:00Z',
      apiUrl: 'https://api.v0.dev/projects/project-789',
      webUrl: 'https://v0.dev/projects/project-789',
      chats: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.update({
      projectId: 'project-789',
      description: 'New description only',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/projects/project-789', 'PATCH', {
      pathParams: { projectId: 'project-789' },
      body: {
        name: undefined,
        description: 'New description only',
        instructions: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a project with only instructions', async () => {
    const mockResponse = {
      id: 'project-abc',
      object: 'project',
      instructions: 'New instructions only',
      createdAt: '2023-01-04T00:00:00Z',
      updatedAt: '2023-01-04T01:00:00Z',
      apiUrl: 'https://api.v0.dev/projects/project-abc',
      webUrl: 'https://v0.dev/projects/project-abc',
      chats: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.update({
      projectId: 'project-abc',
      instructions: 'New instructions only',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/projects/project-abc', 'PATCH', {
      pathParams: { projectId: 'project-abc' },
      body: {
        name: undefined,
        description: undefined,
        instructions: 'New instructions only',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should update a project with name and description only', async () => {
    const mockResponse = {
      id: 'project-def',
      object: 'project',
      name: 'Updated Name',
      description: 'Updated description',
      createdAt: '2023-01-05T00:00:00Z',
      updatedAt: '2023-01-05T01:00:00Z',
      apiUrl: 'https://api.v0.dev/projects/project-def',
      webUrl: 'https://v0.dev/projects/project-def',
      chats: [],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.update({
      projectId: 'project-def',
      name: 'Updated Name',
      description: 'Updated description',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/projects/project-def', 'PATCH', {
      pathParams: { projectId: 'project-def' },
      body: {
        name: 'Updated Name',
        description: 'Updated description',
        instructions: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })
})
