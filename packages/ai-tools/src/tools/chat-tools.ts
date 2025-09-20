import { tool } from 'ai'
import { z } from 'zod'
import { createClient, type V0ClientConfig } from 'v0-sdk'

/**
 * Creates chat-related AI SDK tools
 */
export function createChatTools(config: V0ClientConfig = {}) {
  const client = createClient(config)

  const createChat = tool({
    description: 'Create a new chat with v0',
    inputSchema: z.object({
      message: z.string().describe('The initial message to start the chat'),
      system: z.string().optional().describe('System prompt for the chat'),
      attachments: z
        .array(
          z.object({
            url: z.string().describe('URL of the attachment'),
          }),
        )
        .optional()
        .describe('File attachments for the chat'),
      chatPrivacy: z
        .enum(['public', 'private', 'team-edit', 'team', 'unlisted'])
        .optional()
        .describe('Privacy setting for the chat'),
      projectId: z
        .string()
        .optional()
        .describe('Project ID to associate with the chat'),
      modelConfiguration: z
        .object({
          modelId: z
            .enum(['v0-1.5-sm', 'v0-1.5-md', 'v0-1.5-lg', 'v0-gpt-5'])
            .describe('Model to use for the chat'),
          imageGenerations: z
            .boolean()
            .optional()
            .describe('Enable image generations'),
          thinking: z.boolean().optional().describe('Enable thinking mode'),
        })
        .optional()
        .describe('Model configuration for the chat'),
      responseMode: z
        .enum(['sync', 'async'])
        .optional()
        .describe('Response mode for the chat'),
    }),
    execute: async ({
      message,
      system,
      attachments,
      chatPrivacy,
      projectId,
      modelConfiguration,
      responseMode,
    }) => {
      const result = await client.chats.create({
        message,
        system,
        attachments,
        chatPrivacy,
        projectId,
        modelConfiguration,
        responseMode,
      })

      // Handle streaming vs non-streaming responses
      if (result instanceof ReadableStream) {
        return {
          chatId: 'streaming-chat',
          webUrl: 'N/A (streaming response)',
          apiUrl: 'N/A (streaming response)',
          privacy: 'N/A (streaming response)',
          name: 'N/A (streaming response)',
          favorite: false,
          latestVersion: 'N/A (streaming response)',
          createdAt: 'N/A (streaming response)',
        }
      }

      return {
        chatId: result.id,
        webUrl: result.webUrl,
        apiUrl: result.apiUrl,
        privacy: result.privacy,
        name: result.name,
        favorite: result.favorite,
        latestVersion: result.latestVersion,
        createdAt: result.createdAt,
      }
    },
  })

  const sendMessage = tool({
    description: 'Send a message to an existing chat',
    inputSchema: z.object({
      chatId: z.string().describe('ID of the chat to send message to'),
      message: z.string().describe('Message content to send'),
      attachments: z
        .array(
          z.object({
            url: z.string().describe('URL of the attachment'),
          }),
        )
        .optional()
        .describe('File attachments for the message'),
      modelConfiguration: z
        .object({
          modelId: z
            .enum(['v0-1.5-sm', 'v0-1.5-md', 'v0-1.5-lg', 'v0-gpt-5'])
            .describe('Model to use'),
          imageGenerations: z
            .boolean()
            .optional()
            .describe('Enable image generations'),
          thinking: z.boolean().optional().describe('Enable thinking mode'),
        })
        .optional()
        .describe('Model configuration'),
      responseMode: z
        .enum(['sync', 'async'])
        .optional()
        .describe('Response mode'),
    }),
    execute: async ({
      chatId,
      message,
      attachments,
      modelConfiguration,
      responseMode,
    }) => {
      const result = await client.chats.sendMessage({
        chatId,
        message,
        attachments,
        modelConfiguration,
        responseMode,
      })

      // Handle streaming vs non-streaming responses
      if (result instanceof ReadableStream) {
        return {
          chatId: 'streaming-chat',
          webUrl: 'N/A (streaming response)',
          latestVersion: 'N/A (streaming response)',
          updatedAt: 'N/A (streaming response)',
        }
      }

      return {
        chatId: result.id,
        webUrl: result.webUrl,
        latestVersion: result.latestVersion,
        updatedAt: result.updatedAt,
      }
    },
  })

  const getChat = tool({
    description: 'Get details of an existing chat',
    inputSchema: z.object({
      chatId: z.string().describe('ID of the chat to retrieve'),
    }),
    execute: async (params) => {
      const { chatId } = params
      const result = await client.chats.getById({ chatId })

      return {
        chatId: result.id,
        name: result.name,
        privacy: result.privacy,
        webUrl: result.webUrl,
        favorite: result.favorite,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        latestVersion: result.latestVersion,
        messagesCount: result.messages.length,
      }
    },
  })

  const updateChat = tool({
    description: 'Update properties of an existing chat',
    inputSchema: z.object({
      chatId: z.string().describe('ID of the chat to update'),
      name: z.string().optional().describe('New name for the chat'),
      privacy: z
        .enum(['public', 'private', 'team', 'team-edit', 'unlisted'])
        .optional()
        .describe('New privacy setting'),
    }),
    execute: async (params) => {
      const { chatId, name, privacy } = params
      const result = await client.chats.update({ chatId, name, privacy })

      return {
        chatId: result.id,
        name: result.name,
        privacy: result.privacy,
        updatedAt: result.updatedAt,
      }
    },
  })

  const deleteChat = tool({
    description: 'Delete an existing chat',
    inputSchema: z.object({
      chatId: z.string().describe('ID of the chat to delete'),
    }),
    execute: async (params) => {
      const { chatId } = params
      const result = await client.chats.delete({ chatId })

      return {
        chatId: result.id,
        deleted: result.deleted,
      }
    },
  })

  const favoriteChat = tool({
    description: 'Toggle favorite status of a chat',
    inputSchema: z.object({
      chatId: z.string().describe('ID of the chat'),
      isFavorite: z.boolean().describe('Whether to mark as favorite or not'),
    }),
    execute: async (params) => {
      const { chatId, isFavorite } = params
      const result = await client.chats.favorite({ chatId, isFavorite })

      return {
        chatId: result.id,
        favorited: result.favorited,
      }
    },
  })

  const forkChat = tool({
    description: 'Fork an existing chat to create a new version',
    inputSchema: z.object({
      chatId: z.string().describe('ID of the chat to fork'),
      versionId: z
        .string()
        .optional()
        .describe('Specific version ID to fork from'),
      privacy: z
        .enum(['public', 'private', 'team', 'team-edit', 'unlisted'])
        .optional()
        .describe('Privacy setting for the forked chat'),
    }),
    execute: async (params) => {
      const { chatId, versionId, privacy } = params
      const result = await client.chats.fork({ chatId, versionId, privacy })

      return {
        originalChatId: chatId,
        newChatId: result.id,
        webUrl: result.webUrl,
        privacy: result.privacy,
        createdAt: result.createdAt,
      }
    },
  })

  const listChats = tool({
    description: 'List all chats',
    inputSchema: z.object({
      limit: z.number().optional().describe('Number of chats to return'),
      offset: z.number().optional().describe('Offset for pagination'),
      isFavorite: z.boolean().optional().describe('Filter by favorite status'),
    }),
    execute: async (params) => {
      const { limit, offset, isFavorite } = params
      const result = await client.chats.find({ limit, offset, isFavorite })

      return {
        chats: result.data.map((chat) => ({
          chatId: chat.id,
          name: chat.name,
          privacy: chat.privacy,
          webUrl: chat.webUrl,
          favorite: chat.favorite,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        })),
      }
    },
  })

  return {
    createChat,
    sendMessage,
    getChat,
    updateChat,
    deleteChat,
    favoriteChat,
    forkChat,
    listChats,
  }
}
