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

describe('v0.user.get', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should get user information', async () => {
    const mockResponse = {
      id: 'user-123',
      object: 'user',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://avatar.example.com/john.jpg',
      createdAt: '2024-01-01T00:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.get()

    expect(mockFetcher).toHaveBeenCalledWith('/user', 'GET', {})
    expect(result).toEqual(mockResponse)
    expect(result.id).toBe('user-123')
    expect(result.email).toBe('john.doe@example.com')
  })

  it('should handle user with optional name', async () => {
    const mockResponse = {
      id: 'user-456',
      object: 'user',
      email: 'jane@example.com',
      avatar: 'https://avatar.example.com/jane.jpg',
      createdAt: '2024-01-02T00:00:00Z',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.user.get()

    expect(result.name).toBeUndefined()
    expect(result.email).toBe('jane@example.com')
  })

  it('should handle API errors', async () => {
    const error = new Error('Unauthorized')
    mockFetcher.mockRejectedValue(error)

    await expect(v0.user.get()).rejects.toThrow('Unauthorized')
  })
})
