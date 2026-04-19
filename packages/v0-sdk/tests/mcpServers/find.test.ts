import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.mcpServers.find', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should return a list of MCP servers', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        {
          object: 'mcp_server',
          id: 'mcp-123',
          name: 'My MCP Server',
          url: 'https://mcp.example.com',
          description: 'A test MCP server',
          enabled: true,
          auth: { type: 'none' },
          scope: 'user',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.mcpServers.find()

    expect(mockFetcher).toHaveBeenCalledWith('/mcp-servers', 'GET', {})
    expect(result).toEqual(mockResponse)
  })

  it('should return an empty list when no servers exist', async () => {
    const mockResponse = { object: 'list', data: [] }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.mcpServers.find()

    expect(result.data).toHaveLength(0)
  })

  it('should handle API errors', async () => {
    mockFetcher.mockRejectedValue(new Error('HTTP 401: Unauthorized'))

    await expect(v0.mcpServers.find()).rejects.toThrow('HTTP 401: Unauthorized')
  })
})