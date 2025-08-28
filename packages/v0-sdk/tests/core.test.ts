import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createFetcher, type ClientConfig } from '../src/sdk/core'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('createFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear environment variables
    delete process.env.V0_API_KEY
  })

  describe('configuration', () => {
    it('should use default configuration when no config provided', () => {
      process.env.V0_API_KEY = 'env-api-key'

      const fetcher = createFetcher()
      expect(fetcher).toBeTypeOf('function')
    })

    it('should use custom API key from config', () => {
      const config: ClientConfig = {
        apiKey: 'custom-api-key',
      }

      const fetcher = createFetcher(config)
      expect(fetcher).toBeTypeOf('function')
    })

    it('should use custom base URL from config', () => {
      process.env.V0_API_KEY = 'env-api-key'

      const config: ClientConfig = {
        baseUrl: 'https://custom-api.example.com/v1',
      }

      const fetcher = createFetcher(config)
      expect(fetcher).toBeTypeOf('function')
    })

    it('should prioritize config API key over environment variable', async () => {
      process.env.V0_API_KEY = 'env-api-key'

      const config: ClientConfig = {
        apiKey: 'config-api-key',
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      const fetcher = createFetcher(config)
      await fetcher('/test', 'GET')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.v0.dev/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer config-api-key',
          }),
        }),
      )
    })

    it('should throw error when no API key is provided and fetcher is called', async () => {
      const fetcher = createFetcher({})

      await expect(fetcher('/test', 'GET')).rejects.toThrow(
        'API key is required. Provide it via config.apiKey or V0_API_KEY environment variable',
      )
    })

    it('should throw error when API key is undefined in config and env and fetcher is called', async () => {
      const config: ClientConfig = {
        apiKey: undefined,
      }

      const fetcher = createFetcher(config)

      await expect(fetcher('/test', 'GET')).rejects.toThrow(
        'API key is required. Provide it via config.apiKey or V0_API_KEY environment variable',
      )
    })
  })

  describe('HTTP requests', () => {
    beforeEach(() => {
      process.env.V0_API_KEY = 'test-api-key'
    })

    it('should make GET request with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Headers(),
      })

      const fetcher = createFetcher()
      const result = await fetcher('/test', 'GET')

      expect(mockFetch).toHaveBeenCalledWith('https://api.v0.dev/v1/test', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-api-key',
          'User-Agent': 'v0-sdk/0.1.0',
        },
        body: undefined,
      })
      expect(result).toEqual({ data: 'test' })
    })

    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      const fetcher = createFetcher()
      const body = { message: 'Hello, world!' }

      await fetcher('/chats', 'POST', { body })

      expect(mockFetch).toHaveBeenCalledWith('https://api.v0.dev/v1/chats', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
          'User-Agent': 'v0-sdk/0.1.0',
        },
        body: JSON.stringify(body),
      })
    })

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
        headers: new Headers(),
      })

      const fetcher = createFetcher()
      const query = { limit: '10', offset: '0' }

      await fetcher('/chats', 'GET', { query })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.v0.dev/v1/chats?limit=10&offset=0',
        expect.objectContaining({
          method: 'GET',
        }),
      )
    })

    it('should handle path parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'chat-123' }),
        headers: new Headers(),
      })

      const fetcher = createFetcher()
      const pathParams = { chatId: 'chat-123' }

      await fetcher('/chats/${pathParams.chatId}', 'GET', { pathParams })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.v0.dev/v1/chats/${pathParams.chatId}',
        expect.objectContaining({
          method: 'GET',
        }),
      )
    })

    it('should handle custom headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      const fetcher = createFetcher()
      const headers = { 'X-Custom-Header': 'custom-value' }

      await fetcher('/test', 'GET', { headers })

      expect(mockFetch).toHaveBeenCalledWith('https://api.v0.dev/v1/test', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-api-key',
          'User-Agent': 'v0-sdk/0.1.0',
          'X-Custom-Header': 'custom-value',
        },
        body: undefined,
      })
    })

    it('should use custom base URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      const config: ClientConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://custom-api.example.com/v2',
      }

      const fetcher = createFetcher(config)
      await fetcher('/test', 'GET')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom-api.example.com/v2/test',
        expect.objectContaining({
          method: 'GET',
        }),
      )
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      process.env.V0_API_KEY = 'test-api-key'
    })

    it('should throw error for non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
        headers: new Headers(),
      })

      const fetcher = createFetcher()

      await expect(fetcher('/test', 'GET')).rejects.toThrow(
        'HTTP 400: Bad Request',
      )
    })

    it('should throw error for network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const fetcher = createFetcher()

      await expect(fetcher('/test', 'GET')).rejects.toThrow('Network error')
    })

    it('should handle different HTTP status codes', async () => {
      const statusCodes = [401, 403, 404, 500]

      for (const status of statusCodes) {
        mockFetch.mockResolvedValue({
          ok: false,
          status,
          text: () => Promise.resolve(`Error ${status}`),
          headers: new Headers(),
        })

        const fetcher = createFetcher()

        await expect(fetcher('/test', 'GET')).rejects.toThrow(
          `HTTP ${status}: Error ${status}`,
        )
      }
    })
  })

  describe('session token handling', () => {
    beforeEach(() => {
      process.env.V0_API_KEY = 'test-api-key'
    })

    it('should initially use API key for authorization', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      const fetcher = createFetcher()
      await fetcher('/test', 'GET')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.v0.dev/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        }),
      )
    })

    it('should use session token when received from server', async () => {
      const sessionToken = 'session-token-123'

      // First request returns session token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers({ 'x-session-token': sessionToken }),
      })

      // Second request should use session token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      const fetcher = createFetcher()

      // First request
      await fetcher('/test1', 'GET')

      // Second request should include both API key and session token
      await fetcher('/test2', 'GET')

      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'https://api.v0.dev/v1/test1',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        }),
      )

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://api.v0.dev/v1/test2',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'x-session-token': sessionToken,
          }),
        }),
      )
    })

    it('should update session token when server provides a new one', async () => {
      const firstSessionToken = 'session-token-123'
      const secondSessionToken = 'session-token-456'

      // First request returns first session token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers({ 'x-session-token': firstSessionToken }),
      })

      // Second request returns second session token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers({ 'x-session-token': secondSessionToken }),
      })

      // Third request should use the latest session token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      const fetcher = createFetcher()

      await fetcher('/test1', 'GET')
      await fetcher('/test2', 'GET')
      await fetcher('/test3', 'GET')

      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        }),
      )

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'x-session-token': firstSessionToken,
          }),
        }),
      )

      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'x-session-token': secondSessionToken,
          }),
        }),
      )
    })

    it('should include both API key and session token in subsequent requests', async () => {
      const sessionToken = 'session-token-123'

      // First request with API key returns session token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers({ 'x-session-token': sessionToken }),
      })

      // Second request should include both API key and session token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      const fetcher = createFetcher({ apiKey: 'test-api-key' })

      // First request to get session token
      await fetcher('/test1', 'GET')

      // Second request should include both headers for fallback support
      const result = await fetcher('/test2', 'GET')

      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://api.v0.dev/v1/test2',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'x-session-token': sessionToken,
          }),
        }),
      )
    })

    it('should handle session token with error responses', async () => {
      const sessionToken = 'session-token-123'

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
        headers: new Headers({ 'x-session-token': sessionToken }),
      })

      const fetcher = createFetcher()

      await expect(fetcher('/test', 'GET')).rejects.toThrow(
        'HTTP 400: Bad Request',
      )

      // Should still store the session token for future requests
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })

      await fetcher('/test2', 'GET')

      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.v0.dev/v1/test2',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'x-session-token': sessionToken,
          }),
        }),
      )
    })
  })

  describe('request methods', () => {
    beforeEach(() => {
      process.env.V0_API_KEY = 'test-api-key'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers(),
      })
    })

    it('should handle GET requests without body', async () => {
      const fetcher = createFetcher()
      await fetcher('/test', 'GET')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          body: undefined,
        }),
      )
    })

    it('should handle POST requests with body', async () => {
      const fetcher = createFetcher()
      const body = { data: 'test' }

      await fetcher('/test', 'POST', { body })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      )
    })

    it('should handle PUT requests with body', async () => {
      const fetcher = createFetcher()
      const body = { data: 'test' }

      await fetcher('/test', 'PUT', { body })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        }),
      )
    })

    it('should handle DELETE requests', async () => {
      const fetcher = createFetcher()

      await fetcher('/test', 'DELETE')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
          body: undefined,
        }),
      )
    })

    it('should handle PATCH requests with body', async () => {
      const fetcher = createFetcher()
      const body = { data: 'test' }

      await fetcher('/test', 'PATCH', { body })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      )
    })
  })
})
