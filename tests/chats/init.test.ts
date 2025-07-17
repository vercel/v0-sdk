import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '../../src/sdk/v0'
import * as core from '../../src/sdk/core'

// Mock the core module
vi.mock('../../src/sdk/core', () => ({
  createFetcher: vi.fn(() => vi.fn()),
}))

const mockCreateFetcher = vi.mocked(core.createFetcher)
const mockFetcher = vi.fn()

describe('v0.chats.init.create', () => {
  let v0: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFetcher.mockReturnValue(mockFetcher)
    v0 = createClient()
  })

  it('should create a chat with files from content', async () => {
    const mockResponse = {
      id: 'chat-init-123',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-init-123',
      shareable: true,
      privacy: 'private',
      favorite: false,
      authorId: 'user-123',
      messages: [],
      text: 'Initialized chat with files',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.init.create({
      files: [
        {
          name: 'app.tsx',
          content: 'export default function App() { return <div>Hello</div> }',
        },
        {
          name: 'package.json',
          content: '{"name": "my-app", "version": "1.0.0"}',
        },
      ],
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        files: [
          {
            name: 'app.tsx',
            content:
              'export default function App() { return <div>Hello</div> }',
          },
          {
            name: 'package.json',
            content: '{"name": "my-app", "version": "1.0.0"}',
          },
        ],
        chatPrivacy: undefined,
        projectId: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create a chat with files from URLs', async () => {
    const mockResponse = {
      id: 'chat-init-456',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-init-456',
      shareable: true,
      privacy: 'public',
      favorite: false,
      authorId: 'user-456',
      messages: [],
      text: 'Initialized chat with URL files',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.init.create({
      files: [
        {
          name: 'component.tsx',
          url: 'https://example.com/component.tsx',
        },
        {
          name: 'styles.css',
          url: 'https://example.com/styles.css',
        },
      ],
      chatPrivacy: 'public',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        files: [
          {
            name: 'component.tsx',
            url: 'https://example.com/component.tsx',
          },
          {
            name: 'styles.css',
            url: 'https://example.com/styles.css',
          },
        ],
        chatPrivacy: 'public',
        projectId: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create a chat with all optional parameters', async () => {
    const mockResponse = {
      id: 'chat-init-789',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-init-789',
      shareable: false,
      privacy: 'team-edit',
      favorite: false,
      authorId: 'user-789',
      messages: [],
      text: 'Initialized team chat',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.init.create({
      files: [
        {
          name: 'main.ts',
          content: 'console.log("Hello, team!");',
        },
      ],
      chatPrivacy: 'team-edit',
      projectId: 'project-123',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        files: [
          {
            name: 'main.ts',
            content: 'console.log("Hello, team!");',
          },
        ],
        chatPrivacy: 'team-edit',
        projectId: 'project-123',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle different privacy settings', async () => {
    const mockResponse = {
      id: 'chat-unlisted',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-unlisted',
      shareable: true,
      privacy: 'unlisted',
      favorite: false,
      authorId: 'user-unlisted',
      messages: [],
      text: 'Unlisted chat',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    await v0.chats.init.create({
      files: [
        {
          name: 'secret.js',
          content: 'const secret = "hidden";',
        },
      ],
      chatPrivacy: 'unlisted',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        files: [
          {
            name: 'secret.js',
            content: 'const secret = "hidden";',
          },
        ],
        chatPrivacy: 'unlisted',
        projectId: undefined,
      },
    })
  })

  it('should handle team privacy setting', async () => {
    const mockResponse = {
      id: 'chat-team',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-team',
      shareable: false,
      privacy: 'team',
      favorite: false,
      authorId: 'user-team',
      messages: [],
      text: 'Team chat',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    await v0.chats.init.create({
      files: [
        {
          name: 'team-config.json',
          content: '{"team": "development"}',
        },
      ],
      chatPrivacy: 'team',
      projectId: 'team-project-456',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        files: [
          {
            name: 'team-config.json',
            content: '{"team": "development"}',
          },
        ],
        chatPrivacy: 'team',
        projectId: 'team-project-456',
      },
    })
  })

  it('should handle mixed file types (content and URL)', async () => {
    const mockResponse = {
      id: 'chat-mixed',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-mixed',
      shareable: true,
      privacy: 'private',
      favorite: false,
      authorId: 'user-mixed',
      messages: [],
      text: 'Mixed file types chat',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.init.create({
      files: [
        {
          name: 'local.tsx',
          content: 'export const Local = () => <div>Local</div>',
        },
        {
          name: 'remote.tsx',
          url: 'https://cdn.example.com/remote.tsx',
        },
      ],
      projectId: 'mixed-project',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        files: [
          {
            name: 'local.tsx',
            content: 'export const Local = () => <div>Local</div>',
          },
          {
            name: 'remote.tsx',
            url: 'https://cdn.example.com/remote.tsx',
          },
        ],
        chatPrivacy: undefined,
        projectId: 'mixed-project',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle API errors', async () => {
    const mockError = new Error('API Error: Invalid file format')
    mockFetcher.mockRejectedValue(mockError)

    await expect(
      v0.chats.init.create({
        files: [
          {
            name: 'invalid.xyz',
            content: 'invalid content',
          },
        ],
      }),
    ).rejects.toThrow('API Error: Invalid file format')

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        files: [
          {
            name: 'invalid.xyz',
            content: 'invalid content',
          },
        ],
        chatPrivacy: undefined,
        projectId: undefined,
      },
    })
  })
})
