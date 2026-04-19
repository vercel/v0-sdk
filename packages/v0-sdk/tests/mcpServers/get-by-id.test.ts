import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.mcpServers.getById', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get an MCP server by ID', async () => {
    const mockResponse = {
      object: 'mcp_server',
      id: 'mcp-123',
      name: 'My Server',
      url: 'https://mcp.example.com',
      enabled: true,
      auth: { type: 'none' },
      scope: 'user',
      createdAt: '2024-01-01T00:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.mcpServers.getById({ mcpServerId: 'mcp-123' })

    expect(mockFetcher).toHaveBeenCalledWith('/mcp-servers/mcp-123', 'GET', {
      pathParams: { mcpServerId: 'mcp-123' },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should throw for a non-existent server', async () => {
    mockFetcher.mockRejectedValue(new Error('HTTP 404: Not Found'))

    await expect(
      v0.mcpServers.getById({ mcpServerId: 'does-not-exist' }),
    ).rejects.toThrow('HTTP 404: Not Found')
  })
})