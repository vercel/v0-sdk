import { createFetcher } from './core'

export type ChatDetail = {
  id: string
  object: 'chat'
  shareable: boolean
  privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
  name?: string
  /** @deprecated */
  title?: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  latestVersion?: {
    id: string
    object: 'version'
    status: 'pending' | 'completed' | 'failed'
    demoUrl?: string
    files: {
      object: 'file'
      name: string
      content: string
    }[]
  }
  url: string
  messages: Array<{
    id: string
    object: 'message'
    content: string
    createdAt: string
    type:
      | 'message'
      | 'forked-block'
      | 'forked-chat'
      | 'open-in-v0'
      | 'refinement'
      | 'added-environment-variables'
      | 'added-integration'
      | 'deleted-file'
      | 'moved-file'
      | 'renamed-file'
      | 'edited-file'
      | 'replace-src'
      | 'reverted-block'
      | 'fix-with-v0'
      | 'auto-fix-with-v0'
      | 'sync-git'
    role: 'user' | 'assistant'
  }>
  files?: {
    lang: string
    meta: Record<string, any>
    source: string
  }[]
  /** @deprecated */
  demo?: string
  text: string
  modelConfiguration: {
    modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg'
    imageGenerations?: boolean
    thinking?: boolean
  }
}

export type ChatSummary = {
  id: string
  object: 'chat'
  shareable: boolean
  privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
  name?: string
  /** @deprecated */
  title?: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  latestVersion?: {
    id: string
    object: 'version'
    status: 'pending' | 'completed' | 'failed'
    demoUrl?: string
  }
}

export interface FileDetail {
  object: 'file'
  name: string
  content: string
}

export interface FileSummary {
  object: 'file'
  name: string
}

export type HookDetail = {
  id: string
  object: 'hook'
  name: string
  events: Array<
    | 'chat.created'
    | 'chat.updated'
    | 'chat.deleted'
    | 'message.created'
    | 'message.updated'
    | 'message.deleted'
    | 'project.created'
    | 'project.updated'
    | 'project.deleted'
  >
  chatId?: string
  projectId?: string
  url: string
}

export type HookEventDetail = {
  id: string
  object: 'hookEvent'
  event:
    | 'chat.created'
    | 'chat.updated'
    | 'chat.deleted'
    | 'message.created'
    | 'message.updated'
    | 'message.deleted'
    | 'project.created'
    | 'project.updated'
    | 'project.deleted'
  status?: 'pending' | 'success' | 'error'
  createdAt: string
}

export interface HookSummary {
  id: string
  object: 'hook'
  name: string
}

export type MessageDetail = {
  id: string
  object: 'message'
  chatId: string
  url: string
  files: {
    object: 'file'
    name: string
  }[]
  demo?: string
  text: string
  modelConfiguration: {
    modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg'
    imageGenerations?: boolean
    thinking?: boolean
  }
}

export type MessageSummary = {
  id: string
  object: 'message'
  content: string
  createdAt: string
  type:
    | 'message'
    | 'forked-block'
    | 'forked-chat'
    | 'open-in-v0'
    | 'refinement'
    | 'added-environment-variables'
    | 'added-integration'
    | 'deleted-file'
    | 'moved-file'
    | 'renamed-file'
    | 'edited-file'
    | 'replace-src'
    | 'reverted-block'
    | 'fix-with-v0'
    | 'auto-fix-with-v0'
    | 'sync-git'
  role: 'user' | 'assistant'
}

export type ProjectDetail = {
  id: string
  object: 'project'
  name: string
  vercelProjectId?: string
  createdAt: string
  updatedAt?: string
  apiUrl: string
  webUrl: string
  chats: Array<{
    id: string
    object: 'chat'
    shareable: boolean
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
    name?: string
    /** @deprecated */
    title?: string
    updatedAt?: string
    favorite: boolean
    authorId: string
    projectId?: string
    latestVersion?: {
      id: string
      object: 'version'
      status: 'pending' | 'completed' | 'failed'
      demoUrl?: string
    }
  }>
}

export interface ProjectSummary {
  id: string
  object: 'project'
  name: string
  vercelProjectId?: string
  createdAt: string
  updatedAt?: string
  apiUrl: string
  webUrl: string
}

export interface ScopeSummary {
  id: string
  object: 'scope'
  name?: string
}

export type SearchResultItem = {
  id: string
  object: 'chat' | 'project'
  name: string
  apiUrl: string
  webUrl: string
}

export interface UserDetail {
  id: string
  object: 'user'
  name?: string
  email: string
  avatar: string
}

export interface VercelProjectDetail {
  id: string
  object: 'vercel_project'
  name: string
}

export type VersionDetail = {
  id: string
  object: 'version'
  status: 'pending' | 'completed' | 'failed'
  demoUrl?: string
  files: {
    object: 'file'
    name: string
    content: string
  }[]
}

export type VersionSummary = {
  id: string
  object: 'version'
  status: 'pending' | 'completed' | 'failed'
  demoUrl?: string
}

export interface ChatsCreateRequest {
  message: string
  attachments?: {
    url: string
  }[]
  system?: string
  chatPrivacy?: 'public' | 'private' | 'team-edit' | 'team' | 'unlisted'
  projectId?: string
  modelConfiguration?: {
    modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg'
    imageGenerations?: boolean
    thinking?: boolean
  }
  responseMode?: 'sync' | 'async'
}

export type ChatsCreateResponse = ChatDetail

export interface ChatsFindResponse {
  object: 'list'
  data: ChatSummary[]
}

export type ChatsInitRequest = {
  name?: string
  chatPrivacy?: 'public' | 'private' | 'team-edit' | 'team' | 'unlisted'
  projectId?: string
} & (
  | {
      type: 'files'
      files: Array<
        | {
            name: string
            url: string
            content?: never
          }
        | {
            name: string
            content: string
            url?: never
          }
      >
      repo?: never
      registry?: never
      zip?: never
    }
  | {
      type: 'repo'
      repo: {
        url: string
        branch?: string
      }
      files?: never
      registry?: never
      zip?: never
    }
  | {
      type: 'registry'
      registry: {
        url: string
      }
      files?: never
      repo?: never
      zip?: never
    }
  | {
      type: 'zip'
      zip: {
        url: string
      }
      files?: never
      repo?: never
      registry?: never
    }
)

export type ChatsInitResponse = {
  id: string
  object: 'chat'
  shareable: boolean
  privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
  name?: string
  /** @deprecated */
  title?: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  latestVersion?: VersionDetail
  url: string
  messages: MessageSummary[]
  files?: {
    lang: string
    meta: Record<string, any>
    source: string
  }[]
  /** @deprecated */
  demo?: string
  text: string
}

export interface ChatsDeleteResponse {
  id: string
  object: 'chat'
  deleted: true
}

export type ChatsGetByIdResponse = {
  id: string
  object: 'chat'
  shareable: boolean
  privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
  name?: string
  /** @deprecated */
  title?: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  latestVersion?: VersionDetail
  url: string
  messages: MessageSummary[]
  files?: {
    lang: string
    meta: Record<string, any>
    source: string
  }[]
  /** @deprecated */
  demo?: string
  text: string
}

export interface ChatsUpdateRequest {
  name?: string
  privacy?: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
}

export type ChatsUpdateResponse = {
  id: string
  object: 'chat'
  shareable: boolean
  privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
  name?: string
  /** @deprecated */
  title?: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  latestVersion?: VersionDetail
  url: string
  messages: MessageSummary[]
  files?: {
    lang: string
    meta: Record<string, any>
    source: string
  }[]
  /** @deprecated */
  demo?: string
  text: string
}

export interface ChatsFavoriteRequest {
  isFavorite: boolean
}

export interface ChatsFavoriteResponse {
  id: string
  object: 'chat'
  favorited: boolean
}

export interface ChatsForkRequest {
  versionId?: string
}

export type ChatsForkResponse = {
  id: string
  object: 'chat'
  shareable: boolean
  privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
  name?: string
  /** @deprecated */
  title?: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  latestVersion?: VersionDetail
  url: string
  messages: MessageSummary[]
  files?: {
    lang: string
    meta: Record<string, any>
    source: string
  }[]
  /** @deprecated */
  demo?: string
  text: string
}

export type ProjectsGetByChatIdResponse = ProjectDetail

export interface ChatsSendMessageRequest {
  message: string
  attachments?: {
    url: string
  }[]
  modelConfiguration?: {
    modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg'
    imageGenerations?: boolean
    thinking?: boolean
  }
  responseMode?: 'sync' | 'async'
}

export type ChatsSendMessageResponse = {
  id: string
  object: 'chat'
  shareable: boolean
  privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
  name?: string
  /** @deprecated */
  title?: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  latestVersion?: VersionDetail
  url: string
  messages: MessageSummary[]
  files?: {
    lang: string
    meta: Record<string, any>
    source: string
  }[]
  /** @deprecated */
  demo?: string
  text: string
  modelConfiguration: {
    modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg'
    imageGenerations?: boolean
    thinking?: boolean
  }
  chatId: string
}

export type ChatsResumeResponse = MessageDetail

export interface DeploymentsFindLogsResponse {
  error?: string
  logs: string[]
  nextSince?: number
}

export interface DeploymentsFindErrorsResponse {
  error?: string
  fullErrorText?: string
  errorType?: string
  formattedError?: string
}

export interface HooksFindResponse {
  object: 'list'
  data: HookSummary[]
}

export interface HooksCreateRequest {
  name: string
  events: Array<
    | 'chat.created'
    | 'chat.updated'
    | 'chat.deleted'
    | 'message.created'
    | 'message.updated'
    | 'message.deleted'
    | 'project.created'
    | 'project.updated'
    | 'project.deleted'
  >
  chatId?: string
  projectId?: string
  url: string
}

export type HooksCreateResponse = HookDetail

export type HooksGetByIdResponse = HookDetail

export interface HooksUpdateRequest {
  name?: string
  events?: Array<
    | 'chat.created'
    | 'chat.updated'
    | 'chat.deleted'
    | 'message.created'
    | 'message.updated'
    | 'message.deleted'
    | 'project.created'
    | 'project.updated'
    | 'project.deleted'
  >
  url?: string
}

export type HooksUpdateResponse = HookDetail

export interface HooksDeleteResponse {
  id: string
  object: 'hook'
  deleted: true
}

export interface IntegrationsVercelProjectsFindResponse {
  object: 'list'
  data: VercelProjectDetail[]
}

export interface IntegrationsVercelProjectsCreateRequest {
  projectId: string
  name: string
}

export type IntegrationsVercelProjectsCreateResponse = VercelProjectDetail

export interface ProjectsFindResponse {
  object: 'list'
  data: ProjectSummary[]
}

export interface ProjectsCreateRequest {
  name: string
  description?: string
  icon?: string
  environmentVariables?: {
    key: string
    value: string
  }[]
  instructions?: string
}

export type ProjectsCreateResponse = ProjectDetail

export type ProjectsGetByIdResponse = ProjectDetail

export interface ProjectsAssignRequest {
  chatId: string
}

export interface ProjectsAssignResponse {
  object: 'project'
  id: string
  assigned: true
}

export interface RateLimitsFindResponse {
  remaining?: number
  reset?: number
  limit: number
}

export type UserGetResponse = UserDetail

export type UserGetBillingResponse =
  | {
      billingType: 'token'
      data: {
        plan: string
        billingMode?: 'test'
        role: string
        billingCycle: {
          start: number
          end: number
        }
        balance: {
          remaining: number
          total: number
        }
        onDemand: {
          balance: number
          blocks?: {
            expirationDate?: number
            effectiveDate: number
            originalBalance: number
            currentBalance: number
          }[]
        }
      }
    }
  | {
      billingType: 'legacy'
      data: {
        remaining?: number
        reset?: number
        limit: number
      }
    }

export interface UserGetPlanResponse {
  object: 'plan'
  plan: string
  billingCycle: {
    start: number
    end: number
  }
  balance: {
    remaining: number
    total: number
  }
}

export interface UserGetScopesResponse {
  object: 'list'
  data: ScopeSummary[]
}

export interface V0ClientConfig {
  apiKey?: string
  baseUrl?: string
}

export function createClient(config: V0ClientConfig = {}) {
  const fetcher = createFetcher(config)

  return {
    chats: {
      async create(params: ChatsCreateRequest): Promise<ChatsCreateResponse> {
        const body = {
          message: params.message,
          attachments: params.attachments,
          system: params.system,
          chatPrivacy: params.chatPrivacy,
          projectId: params.projectId,
          modelConfiguration: params.modelConfiguration,
          responseMode: params.responseMode,
        }
        return fetcher(`/chats`, 'POST', { body })
      },

      async find(params?: {
        limit?: string
        offset?: string
        isFavorite?: string
      }): Promise<ChatsFindResponse> {
        const query = params
          ? (Object.fromEntries(
              Object.entries({
                limit: params.limit,
                offset: params.offset,
                isFavorite: params.isFavorite,
              }).filter(([_, value]) => value !== undefined),
            ) as Record<string, string>)
          : {}
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/chats`, 'GET', { ...(hasQuery ? { query } : {}) })
      },

      async init(params: ChatsInitRequest): Promise<ChatsInitResponse> {
        const body = params
        return fetcher(`/chats/init`, 'POST', { body })
      },

      async delete(params: { chatId: string }): Promise<ChatsDeleteResponse> {
        const pathParams = { chatId: params.chatId }
        return fetcher(`/chats/${pathParams.chatId}`, 'DELETE', { pathParams })
      },

      async getById(params: { chatId: string }): Promise<ChatsGetByIdResponse> {
        const pathParams = { chatId: params.chatId }
        return fetcher(`/chats/${pathParams.chatId}`, 'GET', { pathParams })
      },

      async update(
        params: { chatId: string } & ChatsUpdateRequest,
      ): Promise<ChatsUpdateResponse> {
        const pathParams = { chatId: params.chatId }
        const body = { name: params.name, privacy: params.privacy }
        return fetcher(`/chats/${pathParams.chatId}`, 'PATCH', {
          pathParams,
          body,
        })
      },

      async favorite(
        params: { chatId: string } & ChatsFavoriteRequest,
      ): Promise<ChatsFavoriteResponse> {
        const pathParams = { chatId: params.chatId }
        const body = { isFavorite: params.isFavorite }
        return fetcher(`/chats/${pathParams.chatId}/favorite`, 'PUT', {
          pathParams,
          body,
        })
      },

      async fork(
        params: { chatId: string } & ChatsForkRequest,
      ): Promise<ChatsForkResponse> {
        const pathParams = { chatId: params.chatId }
        const body = { versionId: params.versionId }
        return fetcher(`/chats/${pathParams.chatId}/fork`, 'POST', {
          pathParams,
          body,
        })
      },

      async sendMessage(
        params: { chatId: string } & ChatsSendMessageRequest,
      ): Promise<ChatsSendMessageResponse> {
        const pathParams = { chatId: params.chatId }
        const body = {
          message: params.message,
          attachments: params.attachments,
          modelConfiguration: params.modelConfiguration,
          responseMode: params.responseMode,
        }
        return fetcher(`/chats/${pathParams.chatId}/messages`, 'POST', {
          pathParams,
          body,
        })
      },

      async resume(params: {
        chatId: string
        messageId: string
      }): Promise<ChatsResumeResponse> {
        const pathParams = {
          chatId: params.chatId,
          messageId: params.messageId,
        }
        return fetcher(
          `/chats/${pathParams.chatId}/messages/${pathParams.messageId}/resume`,
          'POST',
          { pathParams },
        )
      },
    },

    projects: {
      async getByChatId(params: {
        chatId: string
      }): Promise<ProjectsGetByChatIdResponse> {
        const pathParams = { chatId: params.chatId }
        return fetcher(`/chats/${pathParams.chatId}/project`, 'GET', {
          pathParams,
        })
      },

      async find(): Promise<ProjectsFindResponse> {
        return fetcher(`/projects`, 'GET', {})
      },

      async create(
        params: ProjectsCreateRequest,
      ): Promise<ProjectsCreateResponse> {
        const body = {
          name: params.name,
          description: params.description,
          icon: params.icon,
          environmentVariables: params.environmentVariables,
          instructions: params.instructions,
        }
        return fetcher(`/projects`, 'POST', { body })
      },

      async getById(params: {
        projectId: string
      }): Promise<ProjectsGetByIdResponse> {
        const pathParams = { projectId: params.projectId }
        return fetcher(`/projects/${pathParams.projectId}`, 'GET', {
          pathParams,
        })
      },

      async assign(
        params: { projectId: string } & ProjectsAssignRequest,
      ): Promise<ProjectsAssignResponse> {
        const pathParams = { projectId: params.projectId }
        const body = { chatId: params.chatId }
        return fetcher(`/projects/${pathParams.projectId}/assign`, 'POST', {
          pathParams,
          body,
        })
      },
    },

    deployments: {
      async findLogs(params: {
        deploymentId: string
        since?: string
      }): Promise<DeploymentsFindLogsResponse> {
        const pathParams = { deploymentId: params.deploymentId }
        const query = Object.fromEntries(
          Object.entries({
            since: params.since,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/deployments/${pathParams.deploymentId}/logs`, 'GET', {
          pathParams,
          ...(hasQuery ? { query } : {}),
        })
      },

      async findErrors(params: {
        deploymentId: string
      }): Promise<DeploymentsFindErrorsResponse> {
        const pathParams = { deploymentId: params.deploymentId }
        return fetcher(
          `/deployments/${pathParams.deploymentId}/errors`,
          'GET',
          { pathParams },
        )
      },
    },

    hooks: {
      async find(): Promise<HooksFindResponse> {
        return fetcher(`/hooks`, 'GET', {})
      },

      async create(params: HooksCreateRequest): Promise<HooksCreateResponse> {
        const body = {
          name: params.name,
          events: params.events,
          chatId: params.chatId,
          projectId: params.projectId,
          url: params.url,
        }
        return fetcher(`/hooks`, 'POST', { body })
      },

      async getById(params: { hookId: string }): Promise<HooksGetByIdResponse> {
        const pathParams = { hookId: params.hookId }
        return fetcher(`/hooks/${pathParams.hookId}`, 'GET', { pathParams })
      },

      async update(
        params: { hookId: string } & HooksUpdateRequest,
      ): Promise<HooksUpdateResponse> {
        const pathParams = { hookId: params.hookId }
        const body = {
          name: params.name,
          events: params.events,
          url: params.url,
        }
        return fetcher(`/hooks/${pathParams.hookId}`, 'PATCH', {
          pathParams,
          body,
        })
      },

      async delete(params: { hookId: string }): Promise<HooksDeleteResponse> {
        const pathParams = { hookId: params.hookId }
        return fetcher(`/hooks/${pathParams.hookId}`, 'DELETE', { pathParams })
      },
    },

    integrations: {
      vercel: {
        projects: {
          async find(): Promise<IntegrationsVercelProjectsFindResponse> {
            return fetcher(`/integrations/vercel/projects`, 'GET', {})
          },

          async create(
            params: IntegrationsVercelProjectsCreateRequest,
          ): Promise<IntegrationsVercelProjectsCreateResponse> {
            const body = { projectId: params.projectId, name: params.name }
            return fetcher(`/integrations/vercel/projects`, 'POST', { body })
          },
        },
      },
    },

    rateLimits: {
      async find(params?: { scope?: string }): Promise<RateLimitsFindResponse> {
        const query = params
          ? (Object.fromEntries(
              Object.entries({
                scope: params.scope,
              }).filter(([_, value]) => value !== undefined),
            ) as Record<string, string>)
          : {}
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/rate-limits`, 'GET', {
          ...(hasQuery ? { query } : {}),
        })
      },
    },

    user: {
      async get(): Promise<UserGetResponse> {
        return fetcher(`/user`, 'GET', {})
      },

      async getBilling(params?: {
        scope?: string
      }): Promise<UserGetBillingResponse> {
        const query = params
          ? (Object.fromEntries(
              Object.entries({
                scope: params.scope,
              }).filter(([_, value]) => value !== undefined),
            ) as Record<string, string>)
          : {}
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/user/billing`, 'GET', {
          ...(hasQuery ? { query } : {}),
        })
      },

      async getPlan(): Promise<UserGetPlanResponse> {
        return fetcher(`/user/plan`, 'GET', {})
      },

      async getScopes(): Promise<UserGetScopesResponse> {
        return fetcher(`/user/scopes`, 'GET', {})
      },
    },
  }
}

// Default client for backward compatibility
export const v0 = createClient()
