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
      })

      const fetcher = createFetcher()
      const result = await fetcher('/test', 'GET')

      expect(mockFetch).toHaveBeenCalledWith('https://api.v0.dev/v1/test', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-api-key',
          'x-session-cache': '1',
        },
        body: undefined,
      })
      expect(result).toEqual({ data: 'test' })
    })

    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const fetcher = createFetcher()
      const body = { message: 'Hello, world!' }

      await fetcher('/chats', 'POST', { body })

      expect(mockFetch).toHaveBeenCalledWith('https://api.v0.dev/v1/chats', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
          'x-session-cache': '1',
        },
        body: JSON.stringify(body),
      })
    })

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
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
      })

      const fetcher = createFetcher()
      const headers = { 'X-Custom-Header': 'custom-value' }

      await fetcher('/test', 'GET', { headers })

      expect(mockFetch).toHaveBeenCalledWith('https://api.v0.dev/v1/test', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-api-key',
          'X-Custom-Header': 'custom-value',
          'x-session-cache': '1',
        },
        body: undefined,
      })
    })

    it('should use custom base URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
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
        })

        const fetcher = createFetcher()

        await expect(fetcher('/test', 'GET')).rejects.toThrow(
          `HTTP ${status}: Error ${status}`,
        )
      }
    })
  })

  describe('request methods', () => {
    beforeEach(() => {
      process.env.V0_API_KEY = 'test-api-key'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
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
