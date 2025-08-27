import { describe, it, expect, vi, beforeEach } from 'vitest'
import { v0Tools, v0ToolsByCategory } from '../src/index'

// Mock the v0 SDK
vi.mock('v0-sdk', () => ({
  createClient: vi.fn(() => ({
    chats: {
      create: vi.fn(),
      find: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      sendMessage: vi.fn(),
      favorite: vi.fn(),
      fork: vi.fn(),
    },
    projects: {
      create: vi.fn(),
      find: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      assign: vi.fn(),
      getByChatId: vi.fn(),
      createEnvVars: vi.fn(),
      findEnvVars: vi.fn(),
      updateEnvVars: vi.fn(),
      deleteEnvVars: vi.fn(),
    },
    deployments: {
      create: vi.fn(),
      find: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      findLogs: vi.fn(),
      findErrors: vi.fn(),
    },
    user: {
      get: vi.fn(),
      getBilling: vi.fn(),
      getPlan: vi.fn(),
      getScopes: vi.fn(),
    },
    hooks: {
      create: vi.fn(),
      find: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    rateLimits: {
      find: vi.fn(),
    },
  })),
}))

describe('@v0-sdk/ai-tools', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('v0Tools (flat structure)', () => {
    it('should create all tools in flat structure', () => {
      const tools = v0Tools({
        apiKey: 'test-api-key',
      })

      // Chat tools
      expect(tools).toHaveProperty('createChat')
      expect(tools).toHaveProperty('sendMessage')
      expect(tools).toHaveProperty('getChat')
      expect(tools).toHaveProperty('updateChat')
      expect(tools).toHaveProperty('deleteChat')
      expect(tools).toHaveProperty('favoriteChat')
      expect(tools).toHaveProperty('forkChat')
      expect(tools).toHaveProperty('listChats')

      // Project tools
      expect(tools).toHaveProperty('createProject')
      expect(tools).toHaveProperty('getProject')
      expect(tools).toHaveProperty('updateProject')
      expect(tools).toHaveProperty('listProjects')
      expect(tools).toHaveProperty('assignChatToProject')
      expect(tools).toHaveProperty('getProjectByChat')
      expect(tools).toHaveProperty('createEnvironmentVariables')
      expect(tools).toHaveProperty('listEnvironmentVariables')
      expect(tools).toHaveProperty('updateEnvironmentVariables')
      expect(tools).toHaveProperty('deleteEnvironmentVariables')

      // Deployment tools
      expect(tools).toHaveProperty('createDeployment')
      expect(tools).toHaveProperty('getDeployment')
      expect(tools).toHaveProperty('deleteDeployment')
      expect(tools).toHaveProperty('listDeployments')
      expect(tools).toHaveProperty('getDeploymentLogs')
      expect(tools).toHaveProperty('getDeploymentErrors')

      // User tools
      expect(tools).toHaveProperty('getCurrentUser')
      expect(tools).toHaveProperty('getUserBilling')
      expect(tools).toHaveProperty('getUserPlan')
      expect(tools).toHaveProperty('getUserScopes')
      expect(tools).toHaveProperty('getRateLimits')

      // Hook tools
      expect(tools).toHaveProperty('createHook')
      expect(tools).toHaveProperty('getHook')
      expect(tools).toHaveProperty('updateHook')
      expect(tools).toHaveProperty('deleteHook')
      expect(tools).toHaveProperty('listHooks')
    })
  })

  describe('v0ToolsByCategory (organized structure)', () => {
    it('should create tools organized by category', () => {
      const tools = v0ToolsByCategory({
        apiKey: 'test-api-key',
      })

      expect(tools).toHaveProperty('chat')
      expect(tools).toHaveProperty('project')
      expect(tools).toHaveProperty('deployment')
      expect(tools).toHaveProperty('user')
      expect(tools).toHaveProperty('hook')
    })

    it('should create chat tools', () => {
      const tools = v0ToolsByCategory()

      expect(tools.chat).toHaveProperty('createChat')
      expect(tools.chat).toHaveProperty('sendMessage')
      expect(tools.chat).toHaveProperty('getChat')
      expect(tools.chat).toHaveProperty('updateChat')
      expect(tools.chat).toHaveProperty('deleteChat')
      expect(tools.chat).toHaveProperty('favoriteChat')
      expect(tools.chat).toHaveProperty('forkChat')
      expect(tools.chat).toHaveProperty('listChats')
    })

    it('should create project tools', () => {
      const tools = v0ToolsByCategory()

      expect(tools.project).toHaveProperty('createProject')
      expect(tools.project).toHaveProperty('getProject')
      expect(tools.project).toHaveProperty('updateProject')
      expect(tools.project).toHaveProperty('listProjects')
      expect(tools.project).toHaveProperty('assignChatToProject')
      expect(tools.project).toHaveProperty('getProjectByChat')
      expect(tools.project).toHaveProperty('createEnvironmentVariables')
      expect(tools.project).toHaveProperty('listEnvironmentVariables')
      expect(tools.project).toHaveProperty('updateEnvironmentVariables')
      expect(tools.project).toHaveProperty('deleteEnvironmentVariables')
    })

    it('should create deployment tools', () => {
      const tools = v0ToolsByCategory()

      expect(tools.deployment).toHaveProperty('createDeployment')
      expect(tools.deployment).toHaveProperty('getDeployment')
      expect(tools.deployment).toHaveProperty('deleteDeployment')
      expect(tools.deployment).toHaveProperty('listDeployments')
      expect(tools.deployment).toHaveProperty('getDeploymentLogs')
      expect(tools.deployment).toHaveProperty('getDeploymentErrors')
    })

    it('should create user tools', () => {
      const tools = v0ToolsByCategory()

      expect(tools.user).toHaveProperty('getCurrentUser')
      expect(tools.user).toHaveProperty('getUserBilling')
      expect(tools.user).toHaveProperty('getUserPlan')
      expect(tools.user).toHaveProperty('getUserScopes')
      expect(tools.user).toHaveProperty('getRateLimits')
    })

    it('should create hook tools', () => {
      const tools = v0ToolsByCategory()

      expect(tools.hook).toHaveProperty('createHook')
      expect(tools.hook).toHaveProperty('getHook')
      expect(tools.hook).toHaveProperty('updateHook')
      expect(tools.hook).toHaveProperty('deleteHook')
      expect(tools.hook).toHaveProperty('listHooks')
    })
  })

  describe('Tool Schemas', () => {
    it('should have proper tool definitions', () => {
      const tools = v0ToolsByCategory()

      // Check that each tool has the required properties
      expect(tools.chat.createChat).toHaveProperty('description')
      expect(tools.chat.createChat).toHaveProperty('inputSchema')
      expect(tools.chat.createChat).toHaveProperty('execute')

      expect(tools.project.createProject).toHaveProperty('description')
      expect(tools.project.createProject).toHaveProperty('inputSchema')
      expect(tools.project.createProject).toHaveProperty('execute')
    })
  })
})
