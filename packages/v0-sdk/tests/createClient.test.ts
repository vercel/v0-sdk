import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient, v0, type V0ClientConfig } from '../src/sdk/v0'
import * as core from '../src/sdk/core'

// Mock the createFetcher function
vi.mock('../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(),
  fetcher: vi.fn(), // Keep the original fetcher mock for backward compatibility
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
  })

  describe('configuration', () => {
    it('should create client with default configuration', () => {
      const client = createClient()

      expect(mockCreateFetcher).toHaveBeenCalledWith({})
      expect(client).toBeDefined()
      expect(client.chats).toBeDefined()
      expect(client.chats.create).toBeTypeOf('function')
    })

    it('should create client with custom API key', () => {
      const config: V0ClientConfig = {
        apiKey: 'custom-api-key',
      }

      const client = createClient(config)

      expect(mockCreateFetcher).toHaveBeenCalledWith(config)
      expect(client).toBeDefined()
    })

    it('should create client with custom base URL', () => {
      const config: V0ClientConfig = {
        baseUrl: 'https://custom-api.example.com/v1',
      }

      const client = createClient(config)

      expect(mockCreateFetcher).toHaveBeenCalledWith(config)
      expect(client).toBeDefined()
    })

    it('should create client with both custom API key and base URL', () => {
      const config: V0ClientConfig = {
        apiKey: 'custom-api-key',
        baseUrl: 'https://custom-api.example.com/v1',
      }

      const client = createClient(config)

      expect(mockCreateFetcher).toHaveBeenCalledWith(config)
      expect(client).toBeDefined()
    })

    it('should create client with empty configuration object', () => {
      const client = createClient({})

      expect(mockCreateFetcher).toHaveBeenCalledWith({})
      expect(client).toBeDefined()
    })
  })

  describe('client structure', () => {
    it('should have all expected top-level namespaces', () => {
      const client = createClient()

      expect(client.chats).toBeDefined()
      expect(client.projects).toBeDefined()
      expect(client.deployments).toBeDefined()
      expect(client.integrations).toBeDefined()
      expect(client.rateLimits).toBeDefined()
      expect(client.user).toBeDefined()
    })

    it('should have all expected chat methods', () => {
      const client = createClient()

      expect(client.chats.create).toBeTypeOf('function')
      expect(client.chats.find).toBeTypeOf('function')
      expect(client.chats.delete).toBeTypeOf('function')
      expect(client.chats.getById).toBeTypeOf('function')
      expect(client.chats.update).toBeTypeOf('function')
      expect(client.chats.favorite).toBeTypeOf('function')
      expect(client.chats.fork).toBeTypeOf('function')
      expect(client.chats.sendMessage).toBeTypeOf('function')
      expect(client.chats.resume).toBeTypeOf('function')
    })

    it('should have nested integrations structure', () => {
      const client = createClient()

      expect(client.integrations.vercel).toBeDefined()
      expect(client.integrations.vercel.projects).toBeDefined()
      expect(client.integrations.vercel.projects.find).toBeTypeOf('function')
      expect(client.integrations.vercel.projects.create).toBeTypeOf('function')
    })
  })

  describe('functionality', () => {
    it('should call the configured fetcher when making API calls', async () => {
      const mockResponse = { id: 'test-chat', message: 'Hello' }
      mockFetcher.mockResolvedValue(mockResponse)

      const client = createClient({ apiKey: 'test-key' })
      const result = await client.chats.create({ message: 'Hello, world!' })

      expect(mockFetcher).toHaveBeenCalledWith('/chats', 'POST', {
        body: {
          message: 'Hello, world!',
          attachments: undefined,
          system: undefined,
          chatPrivacy: undefined,
          projectId: undefined,
          modelConfiguration: undefined,
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors properly', async () => {
      const error = new Error('API Error')
      mockFetcher.mockRejectedValue(error)

      const client = createClient({ apiKey: 'test-key' })

      await expect(
        client.chats.create({ message: 'Test message' }),
      ).rejects.toThrow('API Error')
    })

    it('should work with different client instances independently', async () => {
      const client1 = createClient({ apiKey: 'key1' })
      const client2 = createClient({ apiKey: 'key2' })

      expect(mockCreateFetcher).toHaveBeenCalledTimes(2)
      expect(mockCreateFetcher).toHaveBeenNthCalledWith(1, { apiKey: 'key1' })
      expect(mockCreateFetcher).toHaveBeenNthCalledWith(2, { apiKey: 'key2' })

      // Both clients should have the same structure but different configurations
      expect(client1.chats.create).toBeTypeOf('function')
      expect(client2.chats.create).toBeTypeOf('function')
      expect(client1).not.toBe(client2)
    })
  })

  describe('default client', () => {
    it('should export a default v0 client', () => {
      expect(v0).toBeDefined()
      expect(v0.chats).toBeDefined()
      expect(v0.chats.create).toBeTypeOf('function')
    })

    it('should create default client with empty configuration', () => {
      // The v0 export should have been created during module initialization
      // We can't easily test the exact call since it happens at module load time
      expect(v0).toBeDefined()
    })
  })

  describe('type safety', () => {
    it('should accept valid configuration types', () => {
      // These should compile without TypeScript errors
      const config1: V0ClientConfig = {}
      const config2: V0ClientConfig = { apiKey: 'test' }
      const config3: V0ClientConfig = { baseUrl: 'https://example.com' }
      const config4: V0ClientConfig = {
        apiKey: 'test',
        baseUrl: 'https://example.com',
      }

      expect(() => createClient(config1)).not.toThrow()
      expect(() => createClient(config2)).not.toThrow()
      expect(() => createClient(config3)).not.toThrow()
      expect(() => createClient(config4)).not.toThrow()
    })
  })

  describe('backward compatibility', () => {
    it('should maintain the same API surface as the original v0 client', () => {
      const customClient = createClient({ apiKey: 'test' })

      // Check that both clients have the same methods
      const v0Methods = Object.keys(v0)
      const customClientMethods = Object.keys(customClient)

      expect(customClientMethods).toEqual(v0Methods)

      // Check nested structure
      expect(Object.keys(customClient.chats)).toEqual(Object.keys(v0.chats))
      expect(Object.keys(customClient.user)).toEqual(Object.keys(v0.user))
    })
  })
})
