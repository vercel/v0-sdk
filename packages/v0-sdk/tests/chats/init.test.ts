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

describe('v0.chats.init', () => {
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

    const result = await v0.chats.init({
      type: 'files',
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
        type: 'files',
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

    const result = await v0.chats.init({
      type: 'files',
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
        type: 'files',
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

    const result = await v0.chats.init({
      type: 'files',
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
        type: 'files',
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

    await v0.chats.init({
      type: 'files',
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
        type: 'files',
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

    await v0.chats.init({
      type: 'files',
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
        type: 'files',
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

    const result = await v0.chats.init({
      type: 'files',
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
        type: 'files',
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
      v0.chats.init({
        type: 'files',
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
        type: 'files',
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

  it('should create a chat from a repo', async () => {
    const mockResponse = {
      id: 'chat-repo-123',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-repo-123',
      shareable: true,
      privacy: 'private',
      favorite: false,
      authorId: 'user-123',
      messages: [],
      text: 'Initialized chat from repo',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.init({
      type: 'repo',
      repo: {
        url: 'https://github.com/user/project',
        branch: 'main',
      },
      chatPrivacy: 'public',
      projectId: 'project-456',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        type: 'repo',
        repo: {
          url: 'https://github.com/user/project',
          branch: 'main',
        },
        chatPrivacy: 'public',
        projectId: 'project-456',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create a chat from a repo without branch', async () => {
    const mockResponse = {
      id: 'chat-repo-456',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-repo-456',
      shareable: true,
      privacy: 'private',
      favorite: false,
      authorId: 'user-456',
      messages: [],
      text: 'Initialized chat from repo default branch',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.init({
      type: 'repo',
      repo: {
        url: 'https://github.com/user/another-project',
      },
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        type: 'repo',
        repo: {
          url: 'https://github.com/user/another-project',
        },
        chatPrivacy: undefined,
        projectId: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create a chat from a registry', async () => {
    const mockResponse = {
      id: 'chat-registry-123',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-registry-123',
      shareable: true,
      privacy: 'unlisted',
      favorite: false,
      authorId: 'user-123',
      messages: [],
      text: 'Initialized chat from registry',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.init({
      type: 'registry',
      registry: {
        url: 'https://registry.npmjs.org/some-package',
      },
      chatPrivacy: 'unlisted',
      name: 'Registry Chat',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        type: 'registry',
        registry: {
          url: 'https://registry.npmjs.org/some-package',
        },
        chatPrivacy: 'unlisted',
        name: 'Registry Chat',
        projectId: undefined,
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should create a chat from a zip file', async () => {
    const mockResponse = {
      id: 'chat-zip-123',
      object: 'chat',
      url: 'https://v0.dev/chat/chat-zip-123',
      shareable: false,
      privacy: 'team',
      favorite: false,
      authorId: 'user-123',
      messages: [],
      text: 'Initialized chat from zip',
    }

    mockFetcher.mockResolvedValue(mockResponse)

    const result = await v0.chats.init({
      type: 'zip',
      zip: {
        url: 'https://example.com/project.zip',
      },
      chatPrivacy: 'team',
      projectId: 'team-project-789',
      name: 'Zip Project Chat',
    })

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        type: 'zip',
        zip: {
          url: 'https://example.com/project.zip',
        },
        chatPrivacy: 'team',
        projectId: 'team-project-789',
        name: 'Zip Project Chat',
      },
    })

    expect(result).toEqual(mockResponse)
  })

  it('should handle errors with repo initialization', async () => {
    const mockError = new Error('API Error: Repository not accessible')
    mockFetcher.mockRejectedValue(mockError)

    await expect(
      v0.chats.init({
        type: 'repo',
        repo: {
          url: 'https://github.com/private/repo',
        },
      }),
    ).rejects.toThrow('API Error: Repository not accessible')

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        type: 'repo',
        repo: {
          url: 'https://github.com/private/repo',
        },
        chatPrivacy: undefined,
        projectId: undefined,
      },
    })
  })

  it('should handle errors with registry initialization', async () => {
    const mockError = new Error('API Error: Registry package not found')
    mockFetcher.mockRejectedValue(mockError)

    await expect(
      v0.chats.init({
        type: 'registry',
        registry: {
          url: 'https://registry.npmjs.org/nonexistent-package',
        },
      }),
    ).rejects.toThrow('API Error: Registry package not found')

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        type: 'registry',
        registry: {
          url: 'https://registry.npmjs.org/nonexistent-package',
        },
        chatPrivacy: undefined,
        projectId: undefined,
      },
    })
  })

  it('should handle errors with zip initialization', async () => {
    const mockError = new Error('API Error: Zip file could not be extracted')
    mockFetcher.mockRejectedValue(mockError)

    await expect(
      v0.chats.init({
        type: 'zip',
        zip: {
          url: 'https://example.com/corrupted.zip',
        },
      }),
    ).rejects.toThrow('API Error: Zip file could not be extracted')

    expect(mockFetcher).toHaveBeenCalledWith('/chats/init', 'POST', {
      body: {
        type: 'zip',
        zip: {
          url: 'https://example.com/corrupted.zip',
        },
        chatPrivacy: undefined,
        projectId: undefined,
      },
    })
  })
})
