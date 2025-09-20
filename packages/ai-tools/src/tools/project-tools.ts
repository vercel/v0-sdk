import { tool } from 'ai'
import { z } from 'zod'
import { createClient, type V0ClientConfig } from 'v0-sdk'

/**
 * Creates project-related AI SDK tools
 */
export function createProjectTools(config: V0ClientConfig = {}) {
  const client = createClient(config)

  const createProject = tool({
    description: 'Create a new project in v0',
    inputSchema: z.object({
      name: z.string().describe('Name of the project'),
      description: z.string().optional().describe('Description of the project'),
      icon: z.string().optional().describe('Icon for the project'),
      environmentVariables: z
        .array(
          z.object({
            key: z.string().describe('Environment variable key'),
            value: z.string().describe('Environment variable value'),
          }),
        )
        .optional()
        .describe('Environment variables for the project'),
      instructions: z
        .string()
        .optional()
        .describe('Custom instructions for the project'),
      vercelProjectId: z
        .string()
        .optional()
        .describe('Associated Vercel project ID'),
      privacy: z
        .enum(['private', 'team'])
        .optional()
        .describe('Privacy setting for the project'),
    }),
    execute: async ({
      name,
      description,
      icon,
      environmentVariables,
      instructions,
      vercelProjectId,
      privacy,
    }) => {
      const result = await client.projects.create({
        name,
        description,
        icon,
        environmentVariables,
        instructions,
        vercelProjectId,
        privacy,
      })

      return {
        projectId: result.id,
        name: result.name,
        description: result.description,
        privacy: result.privacy,
        webUrl: result.webUrl,
        apiUrl: result.apiUrl,
        createdAt: result.createdAt,
        vercelProjectId: result.vercelProjectId,
      }
    },
  })

  const getProject = tool({
    description: 'Get details of an existing project',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project to retrieve'),
    }),
    execute: async (params) => {
      const { projectId } = params
      const result = await client.projects.getById({ projectId })

      return {
        projectId: result.id,
        name: result.name,
        description: result.description,
        instructions: result.instructions,
        privacy: result.privacy,
        webUrl: result.webUrl,
        apiUrl: result.apiUrl,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        vercelProjectId: result.vercelProjectId,
        chatsCount: result.chats.length,
      }
    },
  })

  const updateProject = tool({
    description: 'Update properties of an existing project',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project to update'),
      name: z.string().optional().describe('New name for the project'),
      description: z
        .string()
        .optional()
        .describe('New description for the project'),
      instructions: z
        .string()
        .optional()
        .describe('New instructions for the project'),
      privacy: z
        .enum(['private', 'team'])
        .optional()
        .describe('New privacy setting'),
    }),
    execute: async ({
      projectId,
      name,
      description,
      instructions,
      privacy,
    }) => {
      const result = await client.projects.update({
        projectId,
        name,
        description,
        instructions,
        privacy,
      })

      return {
        projectId: result.id,
        name: result.name,
        description: result.description,
        instructions: result.instructions,
        privacy: result.privacy,
        updatedAt: result.updatedAt,
      }
    },
  })

  const listProjects = tool({
    description: 'List all projects',
    inputSchema: z.object({}),
    execute: async () => {
      const result = await client.projects.find()

      return {
        projects: result.data.map((project) => ({
          projectId: project.id,
          name: project.name,
          privacy: project.privacy,
          webUrl: project.webUrl,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          vercelProjectId: project.vercelProjectId,
        })),
      }
    },
  })

  const assignChatToProject = tool({
    description: 'Assign a chat to a project',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project'),
      chatId: z.string().describe('ID of the chat to assign'),
    }),
    execute: async (params) => {
      const { projectId, chatId } = params
      const result = await client.projects.assign({ projectId, chatId })

      return {
        projectId: result.id,
        assigned: result.assigned,
      }
    },
  })

  const getProjectByChat = tool({
    description: 'Get project details by chat ID',
    inputSchema: z.object({
      chatId: z.string().describe('ID of the chat'),
    }),
    execute: async (params) => {
      const { chatId } = params
      const result = await client.projects.getByChatId({ chatId })

      return {
        projectId: result.id,
        name: result.name,
        description: result.description,
        privacy: result.privacy,
        webUrl: result.webUrl,
        createdAt: result.createdAt,
        chatsCount: result.chats.length,
      }
    },
  })

  // Environment Variables Tools
  const createEnvironmentVariables = tool({
    description: 'Create environment variables for a project',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project'),
      environmentVariables: z
        .array(
          z.object({
            key: z.string().describe('Environment variable key'),
            value: z.string().describe('Environment variable value'),
          }),
        )
        .describe('Environment variables to create'),
      upsert: z
        .boolean()
        .optional()
        .describe('Whether to upsert existing variables'),
      decrypted: z
        .boolean()
        .optional()
        .describe('Whether to return decrypted values'),
    }),
    execute: async (params) => {
      const { projectId, environmentVariables, upsert, decrypted } = params
      const result = await client.projects.createEnvVars({
        projectId,
        environmentVariables,
        upsert,
        decrypted,
      })

      return {
        environmentVariables: result.data.map((envVar) => ({
          id: envVar.id,
          key: envVar.key,
          value: envVar.value,
          decrypted: envVar.decrypted,
          createdAt: envVar.createdAt,
        })),
      }
    },
  })

  const listEnvironmentVariables = tool({
    description: 'List environment variables for a project',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project'),
      decrypted: z
        .boolean()
        .optional()
        .describe('Whether to return decrypted values'),
    }),
    execute: async (params) => {
      const { projectId, decrypted } = params
      const result = await client.projects.findEnvVars({
        projectId,
        decrypted,
      })

      return {
        environmentVariables: result.data.map((envVar) => ({
          id: envVar.id,
          key: envVar.key,
          value: envVar.value,
          decrypted: envVar.decrypted,
          createdAt: envVar.createdAt,
          updatedAt: envVar.updatedAt,
        })),
      }
    },
  })

  const updateEnvironmentVariables = tool({
    description: 'Update environment variables for a project',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project'),
      environmentVariables: z
        .array(
          z.object({
            id: z.string().describe('Environment variable ID'),
            value: z.string().describe('New environment variable value'),
          }),
        )
        .describe('Environment variables to update'),
      decrypted: z
        .boolean()
        .optional()
        .describe('Whether to return decrypted values'),
    }),
    execute: async (params) => {
      const { projectId, environmentVariables, decrypted } = params
      const result = await client.projects.updateEnvVars({
        projectId,
        environmentVariables,
        decrypted,
      })

      return {
        environmentVariables: result.data.map((envVar) => ({
          id: envVar.id,
          key: envVar.key,
          value: envVar.value,
          decrypted: envVar.decrypted,
          updatedAt: envVar.updatedAt,
        })),
      }
    },
  })

  const deleteEnvironmentVariables = tool({
    description: 'Delete environment variables from a project',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project'),
      environmentVariableIds: z
        .array(z.string())
        .describe('IDs of environment variables to delete'),
    }),
    execute: async (params) => {
      const { projectId, environmentVariableIds } = params
      const result = await client.projects.deleteEnvVars({
        projectId,
        environmentVariableIds,
      })

      return {
        deletedVariables: result.data.map((envVar) => ({
          id: envVar.id,
          deleted: envVar.deleted,
        })),
      }
    },
  })

  return {
    createProject,
    getProject,
    updateProject,
    listProjects,
    assignChatToProject,
    getProjectByChat,
    createEnvironmentVariables,
    listEnvironmentVariables,
    updateEnvironmentVariables,
    deleteEnvironmentVariables,
  }
}
