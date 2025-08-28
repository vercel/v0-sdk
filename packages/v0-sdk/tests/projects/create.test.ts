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

describe('v0.projects.create', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should create a project with minimal parameters', async () => {
    const mockResponse = {
      id: 'project-123',
      name: 'My Project',
      vercelProjectId: 'vercel-123',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.create({
      name: 'My Project',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/projects', 'POST', {
      body: {
        name: 'My Project',
        description: undefined,
        icon: undefined,
        environmentVariables: undefined,
        instructions: undefined,
      },
    })
    expect(result).toEqual(mockResponse)
  })

  it('should create a project with all parameters', async () => {
    const mockResponse = {
      id: 'project-456',
      name: 'Full Featured Project',
      vercelProjectId: 'vercel-456',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.projects.create({
      name: 'Full Featured Project',
      description: 'A comprehensive project with all features',
      icon: '🚀',
      environmentVariables: [
        { key: 'API_KEY', value: 'secret-key' },
        { key: 'DATABASE_URL', value: 'postgres://localhost:5432/db' },
      ],
      instructions: 'Use TypeScript and follow best practices',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/projects', 'POST', {
      body: {
        name: 'Full Featured Project',
        description: 'A comprehensive project with all features',
        icon: '🚀',
        environmentVariables: [
          { key: 'API_KEY', value: 'secret-key' },
          { key: 'DATABASE_URL', value: 'postgres://localhost:5432/db' },
        ],
        instructions: 'Use TypeScript and follow best practices',
      },
    })
    expect(result).toEqual(mockResponse)
  })

  it('should handle different environment variable configurations', async () => {
    const envVarConfigs = [
      [],
      [{ key: 'SINGLE_VAR', value: 'single_value' }],
      [
        { key: 'VAR_1', value: 'value_1' },
        { key: 'VAR_2', value: 'value_2' },
        { key: 'VAR_3', value: 'value_3' },
      ],
    ]

    for (const environmentVariables of envVarConfigs) {
      mockFetcher.mockResolvedValue({ id: 'test', name: 'test' })

      await v0.projects.create({
        name: 'Test Project',
        environmentVariables,
      })

      expect(mockFetcher).toHaveBeenCalledWith('/projects', 'POST', {
        body: expect.objectContaining({
          environmentVariables,
        }),
      })
    }
  })

  it('should handle different icons', async () => {
    const icons = ['🚀', '⚡', '🎨', '🔧', '📱']

    for (const icon of icons) {
      mockFetcher.mockResolvedValue({ id: 'test', name: 'test' })

      await v0.projects.create({
        name: 'Test Project',
        icon,
      })

      expect(mockFetcher).toHaveBeenCalledWith('/projects', 'POST', {
        body: expect.objectContaining({ icon }),
      })
    }
  })

  it('should handle API errors', async () => {
    const error = new Error('Project name already exists')
    mockFetcher.mockRejectedValue(error)

    await expect(
      v0.projects.create({
        name: 'Existing Project',
      }),
    ).rejects.toThrow('Project name already exists')
  })
})
