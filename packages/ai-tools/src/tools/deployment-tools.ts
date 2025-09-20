import { tool } from 'ai'
import { z } from 'zod'
import { createClient, type V0ClientConfig } from 'v0-sdk'

/**
 * Creates deployment-related AI SDK tools
 */
export function createDeploymentTools(config: V0ClientConfig = {}) {
  const client = createClient(config)

  const createDeployment = tool({
    description: 'Create a new deployment from a chat version',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project to deploy to'),
      chatId: z.string().describe('ID of the chat to deploy'),
      versionId: z.string().describe('ID of the specific version to deploy'),
    }),
    execute: async (params) => {
      const { projectId, chatId, versionId } = params
      const result = await client.deployments.create({
        projectId,
        chatId,
        versionId,
      })

      return {
        deploymentId: result.id,
        projectId: result.projectId,
        chatId: result.chatId,
        versionId: result.versionId,
        inspectorUrl: result.inspectorUrl,
        webUrl: result.webUrl,
        apiUrl: result.apiUrl,
      }
    },
  })

  const getDeployment = tool({
    description: 'Get details of an existing deployment',
    inputSchema: z.object({
      deploymentId: z.string().describe('ID of the deployment to retrieve'),
    }),
    execute: async (params) => {
      const { deploymentId } = params
      const result = await client.deployments.getById({ deploymentId })

      return {
        deploymentId: result.id,
        projectId: result.projectId,
        chatId: result.chatId,
        versionId: result.versionId,
        inspectorUrl: result.inspectorUrl,
        webUrl: result.webUrl,
        apiUrl: result.apiUrl,
      }
    },
  })

  const deleteDeployment = tool({
    description: 'Delete an existing deployment',
    inputSchema: z.object({
      deploymentId: z.string().describe('ID of the deployment to delete'),
    }),
    execute: async (params) => {
      const { deploymentId } = params
      const result = await client.deployments.delete({ deploymentId })

      return {
        deploymentId: result.id,
        deleted: result.deleted,
      }
    },
  })

  const listDeployments = tool({
    description: 'List deployments by project, chat, and version',
    inputSchema: z.object({
      projectId: z.string().describe('ID of the project'),
      chatId: z.string().describe('ID of the chat'),
      versionId: z.string().describe('ID of the version'),
    }),
    execute: async (params) => {
      const { projectId, chatId, versionId } = params
      const result = await client.deployments.find({
        projectId,
        chatId,
        versionId,
      })

      return {
        deployments: result.data.map((deployment) => ({
          deploymentId: deployment.id,
          projectId: deployment.projectId,
          chatId: deployment.chatId,
          versionId: deployment.versionId,
          inspectorUrl: deployment.inspectorUrl,
          webUrl: deployment.webUrl,
          apiUrl: deployment.apiUrl,
        })),
      }
    },
  })

  const getDeploymentLogs = tool({
    description: 'Get logs for a deployment',
    inputSchema: z.object({
      deploymentId: z.string().describe('ID of the deployment'),
      since: z.number().optional().describe('Timestamp to get logs since'),
    }),
    execute: async (params) => {
      const { deploymentId, since } = params
      const result = await client.deployments.findLogs({
        deploymentId,
        since,
      })

      return {
        logs: result.logs,
        error: result.error,
        nextSince: result.nextSince,
      }
    },
  })

  const getDeploymentErrors = tool({
    description: 'Get errors for a deployment',
    inputSchema: z.object({
      deploymentId: z.string().describe('ID of the deployment'),
    }),
    execute: async (params) => {
      const { deploymentId } = params
      const result = await client.deployments.findErrors({ deploymentId })

      return {
        error: result.error,
        fullErrorText: result.fullErrorText,
        errorType: result.errorType,
        formattedError: result.formattedError,
      }
    },
  })

  return {
    createDeployment,
    getDeployment,
    deleteDeployment,
    listDeployments,
    getDeploymentLogs,
    getDeploymentErrors,
  }
}
