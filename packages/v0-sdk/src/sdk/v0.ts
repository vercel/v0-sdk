import { createFetcher, createStreamingFetcher } from './core'

// Re-export streaming utilities from core
export { parseStreamingResponse, type StreamEvent } from './core'

export type ChatDetail = {
  id: string
  object: 'chat'
  shareable: boolean
  privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
  name?: string
  /** @deprecated */
  title?: string
  createdAt: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  webUrl: string
  apiUrl: string
  latestVersion?: {
    id: string
    object: 'version'
    status: 'pending' | 'completed' | 'failed'
    demoUrl?: string
    screenshotUrl?: string
    createdAt: string
    updatedAt?: string
    files: {
      object: 'file'
      name: string
      content: string
      locked: boolean
    }[]
  }
  /** @deprecated */
  url: string
  messages: Array<{
    id: string
    object: 'message'
    content: string
    experimental_content?: Array<unknown[] | unknown[]>
    createdAt: string
    updatedAt?: string
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
    finishReason?:
      | 'stop'
      | 'length'
      | 'content-filter'
      | 'tool-calls'
      | 'error'
      | 'other'
      | 'unknown'
    apiUrl: string
    authorId: string | null
    parentId?: string | null
    attachments?: Array<{
      url: string
      name?: string
      contentType?: string
      size: number
      content?: string
      type?: 'screenshot' | 'figma' | 'zip'
    }>
  }>
  files?: {
    lang: string
    meta: Record<string, unknown>
    source: string
  }[]
  /** @deprecated */
  demo?: string
  text: string
  modelConfiguration?: {
    /** @deprecated */
    modelId?: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg' | 'v0-gpt-5'
    imageGenerations?: boolean
    thinking?: boolean
  }
  permissions: {
    write: boolean
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
  createdAt: string
  updatedAt?: string
  favorite: boolean
  authorId: string
  projectId?: string
  webUrl: string
  apiUrl: string
  latestVersion?: {
    id: string
    object: 'version'
    status: 'pending' | 'completed' | 'failed'
    demoUrl?: string
    screenshotUrl?: string
    createdAt: string
    updatedAt?: string
  }
}

export interface DeploymentDetail {
  id: string
  object: 'deployment'
  inspectorUrl: string
  chatId: string
  projectId: string
  versionId: string
  apiUrl: string
  webUrl: string
}

export interface DeploymentSummary {
  id: string
  object: 'deployment'
  inspectorUrl: string
  chatId: string
  projectId: string
  versionId: string
  apiUrl: string
  webUrl: string
}

export interface EnvironmentVariableDetailSchema {
  id: string
  object: 'environment_variable'
  key: string
  value: string
  decrypted: boolean
  createdAt: number
  updatedAt?: number
}

export interface EnvironmentVariableSummarySchema {
  id: string
  object: 'environment_variable'
  key: string
  value: string
  decrypted: boolean
  createdAt: number
  updatedAt?: number
}

export interface EnvironmentVariablesListSchema {
  object: 'list'
  data: {
    id: string
    object: 'environment_variable'
    key: string
    value: string
    decrypted: boolean
    createdAt: number
    updatedAt?: number
  }[]
}

export interface FileDetail {
  object: 'file'
  name: string
  content: string
  locked: boolean
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
    | 'message.finished'
  >
  chatId?: string
  url: string
}

export type HookEventDetail = {
  id: string
  object: 'hook_event'
  event:
    | 'chat.created'
    | 'chat.updated'
    | 'chat.deleted'
    | 'message.created'
    | 'message.updated'
    | 'message.deleted'
    | 'message.finished'
  status?: 'pending' | 'success' | 'error'
  createdAt: string
}

export interface HookSummary {
  id: string
  object: 'hook'
  name: string
}

export interface IntegrationConnectionDetailSchema {
  object: 'integration_connection'
  id: string
  connected: boolean
  integration: {
    id: string
    object: 'integration'
    slug: string
    name: string
  }
  metadata?: Record<string, unknown>
}

export interface IntegrationConnectionListSchema {
  object: 'list'
  data: {
    object: 'integration_connection'
    id: string
    connected: boolean
    integration: {
      id: string
      object: 'integration'
      slug: string
      name: string
    }
  }[]
}

export interface IntegrationConnectionSummarySchema {
  object: 'integration_connection'
  id: string
  connected: boolean
  integration: {
    id: string
    object: 'integration'
    slug: string
    name: string
  }
}

export interface IntegrationDetailSchema {
  id: string
  object: 'integration'
  slug: string
  name: string
  description: string
  iconUrl: string
}

export interface IntegrationListSchema {
  object: 'list'
  data: {
    id: string
    object: 'integration'
    slug: string
    name: string
    description: string
    iconUrl: string
  }[]
}

export interface IntegrationSummarySchema {
  id: string
  object: 'integration'
  slug: string
  name: string
}

export type MessageDetail = {
  id: string
  object: 'message'
  content: string
  experimental_content?: Array<unknown[] | unknown[]>
  createdAt: string
  updatedAt?: string
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
  finishReason?:
    | 'stop'
    | 'length'
    | 'content-filter'
    | 'tool-calls'
    | 'error'
    | 'other'
    | 'unknown'
  apiUrl: string
  authorId: string | null
  parentId?: string | null
  attachments?: Array<{
    url: string
    name?: string
    contentType?: string
    size: number
    content?: string
    type?: 'screenshot' | 'figma' | 'zip'
  }>
  chatId: string
}

export type MessageSummary = {
  id: string
  object: 'message'
  content: string
  experimental_content?: Array<unknown[] | unknown[]>
  createdAt: string
  updatedAt?: string
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
  finishReason?:
    | 'stop'
    | 'length'
    | 'content-filter'
    | 'tool-calls'
    | 'error'
    | 'other'
    | 'unknown'
  apiUrl: string
  authorId: string | null
  parentId?: string | null
  attachments?: Array<{
    url: string
    name?: string
    contentType?: string
    size: number
    content?: string
    type?: 'screenshot' | 'figma' | 'zip'
  }>
}

export type MessageSummaryList = {
  object: 'list'
  data: Array<{
    id: string
    object: 'message'
    content: string
    experimental_content?: Array<unknown[] | unknown[]>
    createdAt: string
    updatedAt?: string
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
    finishReason?:
      | 'stop'
      | 'length'
      | 'content-filter'
      | 'tool-calls'
      | 'error'
      | 'other'
      | 'unknown'
    apiUrl: string
    authorId: string | null
    parentId?: string | null
    attachments?: Array<{
      url: string
      name?: string
      contentType?: string
      size: number
      content?: string
      type?: 'screenshot' | 'figma' | 'zip'
    }>
  }>
  pagination: {
    hasMore: boolean
    nextCursor?: string
    nextUrl?: string
  }
}

export interface NotificationPreferenceSchema {
  liveActivity: boolean
  pushNotifications: boolean
}

export interface ProductDetailSchema {
  object: 'product'
  id: string
  slug: string
  name: string
  description: string
  iconUrl: string
  iconBackgroundColor?: string
}

export interface ProductListSchema {
  object: 'list'
  data: {
    object: 'product'
    id: string
    slug: string
    name: string
    description: string
    iconUrl: string
  }[]
}

export interface ProductSummarySchema {
  object: 'product'
  id: string
  slug: string
  name: string
  description: string
  iconUrl: string
}

export type ProjectDetail = {
  id: string
  object: 'project'
  name: string
  privacy: 'private' | 'team'
  vercelProjectId?: string
  createdAt: string
  updatedAt?: string
  apiUrl: string
  webUrl: string
  description?: string
  instructions?: string
  chats: Array<{
    id: string
    object: 'chat'
    shareable: boolean
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
    name?: string
    /** @deprecated */
    title?: string
    createdAt: string
    updatedAt?: string
    favorite: boolean
    authorId: string
    projectId?: string
    webUrl: string
    apiUrl: string
    latestVersion?: {
      id: string
      object: 'version'
      status: 'pending' | 'completed' | 'failed'
      demoUrl?: string
      screenshotUrl?: string
      createdAt: string
      updatedAt?: string
    }
  }>
}

export type ProjectSummary = {
  id: string
  object: 'project'
  name: string
  privacy: 'private' | 'team'
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
  createdAt: string
  updatedAt?: string
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

export type UserPreferencesPostResponseSchema = {
  object: 'user_preferences'
  preferences:
    | {
        notifications: {
          liveActivity: boolean
          pushNotifications: boolean
        }
      }
    | unknown
}

export type UserPreferencesResponseSchema = {
  object: 'user_preferences'
  preferences:
    | {
        notifications: {
          liveActivity: boolean
          pushNotifications: boolean
        }
      }
    | unknown
}

export interface UserPreferencesSchema {
  notifications: {
    liveActivity: boolean
    pushNotifications: boolean
  }
}

export interface VercelProjectDetail {
  id: string
  object: 'vercel_project'
  name: string
}

export interface VercelProjectSummary {
  id: string
  object: 'vercel_project'
  name: string
}

export type VersionDetail = {
  id: string
  object: 'version'
  status: 'pending' | 'completed' | 'failed'
  demoUrl?: string
  screenshotUrl?: string
  createdAt: string
  updatedAt?: string
  files: {
    object: 'file'
    name: string
    content: string
    locked: boolean
  }[]
}

export type VersionSummary = {
  id: string
  object: 'version'
  status: 'pending' | 'completed' | 'failed'
  demoUrl?: string
  screenshotUrl?: string
  createdAt: string
  updatedAt?: string
}

export type VersionSummaryList = {
  object: 'list'
  data: Array<{
    id: string
    object: 'version'
    status: 'pending' | 'completed' | 'failed'
    demoUrl?: string
    screenshotUrl?: string
    createdAt: string
    updatedAt?: string
  }>
  pagination: {
    hasMore: boolean
    nextCursor?: string
    nextUrl?: string
  }
}

export interface UnauthorizedError {
  error: {
    message: string
    type: 'unauthorized_error'
  }
}

export interface ForbiddenError {
  error: {
    message: string
    type: 'forbidden_error'
  }
}

export interface NotFoundError {
  error: {
    message: string
    type: 'not_found_error'
  }
}

export interface ConflictError {
  error: {
    message: string
    type: 'conflict_error'
  }
}

export interface PayloadTooLargeError {
  error: {
    message: string
    type: 'payload_too_large_error'
  }
}

export interface UnprocessableEntityError {
  error: {
    message: string
    type: 'unprocessable_entity_error'
  }
}

export interface TooManyRequestsError {
  error: {
    message: string
    type: 'too_many_requests_error'
  }
}

export interface InternalServerError {
  error: {
    message: string
    type: 'internal_server_error'
  }
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
    /** @deprecated */
    modelId?: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg' | 'v0-gpt-5'
    imageGenerations?: boolean
    thinking?: boolean
  }
  responseMode?: 'sync' | 'async' | 'experimental_stream'
  designSystemId?: string | null
}

export type ChatsCreateResponse = ChatDetail

export type ChatsCreateStreamResponse = ReadableStream<Uint8Array>

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
            locked?: boolean
            content?: never
          }
        | {
            name: string
            content: string
            locked?: boolean
            url?: never
          }
      >
      repo?: never
      lockAllFiles?: never
      registry?: never
      zip?: never
      templateId?: never
    }
  | {
      type: 'repo'
      repo: {
        url: string
        branch?: string
      }
      lockAllFiles?: boolean
      files?: never
      registry?: never
      zip?: never
      templateId?: never
    }
  | {
      type: 'registry'
      registry: {
        url: string
      }
      lockAllFiles?: boolean
      files?: never
      repo?: never
      zip?: never
      templateId?: never
    }
  | {
      type: 'zip'
      zip: {
        url: string
      }
      lockAllFiles?: boolean
      files?: never
      repo?: never
      registry?: never
      templateId?: never
    }
  | {
      type: 'template'
      templateId: string
      files?: never
      repo?: never
      lockAllFiles?: never
      registry?: never
      zip?: never
    }
)

export type ChatsInitResponse = ChatDetail

export interface ChatsDeleteResponse {
  id: string
  object: 'chat'
  deleted: true
}

export type ChatsGetByIdResponse = ChatDetail

export interface ChatsUpdateRequest {
  name?: string
  privacy?: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
}

export type ChatsUpdateResponse = ChatDetail

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
  privacy?: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted'
}

export type ChatsForkResponse = ChatDetail

export type ProjectsGetByChatIdResponse = ProjectDetail

export interface ChatsFindMessagesResponse {
  object: 'list'
  data: MessageSummary[]
  pagination: {
    hasMore: boolean
    nextCursor?: string
    nextUrl?: string
  }
}

export interface ChatsSendMessageRequest {
  message: string
  attachments?: {
    url: string
  }[]
  modelConfiguration?: {
    /** @deprecated */
    modelId?: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg' | 'v0-gpt-5'
    imageGenerations?: boolean
    thinking?: boolean
  }
  responseMode?: 'sync' | 'async' | 'experimental_stream'
}

export type ChatsSendMessageResponse = ChatDetail

export type ChatsSendMessageStreamResponse = ReadableStream<Uint8Array>

export type ChatsGetMessageResponse = MessageDetail

export interface ChatsFindVersionsResponse {
  object: 'list'
  data: VersionSummary[]
  pagination: {
    hasMore: boolean
    nextCursor?: string
    nextUrl?: string
  }
}

export type ChatsGetVersionResponse = VersionDetail

export interface ChatsUpdateVersionRequest {
  files: {
    name: string
    content: string
    locked?: boolean
  }[]
}

export type ChatsUpdateVersionResponse = VersionDetail

export type ChatsResumeResponse = MessageDetail

export interface DeploymentsFindResponse {
  object: 'list'
  data: DeploymentDetail[]
}

export interface DeploymentsCreateRequest {
  projectId: string
  chatId: string
  versionId: string
}

export type DeploymentsCreateResponse = DeploymentDetail

export type DeploymentsGetByIdResponse = DeploymentDetail

export interface DeploymentsDeleteResponse {
  id: string
  object: 'deployment'
  deleted: true
}

export type DeploymentsFindLogsResponse = {
  logs: Array<{
    createdAt: string
    deploymentId: string
    id: string
    text: string
    type: 'stdout' | 'stderr'
    level?: 'error' | 'warning' | 'info'
    object: 'deployment_log'
  }>
  nextSince?: number
  object: 'list'
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
    | 'message.finished'
  >
  chatId?: string
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
    | 'message.finished'
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
  data: VercelProjectSummary[]
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
  vercelProjectId?: string
  privacy?: 'private' | 'team'
}

export type ProjectsCreateResponse = ProjectDetail

export type ProjectsGetByIdResponse = ProjectDetail

export interface ProjectsUpdateRequest {
  name?: string
  description?: string
  instructions?: string
  privacy?: 'private' | 'team'
}

export type ProjectsUpdateResponse = ProjectDetail

export interface ProjectsDeleteResponse {
  id: string
  object: 'project'
  deleted: true
}

export interface ProjectsAssignRequest {
  chatId: string
}

export interface ProjectsAssignResponse {
  object: 'project'
  id: string
  assigned: true
}

export interface ProjectsFindEnvVarsResponse {
  object: 'list'
  data: EnvironmentVariableSummarySchema[]
}

export interface ProjectsCreateEnvVarsRequest {
  environmentVariables: {
    key: string
    value: string
  }[]
  upsert?: boolean
}

export interface ProjectsCreateEnvVarsResponse {
  object: 'list'
  data: EnvironmentVariableSummarySchema[]
}

export interface ProjectsUpdateEnvVarsRequest {
  environmentVariables: {
    id: string
    value: string
  }[]
}

export interface ProjectsUpdateEnvVarsResponse {
  object: 'list'
  data: EnvironmentVariableSummarySchema[]
}

export interface ProjectsDeleteEnvVarsRequest {
  environmentVariableIds: string[]
}

export interface ProjectsDeleteEnvVarsResponse {
  object: 'list'
  data: {
    id: string
    object: 'environment_variable'
    deleted: true
  }[]
}

export interface ProjectsGetEnvVarResponse {
  object: 'environment_variable'
  data: EnvironmentVariableDetailSchema
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

export type ReportsGetUsageResponse = {
  object: 'list'
  data: Array<{
    id: string
    object: 'usage_event'
    type?:
      | 'image_generation'
      | 'message'
      | 'manual_debit'
      | 'api_request'
      | 'inline-edit'
    promptCost?: string
    completionCost?: string
    totalCost: string
    chatId?: string
    messageId?: string
    userId?: string
  }>
  pagination: {
    hasMore: boolean
    nextCursor?: string
    nextUrl?: string
  }
  meta: {
    totalCount: number
  }
}

export interface V0ClientConfig {
  apiKey?: string
  baseUrl?: string
}

export function createClient(config: V0ClientConfig = {}) {
  const fetcher = createFetcher(config)
  const streamingFetcher = createStreamingFetcher(config)

  return {
    chats: {
      async create(
        params: ChatsCreateRequest,
      ): Promise<ChatsCreateResponse | ChatsCreateStreamResponse> {
        const body = {
          message: params.message,
          attachments: params.attachments,
          system: params.system,
          chatPrivacy: params.chatPrivacy,
          projectId: params.projectId,
          modelConfiguration: params.modelConfiguration,
          responseMode: params.responseMode,
          designSystemId: params.designSystemId,
        }

        if (params.responseMode === 'experimental_stream') {
          return await streamingFetcher(`/chats`, 'POST', { body })
        }

        return fetcher(`/chats`, 'POST', { body })
      },

      async find(params?: {
        limit?: number
        offset?: number
        isFavorite?: boolean
      }): Promise<ChatsFindResponse> {
        const query = params
          ? (Object.fromEntries(
              Object.entries({
                limit:
                  params.limit !== undefined ? String(params.limit) : undefined,
                offset:
                  params.offset !== undefined
                    ? String(params.offset)
                    : undefined,
                isFavorite:
                  params.isFavorite !== undefined
                    ? String(params.isFavorite)
                    : undefined,
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
        const body = { versionId: params.versionId, privacy: params.privacy }
        return fetcher(`/chats/${pathParams.chatId}/fork`, 'POST', {
          pathParams,
          body,
        })
      },

      async findMessages(params: {
        chatId: string
        limit?: number
        cursor?: string
      }): Promise<ChatsFindMessagesResponse> {
        const pathParams = { chatId: params.chatId }
        const query = Object.fromEntries(
          Object.entries({
            limit:
              params.limit !== undefined ? String(params.limit) : undefined,
            cursor: params.cursor,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/chats/${pathParams.chatId}/messages`, 'GET', {
          pathParams,
          ...(hasQuery ? { query } : {}),
        })
      },

      async sendMessage(
        params: { chatId: string } & ChatsSendMessageRequest,
      ): Promise<ChatsSendMessageResponse | ChatsSendMessageStreamResponse> {
        const pathParams = { chatId: params.chatId }
        const body = {
          message: params.message,
          attachments: params.attachments,
          modelConfiguration: params.modelConfiguration,
          responseMode: params.responseMode,
        }

        if (params.responseMode === 'experimental_stream') {
          return await streamingFetcher(
            `/chats/${pathParams.chatId}/messages`,
            'POST',
            { pathParams, body },
          )
        }

        return fetcher(`/chats/${pathParams.chatId}/messages`, 'POST', {
          pathParams,
          body,
        })
      },

      async getMessage(params: {
        chatId: string
        messageId: string
      }): Promise<ChatsGetMessageResponse> {
        const pathParams = {
          chatId: params.chatId,
          messageId: params.messageId,
        }
        return fetcher(
          `/chats/${pathParams.chatId}/messages/${pathParams.messageId}`,
          'GET',
          { pathParams },
        )
      },

      async findVersions(params: {
        chatId: string
        limit?: number
        cursor?: string
      }): Promise<ChatsFindVersionsResponse> {
        const pathParams = { chatId: params.chatId }
        const query = Object.fromEntries(
          Object.entries({
            limit:
              params.limit !== undefined ? String(params.limit) : undefined,
            cursor: params.cursor,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/chats/${pathParams.chatId}/versions`, 'GET', {
          pathParams,
          ...(hasQuery ? { query } : {}),
        })
      },

      async getVersion(params: {
        chatId: string
        versionId: string
        includeDefaultFiles?: boolean
      }): Promise<ChatsGetVersionResponse> {
        const pathParams = {
          chatId: params.chatId,
          versionId: params.versionId,
        }
        const query = Object.fromEntries(
          Object.entries({
            includeDefaultFiles:
              params.includeDefaultFiles !== undefined
                ? String(params.includeDefaultFiles)
                : undefined,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const hasQuery = Object.keys(query).length > 0
        return fetcher(
          `/chats/${pathParams.chatId}/versions/${pathParams.versionId}`,
          'GET',
          { pathParams, ...(hasQuery ? { query } : {}) },
        )
      },

      async updateVersion(
        params: {
          chatId: string
          versionId: string
        } & ChatsUpdateVersionRequest,
      ): Promise<ChatsUpdateVersionResponse> {
        const pathParams = {
          chatId: params.chatId,
          versionId: params.versionId,
        }
        const body = { files: params.files }
        return fetcher(
          `/chats/${pathParams.chatId}/versions/${pathParams.versionId}`,
          'PATCH',
          { pathParams, body },
        )
      },

      async downloadVersion(params: {
        chatId: string
        versionId: string
        format?: 'zip' | 'tarball'
        includeDefaultFiles?: boolean
      }): Promise<ArrayBuffer> {
        const pathParams = {
          chatId: params.chatId,
          versionId: params.versionId,
        }
        const query = Object.fromEntries(
          Object.entries({
            format: params.format,
            includeDefaultFiles:
              params.includeDefaultFiles !== undefined
                ? String(params.includeDefaultFiles)
                : undefined,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const hasQuery = Object.keys(query).length > 0
        return fetcher(
          `/chats/${pathParams.chatId}/versions/${pathParams.versionId}/download`,
          'GET',
          { pathParams, ...(hasQuery ? { query } : {}) },
        )
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
          vercelProjectId: params.vercelProjectId,
          privacy: params.privacy,
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

      async update(
        params: { projectId: string } & ProjectsUpdateRequest,
      ): Promise<ProjectsUpdateResponse> {
        const pathParams = { projectId: params.projectId }
        const body = {
          name: params.name,
          description: params.description,
          instructions: params.instructions,
          privacy: params.privacy,
        }
        return fetcher(`/projects/${pathParams.projectId}`, 'PATCH', {
          pathParams,
          body,
        })
      },

      async delete(params: {
        projectId: string
      }): Promise<ProjectsDeleteResponse> {
        const pathParams = { projectId: params.projectId }
        return fetcher(`/projects/${pathParams.projectId}`, 'DELETE', {
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

      async findEnvVars(params: {
        projectId: string
        decrypted?: boolean
      }): Promise<ProjectsFindEnvVarsResponse> {
        const pathParams = { projectId: params.projectId }
        const query = Object.fromEntries(
          Object.entries({
            decrypted:
              params.decrypted !== undefined
                ? String(params.decrypted)
                : undefined,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/projects/${pathParams.projectId}/env-vars`, 'GET', {
          pathParams,
          ...(hasQuery ? { query } : {}),
        })
      },

      async createEnvVars(
        params: {
          projectId: string
          decrypted?: boolean
        } & ProjectsCreateEnvVarsRequest,
      ): Promise<ProjectsCreateEnvVarsResponse> {
        const pathParams = { projectId: params.projectId }
        const query = Object.fromEntries(
          Object.entries({
            decrypted:
              params.decrypted !== undefined
                ? String(params.decrypted)
                : undefined,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const body = {
          environmentVariables: params.environmentVariables,
          upsert: params.upsert,
        }
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/projects/${pathParams.projectId}/env-vars`, 'POST', {
          pathParams,
          ...(hasQuery ? { query } : {}),
          body,
        })
      },

      async updateEnvVars(
        params: {
          projectId: string
          decrypted?: boolean
        } & ProjectsUpdateEnvVarsRequest,
      ): Promise<ProjectsUpdateEnvVarsResponse> {
        const pathParams = { projectId: params.projectId }
        const query = Object.fromEntries(
          Object.entries({
            decrypted:
              params.decrypted !== undefined
                ? String(params.decrypted)
                : undefined,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const body = { environmentVariables: params.environmentVariables }
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/projects/${pathParams.projectId}/env-vars`, 'PATCH', {
          pathParams,
          ...(hasQuery ? { query } : {}),
          body,
        })
      },

      async deleteEnvVars(
        params: { projectId: string } & ProjectsDeleteEnvVarsRequest,
      ): Promise<ProjectsDeleteEnvVarsResponse> {
        const pathParams = { projectId: params.projectId }
        const body = { environmentVariableIds: params.environmentVariableIds }
        return fetcher(
          `/projects/${pathParams.projectId}/env-vars/delete`,
          'POST',
          { pathParams, body },
        )
      },

      async getEnvVar(params: {
        projectId: string
        environmentVariableId: string
        decrypted?: boolean
      }): Promise<ProjectsGetEnvVarResponse> {
        const pathParams = {
          projectId: params.projectId,
          environmentVariableId: params.environmentVariableId,
        }
        const query = Object.fromEntries(
          Object.entries({
            decrypted:
              params.decrypted !== undefined
                ? String(params.decrypted)
                : undefined,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        const hasQuery = Object.keys(query).length > 0
        return fetcher(
          `/projects/${pathParams.projectId}/env-vars/${pathParams.environmentVariableId}`,
          'GET',
          { pathParams, ...(hasQuery ? { query } : {}) },
        )
      },
    },

    deployments: {
      async find(params: {
        projectId: string
        chatId: string
        versionId: string
      }): Promise<DeploymentsFindResponse> {
        const query = Object.fromEntries(
          Object.entries({
            projectId: params.projectId,
            chatId: params.chatId,
            versionId: params.versionId,
          }).filter(([_, value]) => value !== undefined),
        ) as Record<string, string>
        return fetcher(`/deployments`, 'GET', { query })
      },

      async create(
        params: DeploymentsCreateRequest,
      ): Promise<DeploymentsCreateResponse> {
        const body = {
          projectId: params.projectId,
          chatId: params.chatId,
          versionId: params.versionId,
        }
        return fetcher(`/deployments`, 'POST', { body })
      },

      async getById(params: {
        deploymentId: string
      }): Promise<DeploymentsGetByIdResponse> {
        const pathParams = { deploymentId: params.deploymentId }
        return fetcher(`/deployments/${pathParams.deploymentId}`, 'GET', {
          pathParams,
        })
      },

      async delete(params: {
        deploymentId: string
      }): Promise<DeploymentsDeleteResponse> {
        const pathParams = { deploymentId: params.deploymentId }
        return fetcher(`/deployments/${pathParams.deploymentId}`, 'DELETE', {
          pathParams,
        })
      },

      async findLogs(params: {
        deploymentId: string
        since?: number
      }): Promise<DeploymentsFindLogsResponse> {
        const pathParams = { deploymentId: params.deploymentId }
        const query = Object.fromEntries(
          Object.entries({
            since:
              params.since !== undefined ? String(params.since) : undefined,
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

    reports: {
      async getUsage(params?: {
        startDate?: string
        endDate?: string
        chatId?: string
        messageId?: string
        limit?: number
        cursor?: string
      }): Promise<ReportsGetUsageResponse> {
        const query = params
          ? (Object.fromEntries(
              Object.entries({
                startDate: params.startDate,
                endDate: params.endDate,
                chatId: params.chatId,
                messageId: params.messageId,
                limit:
                  params.limit !== undefined ? String(params.limit) : undefined,
                cursor: params.cursor,
              }).filter(([_, value]) => value !== undefined),
            ) as Record<string, string>)
          : {}
        const hasQuery = Object.keys(query).length > 0
        return fetcher(`/reports/usage`, 'GET', {
          ...(hasQuery ? { query } : {}),
        })
      },
    },
  }
}

// Default client for backward compatibility
export const v0 = createClient()
