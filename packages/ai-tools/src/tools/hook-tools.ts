import { tool } from 'ai'
import { z } from 'zod'
import { createClient, type V0ClientConfig } from 'v0-sdk'

/**
 * Creates webhook-related AI SDK tools
 */
export function createHookTools(config: V0ClientConfig = {}) {
  const client = createClient(config)

  const createHook = tool({
    description: 'Create a new webhook for v0 events',
    inputSchema: z.object({
      name: z.string().describe('Name of the webhook'),
      url: z.string().describe('URL to send webhook events to'),
      events: z
        .array(
          z.enum([
            'chat.created',
            'chat.updated',
            'chat.deleted',
            'message.created',
            'message.updated',
            'message.deleted',
          ]),
        )
        .describe('Events to listen for'),
      chatId: z
        .string()
        .optional()
        .describe('Specific chat ID to listen to events for'),
    }),
    execute: async (params) => {
      const { name, url, events, chatId } = params
      const result = await client.hooks.create({
        name,
        url,
        events,
        chatId,
      })

      return {
        hookId: result.id,
        name: result.name,
        url: result.url,
        events: result.events,
        chatId: result.chatId,
      }
    },
  })

  const getHook = tool({
    description: 'Get details of an existing webhook',
    inputSchema: z.object({
      hookId: z.string().describe('ID of the webhook to retrieve'),
    }),
    execute: async (params) => {
      const { hookId } = params
      const result = await client.hooks.getById({ hookId })

      return {
        hookId: result.id,
        name: result.name,
        url: result.url,
        events: result.events,
        chatId: result.chatId,
      }
    },
  })

  const updateHook = tool({
    description: 'Update properties of an existing webhook',
    inputSchema: z.object({
      hookId: z.string().describe('ID of the webhook to update'),
      name: z.string().optional().describe('New name for the webhook'),
      url: z.string().optional().describe('New URL for the webhook'),
      events: z
        .array(
          z.enum([
            'chat.created',
            'chat.updated',
            'chat.deleted',
            'message.created',
            'message.updated',
            'message.deleted',
          ]),
        )
        .optional()
        .describe('New events to listen for'),
    }),
    execute: async (params) => {
      const { hookId, name, url, events } = params
      const result = await client.hooks.update({
        hookId,
        name,
        url,
        events,
      })

      return {
        hookId: result.id,
        name: result.name,
        url: result.url,
        events: result.events,
        chatId: result.chatId,
      }
    },
  })

  const deleteHook = tool({
    description: 'Delete an existing webhook',
    inputSchema: z.object({
      hookId: z.string().describe('ID of the webhook to delete'),
    }),
    execute: async (params) => {
      const { hookId } = params
      const result = await client.hooks.delete({ hookId })

      return {
        hookId: result.id,
        deleted: result.deleted,
      }
    },
  })

  const listHooks = tool({
    description: 'List all webhooks',
    inputSchema: z.object({}),
    execute: async () => {
      const result = await client.hooks.find()

      return {
        hooks: result.data.map((hook) => ({
          hookId: hook.id,
          name: hook.name,
        })),
      }
    },
  })

  return {
    createHook,
    getHook,
    updateHook,
    deleteHook,
    listHooks,
  }
}
