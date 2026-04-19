import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.mcpServers.update', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should update an MCP server name', async () => {
    const mockResponse = {
      object: 'mcp_server',
      id: 'mcp-123',
      name: 'Updated Name',
      url: 'https://mcp.example.com',
      enabled: true,
      auth: { type: 'none' },
      scope: 'user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.mcpServers.update({
      mcpServerId: 'mcp-123',
      name: 'Updated Name',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/mcp-servers/mcp-123', 'PATCH', {
      pathParams: { mcpServerId: 'mcp-123' },
      body: {
        name: 'Updated Name',
        url: undefined,
        description: undefined,
        enabled: undefined,
        auth: undefined,
        scope: undefined,
      },
    })

    expect(result.name).toBe('Updated Name')
  })

  it('should disable an MCP server', async () => {
    mockFetcher.mockResolvedValue({
      object: 'mcp_server',
      id: 'mcp-123',
      name: 'My Server',
      url: 'https://mcp.example.com',
      enabled: false,
      auth: { type: 'none' },
      scope: 'user',
      createdAt: '2024-01-01T00:00:00Z',
    })

    await v0.mcpServers.update({ mcpServerId: 'mcp-123', enabled: false })

    expect(mockFetcher).toHaveBeenCalledWith('/mcp-servers/mcp-123', 'PATCH', {
      pathParams: { mcpServerId: 'mcp-123' },
      body: expect.objectContaining({ enabled: false }),
    })
  })

  it('should handle API errors', async () => {
    mockFetcher.mockRejectedValue(new Error('HTTP 404: Not Found'))

    await expect(
      v0.mcpServers.update({ mcpServerId: 'nonexistent', name: 'Foo' }),
    ).rejects.toThrow('HTTP 404: Not Found')
  })
})