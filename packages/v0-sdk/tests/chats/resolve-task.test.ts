import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient, type ChatsResolveTaskRequest } from '../../src/index'
import * as core from '../../src/sdk/core'

vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(),
  createStreamingFetcher: vi.fn(() => vi.fn()),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.chats.resolveTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
  })

  it('resolves a completed Vercel Connect setup task', async () => {
    const task: ChatsResolveTaskRequest['task'] = {
      type: 'vercel-connect-setup',
    }
    const mockResponse = { id: 'chat-123' }
    mockFetcher.mockResolvedValue(mockResponse)

    const v0 = createClient()
    const result = await v0.chats.resolveTask({
      chatId: 'chat-123',
      task,
    })

    expect(mockFetcher).toHaveBeenCalledWith(
      '/chats/chat-123/tasks/resolve',
      'POST',
      {
        pathParams: { chatId: 'chat-123' },
        body: {
          task: { type: 'vercel-connect-setup' },
          responseMode: undefined,
          modelConfiguration: undefined,
        },
      },
    )
    expect(result).toEqual(mockResponse)
  })
})
