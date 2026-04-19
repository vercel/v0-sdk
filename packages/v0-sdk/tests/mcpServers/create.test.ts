import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.mcpServers.create', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should create an MCP server with minimal parameters', async () => {
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

    const result = await v0.mcpServers.create({
      name: 'My Server',
      url: 'https://mcp.example.com',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/mcp-servers', 'POST', {
      body: {
        name: 'My Server',
        url: 'https://mcp.example.com',
        description: undefined,
        enabled: undefined,
        auth: undefined,
        scope: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create an MCP server with bearer auth', async () => {
    const mockResponse = {
      object: 'mcp_server',
      id: 'mcp-456',
      name: 'Secure Server',
      url: 'https://mcp.example.com',
      enabled: true,
      auth: { type: 'bearer' },
      scope: 'user',
      createdAt: '2024-01-01T00:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    await v0.mcpServers.create({
      name: 'Secure Server',
      url: 'https://mcp.example.com',
      auth: { type: 'bearer', token: 'my-secret-token' },
    })

    expect(mockFetcher).toHaveBeenCalledWith('/mcp-servers', 'POST', {
      body: expect.objectContaining({
        auth: { type: 'bearer', token: 'my-secret-token' },
      }),
    })
  })

  it('should create a team-scoped MCP server', async () => {
    mockFetcher.mockResolvedValue({
      object: 'mcp_server',
      id: 'mcp-789',
      name: 'Team Server',
      url: 'https://mcp.example.com',
      enabled: true,
      auth: { type: 'none' },
      scope: 'team',
      createdAt: '2024-01-01T00:00:00Z',
    })

    await v0.mcpServers.create({
      name: 'Team Server',
      url: 'https://mcp.example.com',
      scope: 'team',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/mcp-servers', 'POST', {
      body: expect.objectContaining({ scope: 'team' }),
    })
  })

  it('should handle API errors', async () => {
    mockFetcher.mockRejectedValue(new Error('HTTP 422: Unprocessable Entity'))

    await expect(
      v0.mcpServers.create({ name: 'Bad Server', url: 'not-a-valid-url' }),
    ).rejects.toThrow('HTTP 422: Unprocessable Entity')
  })
})