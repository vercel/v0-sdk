// This file is generated from packages/v0-sdk/openapi.json. Do not edit.

import {
  chatsCreateFromFilesResponseTransformer,
  chatsCreateFromRepoResponseTransformer,
  chatsCreateFromZipResponseTransformer,
  chatsCreateResponseTransformer,
  chatsDuplicateResponseTransformer,
  chatsGetPreviewResponseTransformer,
  chatsGetResponseTransformer,
  chatsListResponseTransformer,
  chatsRestoreMessageResponseTransformer,
  chatsUpdateFilesResponseTransformer,
  chatsUpdateResponseTransformer,
  mcpServersCreateResponseTransformer,
  mcpServersGetResponseTransformer,
  mcpServersListResponseTransformer,
  mcpServersUpdateResponseTransformer,
  messagesGetResponseTransformer,
  messagesListResponseTransformer,
  messagesResolveResponseTransformer,
  messagesSendResponseTransformer,
  webhooksCreateResponseTransformer,
  webhooksGetResponseTransformer,
  webhooksUpdateResponseTransformer,
} from 'v0/browser'
import type {
  ChatsCreateAsyncData,
  ChatsCreateAsyncError,
  ChatsCreateAsyncResponse,
  ChatsCreateData,
  ChatsCreateError,
  ChatsCreateFromFilesData,
  ChatsCreateFromFilesError,
  ChatsCreateFromFilesResponse,
  ChatsCreateFromRepoData,
  ChatsCreateFromRepoError,
  ChatsCreateFromRepoResponse,
  ChatsCreateFromZipData,
  ChatsCreateFromZipError,
  ChatsCreateFromZipResponse,
  ChatsCreateResponse,
  ChatsCreateStreamData,
  ChatsCreateStreamError,
  ChatsCreateVercelProjectData,
  ChatsCreateVercelProjectError,
  ChatsCreateVercelProjectResponse,
  ChatsDeleteError,
  ChatsDeleteResponse,
  ChatsDeployError,
  ChatsDeployResponse,
  ChatsDownloadFilesError,
  ChatsDuplicateData,
  ChatsDuplicateError,
  ChatsDuplicateResponse,
  ChatsGetConnectStatusData,
  ChatsGetConnectStatusError,
  ChatsGetConnectStatusResponse,
  ChatsGetError,
  ChatsGetFilesError,
  ChatsGetFilesResponse,
  ChatsGetPreviewError,
  ChatsGetPreviewResponse,
  ChatsGetResponse,
  ChatsListData,
  ChatsListError,
  ChatsListResponse,
  ChatsRestoreMessageData,
  ChatsRestoreMessageError,
  ChatsRestoreMessageResponse,
  ChatsResumeError,
  ChatsUpdateData,
  ChatsUpdateError,
  ChatsUpdateFilesData,
  ChatsUpdateFilesError,
  ChatsUpdateFilesResponse,
  ChatsUpdateResponse,
  McpServersCreateData,
  McpServersCreateError,
  McpServersCreateResponse,
  McpServersDeleteError,
  McpServersDeleteResponse,
  McpServersGetError,
  McpServersGetResponse,
  McpServersListError,
  McpServersListResponse,
  McpServersUpdateData,
  McpServersUpdateError,
  McpServersUpdateResponse,
  MessagesGetError,
  MessagesGetResponse,
  MessagesListData,
  MessagesListError,
  MessagesListResponse,
  MessagesResolveAsyncData,
  MessagesResolveAsyncError,
  MessagesResolveAsyncResponse,
  MessagesResolveData,
  MessagesResolveError,
  MessagesResolveResponse,
  MessagesResolveStreamData,
  MessagesResolveStreamError,
  MessagesSendAsyncData,
  MessagesSendAsyncError,
  MessagesSendAsyncResponse,
  MessagesSendData,
  MessagesSendError,
  MessagesSendResponse,
  MessagesSendStreamData,
  MessagesSendStreamError,
  MessagesStopError,
  MessagesStopResponse,
  SettingsGetPreviewHostsError,
  SettingsGetPreviewHostsResponse,
  SettingsSetPreviewHostsData,
  SettingsSetPreviewHostsError,
  SettingsSetPreviewHostsResponse,
  WebhooksCreateData,
  WebhooksCreateError,
  WebhooksCreateResponse,
  WebhooksDeleteError,
  WebhooksDeleteResponse,
  WebhooksGetError,
  WebhooksGetResponse,
  WebhooksListError,
  WebhooksListResponse,
  WebhooksUpdateData,
  WebhooksUpdateError,
  WebhooksUpdateResponse,
} from 'v0/browser'

import type { V0Operation } from '../request'
import { useV0CursorQuery, useV0Mutation, useV0Query } from '../swr-runtime'
import type {
  V0InfiniteConfiguration,
  V0MutationConfiguration,
  V0QueryConfiguration,
  V0Url,
} from '../swr-runtime'

export const V0_REACT_OPERATION_HOOKS = {
  'chats.create': 'useCreateChatBlocking',
  'chats.createAsync': 'useCreateChatAsync',
  'chats.createFromFiles': 'useCreateChatFromFiles',
  'chats.createFromRepo': 'useCreateChatFromRepo',
  'chats.createFromZip': 'useCreateChatFromZip',
  'chats.createStream': 'useCreateChat',
  'chats.createVercelProject': 'useCreateProject',
  'chats.delete': 'useDeleteChat',
  'chats.deploy': 'useDeployChat',
  'chats.downloadFiles': 'useDownloadChatFiles',
  'chats.duplicate': 'useDuplicateChat',
  'chats.get': 'useChat',
  'chats.getConnectStatus': 'useConnectStatus',
  'chats.getFiles': 'useFiles',
  'chats.getPreview': 'usePreview',
  'chats.list': 'useChats',
  'chats.restoreMessage': 'useRestoreMessage',
  'chats.resume': 'useResumeChat',
  'chats.update': 'useUpdateChat',
  'chats.updateFiles': 'useUpdateChatFiles',
  'mcpServers.create': 'useCreateMcpServer',
  'mcpServers.delete': 'useDeleteMcpServer',
  'mcpServers.get': 'useMcpServer',
  'mcpServers.list': 'useMcpServers',
  'mcpServers.update': 'useUpdateMcpServer',
  'messages.get': 'useMessage',
  'messages.list': 'useMessages',
  'messages.resolve': 'useResolveTaskBlocking',
  'messages.resolveAsync': 'useResolveTaskAsync',
  'messages.resolveStream': 'useResolveTask',
  'messages.send': 'useSendMessageBlocking',
  'messages.sendAsync': 'useSendMessageAsync',
  'messages.sendStream': 'useSendMessage',
  'messages.stop': 'useStopMessage',
  'settings.getPreviewHosts': 'usePreviewHosts',
  'settings.setPreviewHosts': 'useSetPreviewHosts',
  'webhooks.create': 'useCreateWebhook',
  'webhooks.delete': 'useDeleteWebhook',
  'webhooks.get': 'useWebhook',
  'webhooks.list': 'useWebhooks',
  'webhooks.update': 'useUpdateWebhook',
} as const

const createChatBlockingOperation: V0Operation<ChatsCreateResponse> = {
  id: 'chats.create',
  method: 'POST',
  response: 'json',
  transform: chatsCreateResponseTransformer,
}

export type CreateChatBlockingInput = ChatsCreateData['body']
export function useCreateChatBlocking(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsCreateResponse,
    ChatsCreateError,
    ChatsCreateData['body']
  > = {},
) {
  return useV0Mutation(createChatBlockingOperation, url, configuration)
}

const createChatAsyncOperation: V0Operation<ChatsCreateAsyncResponse> = {
  id: 'chats.createAsync',
  method: 'POST',
  response: 'json',
}

export type CreateChatAsyncInput = ChatsCreateAsyncData['body']
export function useCreateChatAsync(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsCreateAsyncResponse,
    ChatsCreateAsyncError,
    ChatsCreateAsyncData['body']
  > = {},
) {
  return useV0Mutation(createChatAsyncOperation, url, configuration)
}

const createChatFromFilesOperation: V0Operation<ChatsCreateFromFilesResponse> = {
  id: 'chats.createFromFiles',
  method: 'POST',
  response: 'json',
  transform: chatsCreateFromFilesResponseTransformer,
}

export type CreateChatFromFilesInput = ChatsCreateFromFilesData['body']
export function useCreateChatFromFiles(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsCreateFromFilesResponse,
    ChatsCreateFromFilesError,
    ChatsCreateFromFilesData['body']
  > = {},
) {
  return useV0Mutation(createChatFromFilesOperation, url, configuration)
}

const createChatFromRepoOperation: V0Operation<ChatsCreateFromRepoResponse> = {
  id: 'chats.createFromRepo',
  method: 'POST',
  response: 'json',
  transform: chatsCreateFromRepoResponseTransformer,
}

export type CreateChatFromRepoInput = ChatsCreateFromRepoData['body']
export function useCreateChatFromRepo(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsCreateFromRepoResponse,
    ChatsCreateFromRepoError,
    ChatsCreateFromRepoData['body']
  > = {},
) {
  return useV0Mutation(createChatFromRepoOperation, url, configuration)
}

const createChatFromZipOperation: V0Operation<ChatsCreateFromZipResponse> = {
  id: 'chats.createFromZip',
  method: 'POST',
  response: 'json',
  transform: chatsCreateFromZipResponseTransformer,
}

export type CreateChatFromZipInput = ChatsCreateFromZipData['body']
export function useCreateChatFromZip(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsCreateFromZipResponse,
    ChatsCreateFromZipError,
    ChatsCreateFromZipData['body']
  > = {},
) {
  return useV0Mutation(createChatFromZipOperation, url, configuration)
}

const createChatOperation: V0Operation<Response> = {
  id: 'chats.createStream',
  method: 'POST',
  response: 'stream',
}

export type CreateChatInput = ChatsCreateStreamData['body']
export function useCreateChat(
  url: string,
  configuration: V0MutationConfiguration<
    Response,
    ChatsCreateStreamError,
    ChatsCreateStreamData['body']
  > = {},
) {
  return useV0Mutation(createChatOperation, url, configuration)
}

const createProjectOperation: V0Operation<ChatsCreateVercelProjectResponse> = {
  id: 'chats.createVercelProject',
  method: 'POST',
  response: 'json',
}

export type CreateProjectInput = ChatsCreateVercelProjectData['body']
export function useCreateProject(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsCreateVercelProjectResponse,
    ChatsCreateVercelProjectError,
    ChatsCreateVercelProjectData['body']
  > = {},
) {
  return useV0Mutation(createProjectOperation, url, configuration)
}

const deleteChatOperation: V0Operation<ChatsDeleteResponse> = {
  id: 'chats.delete',
  method: 'DELETE',
  response: 'json',
  invalidates: ['chats.list'],
}

export function useDeleteChat(
  url: string,
  configuration: V0MutationConfiguration<ChatsDeleteResponse, ChatsDeleteError, never> = {},
) {
  return useV0Mutation(deleteChatOperation, url, configuration)
}

const deployChatOperation: V0Operation<ChatsDeployResponse> = {
  id: 'chats.deploy',
  method: 'POST',
  response: 'json',
}

export function useDeployChat(
  url: string,
  configuration: V0MutationConfiguration<ChatsDeployResponse, ChatsDeployError, never> = {},
) {
  return useV0Mutation(deployChatOperation, url, configuration)
}

const downloadChatFilesOperation: V0Operation<Blob> = {
  id: 'chats.downloadFiles',
  method: 'GET',
  response: 'blob',
}

export function useDownloadChatFiles(
  url: string,
  configuration: V0MutationConfiguration<Blob, ChatsDownloadFilesError, never> = {},
) {
  return useV0Mutation(downloadChatFilesOperation, url, configuration)
}

const duplicateChatOperation: V0Operation<ChatsDuplicateResponse> = {
  id: 'chats.duplicate',
  method: 'POST',
  response: 'json',
  transform: chatsDuplicateResponseTransformer,
}

export type DuplicateChatInput = ChatsDuplicateData['body']
export function useDuplicateChat(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsDuplicateResponse,
    ChatsDuplicateError,
    ChatsDuplicateData['body']
  > = {},
) {
  return useV0Mutation(duplicateChatOperation, url, configuration)
}

const chatOperation: V0Operation<ChatsGetResponse> = {
  id: 'chats.get',
  method: 'GET',
  response: 'json',
  transform: chatsGetResponseTransformer,
}

export function useChat(
  url: V0Url,
  configuration: V0QueryConfiguration<ChatsGetResponse, ChatsGetError> = {},
) {
  return useV0Query<ChatsGetResponse, ChatsGetError, undefined>(
    chatOperation,
    url,
    undefined,
    configuration,
  )
}

const connectStatusOperation: V0Operation<ChatsGetConnectStatusResponse> = {
  id: 'chats.getConnectStatus',
  method: 'GET',
  response: 'json',
}

export function useConnectStatus(
  url: V0Url,
  params: NonNullable<ChatsGetConnectStatusData['query']>,
  configuration: V0QueryConfiguration<
    ChatsGetConnectStatusResponse,
    ChatsGetConnectStatusError
  > = {},
) {
  return useV0Query<
    ChatsGetConnectStatusResponse,
    ChatsGetConnectStatusError,
    NonNullable<ChatsGetConnectStatusData['query']>
  >(connectStatusOperation, url, params, configuration)
}

const filesOperation: V0Operation<ChatsGetFilesResponse> = {
  id: 'chats.getFiles',
  method: 'GET',
  response: 'json',
}

export function useFiles(
  url: V0Url,
  configuration: V0QueryConfiguration<ChatsGetFilesResponse, ChatsGetFilesError> = {},
) {
  return useV0Query<ChatsGetFilesResponse, ChatsGetFilesError, undefined>(
    filesOperation,
    url,
    undefined,
    configuration,
  )
}

const previewOperation: V0Operation<ChatsGetPreviewResponse> = {
  id: 'chats.getPreview',
  method: 'GET',
  response: 'json',
  transform: chatsGetPreviewResponseTransformer,
}

export function usePreview(
  url: V0Url,
  configuration: V0QueryConfiguration<ChatsGetPreviewResponse, ChatsGetPreviewError> = {},
) {
  return useV0Query<ChatsGetPreviewResponse, ChatsGetPreviewError, undefined>(
    previewOperation,
    url,
    undefined,
    configuration,
  )
}

const chatsOperation: V0Operation<ChatsListResponse> = {
  id: 'chats.list',
  method: 'GET',
  response: 'json',
  transform: chatsListResponseTransformer,
}

export function useChats(
  url: V0Url,
  params?: NonNullable<ChatsListData['query']>,
  configuration: V0QueryConfiguration<ChatsListResponse, ChatsListError> = {},
) {
  return useV0Query<
    ChatsListResponse,
    ChatsListError,
    NonNullable<ChatsListData['query']> | undefined
  >(chatsOperation, url, params, configuration)
}

export function useChatsInfinite(
  url: V0Url,
  params?: Omit<NonNullable<ChatsListData['query']>, 'cursor'>,
  configuration: V0InfiniteConfiguration<ChatsListResponse, ChatsListError> = {},
) {
  return useV0CursorQuery(chatsOperation, url, params ?? {}, (page) => page.cursor, configuration)
}

const restoreMessageOperation: V0Operation<ChatsRestoreMessageResponse> = {
  id: 'chats.restoreMessage',
  method: 'POST',
  response: 'json',
  transform: chatsRestoreMessageResponseTransformer,
  invalidates: ['chats.getFiles', 'messages.list'],
}

export type RestoreMessageInput = ChatsRestoreMessageData['body']
export function useRestoreMessage(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsRestoreMessageResponse,
    ChatsRestoreMessageError,
    ChatsRestoreMessageData['body']
  > = {},
) {
  return useV0Mutation(restoreMessageOperation, url, configuration)
}

const resumeChatOperation: V0Operation<Response> = {
  id: 'chats.resume',
  method: 'POST',
  response: 'stream',
}

export function useResumeChat(
  url: string,
  configuration: V0MutationConfiguration<Response, ChatsResumeError, never> = {},
) {
  return useV0Mutation(resumeChatOperation, url, configuration)
}

const updateChatOperation: V0Operation<ChatsUpdateResponse> = {
  id: 'chats.update',
  method: 'PATCH',
  response: 'json',
  transform: chatsUpdateResponseTransformer,
  invalidates: ['chats.get', 'chats.list'],
}

export type UpdateChatInput = ChatsUpdateData['body']
export function useUpdateChat(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsUpdateResponse,
    ChatsUpdateError,
    ChatsUpdateData['body']
  > = {},
) {
  return useV0Mutation(updateChatOperation, url, configuration)
}

const updateChatFilesOperation: V0Operation<ChatsUpdateFilesResponse> = {
  id: 'chats.updateFiles',
  method: 'PATCH',
  response: 'json',
  transform: chatsUpdateFilesResponseTransformer,
  invalidates: ['chats.getFiles', 'messages.list'],
}

export type UpdateChatFilesInput = ChatsUpdateFilesData['body']
export function useUpdateChatFiles(
  url: string,
  configuration: V0MutationConfiguration<
    ChatsUpdateFilesResponse,
    ChatsUpdateFilesError,
    ChatsUpdateFilesData['body']
  > = {},
) {
  return useV0Mutation(updateChatFilesOperation, url, configuration)
}

const createMcpServerOperation: V0Operation<McpServersCreateResponse> = {
  id: 'mcpServers.create',
  method: 'POST',
  response: 'json',
  transform: mcpServersCreateResponseTransformer,
}

export type CreateMcpServerInput = McpServersCreateData['body']
export function useCreateMcpServer(
  url: string,
  configuration: V0MutationConfiguration<
    McpServersCreateResponse,
    McpServersCreateError,
    McpServersCreateData['body']
  > = {},
) {
  return useV0Mutation(createMcpServerOperation, url, configuration)
}

const deleteMcpServerOperation: V0Operation<McpServersDeleteResponse> = {
  id: 'mcpServers.delete',
  method: 'DELETE',
  response: 'json',
}

export function useDeleteMcpServer(
  url: string,
  configuration: V0MutationConfiguration<
    McpServersDeleteResponse,
    McpServersDeleteError,
    never
  > = {},
) {
  return useV0Mutation(deleteMcpServerOperation, url, configuration)
}

const mcpServerOperation: V0Operation<McpServersGetResponse> = {
  id: 'mcpServers.get',
  method: 'GET',
  response: 'json',
  transform: mcpServersGetResponseTransformer,
}

export function useMcpServer(
  url: V0Url,
  configuration: V0QueryConfiguration<McpServersGetResponse, McpServersGetError> = {},
) {
  return useV0Query<McpServersGetResponse, McpServersGetError, undefined>(
    mcpServerOperation,
    url,
    undefined,
    configuration,
  )
}

const mcpServersOperation: V0Operation<McpServersListResponse> = {
  id: 'mcpServers.list',
  method: 'GET',
  response: 'json',
  transform: mcpServersListResponseTransformer,
}

export function useMcpServers(
  url: V0Url,
  configuration: V0QueryConfiguration<McpServersListResponse, McpServersListError> = {},
) {
  return useV0Query<McpServersListResponse, McpServersListError, undefined>(
    mcpServersOperation,
    url,
    undefined,
    configuration,
  )
}

const updateMcpServerOperation: V0Operation<McpServersUpdateResponse> = {
  id: 'mcpServers.update',
  method: 'PATCH',
  response: 'json',
  transform: mcpServersUpdateResponseTransformer,
}

export type UpdateMcpServerInput = McpServersUpdateData['body']
export function useUpdateMcpServer(
  url: string,
  configuration: V0MutationConfiguration<
    McpServersUpdateResponse,
    McpServersUpdateError,
    McpServersUpdateData['body']
  > = {},
) {
  return useV0Mutation(updateMcpServerOperation, url, configuration)
}

const messageOperation: V0Operation<MessagesGetResponse> = {
  id: 'messages.get',
  method: 'GET',
  response: 'json',
  transform: messagesGetResponseTransformer,
}

export function useMessage(
  url: V0Url,
  configuration: V0QueryConfiguration<MessagesGetResponse, MessagesGetError> = {},
) {
  return useV0Query<MessagesGetResponse, MessagesGetError, undefined>(
    messageOperation,
    url,
    undefined,
    configuration,
  )
}

const messagesOperation: V0Operation<MessagesListResponse> = {
  id: 'messages.list',
  method: 'GET',
  response: 'json',
  transform: messagesListResponseTransformer,
}

export function useMessages(
  url: V0Url,
  params: NonNullable<MessagesListData['query']>,
  configuration: V0QueryConfiguration<MessagesListResponse, MessagesListError> = {},
) {
  return useV0Query<
    MessagesListResponse,
    MessagesListError,
    NonNullable<MessagesListData['query']>
  >(messagesOperation, url, params, configuration)
}

export function useMessagesInfinite(
  url: V0Url,
  params: Omit<NonNullable<MessagesListData['query']>, 'cursor'>,
  configuration: V0InfiniteConfiguration<MessagesListResponse, MessagesListError> = {},
) {
  return useV0CursorQuery(messagesOperation, url, params, (page) => page.cursor, configuration)
}

const resolveTaskBlockingOperation: V0Operation<MessagesResolveResponse> = {
  id: 'messages.resolve',
  method: 'POST',
  response: 'json',
  transform: messagesResolveResponseTransformer,
}

export type ResolveTaskBlockingInput = MessagesResolveData['body']
export function useResolveTaskBlocking(
  url: string,
  configuration: V0MutationConfiguration<
    MessagesResolveResponse,
    MessagesResolveError,
    MessagesResolveData['body']
  > = {},
) {
  return useV0Mutation(resolveTaskBlockingOperation, url, configuration)
}

const resolveTaskAsyncOperation: V0Operation<MessagesResolveAsyncResponse> = {
  id: 'messages.resolveAsync',
  method: 'POST',
  response: 'json',
}

export type ResolveTaskAsyncInput = MessagesResolveAsyncData['body']
export function useResolveTaskAsync(
  url: string,
  configuration: V0MutationConfiguration<
    MessagesResolveAsyncResponse,
    MessagesResolveAsyncError,
    MessagesResolveAsyncData['body']
  > = {},
) {
  return useV0Mutation(resolveTaskAsyncOperation, url, configuration)
}

const resolveTaskOperation: V0Operation<Response> = {
  id: 'messages.resolveStream',
  method: 'POST',
  response: 'stream',
}

export type ResolveTaskInput = MessagesResolveStreamData['body']
export function useResolveTask(
  url: string,
  configuration: V0MutationConfiguration<
    Response,
    MessagesResolveStreamError,
    MessagesResolveStreamData['body']
  > = {},
) {
  return useV0Mutation(resolveTaskOperation, url, configuration)
}

const sendMessageBlockingOperation: V0Operation<MessagesSendResponse> = {
  id: 'messages.send',
  method: 'POST',
  response: 'json',
  transform: messagesSendResponseTransformer,
}

export type SendMessageBlockingInput = MessagesSendData['body']
export function useSendMessageBlocking(
  url: string,
  configuration: V0MutationConfiguration<
    MessagesSendResponse,
    MessagesSendError,
    MessagesSendData['body']
  > = {},
) {
  return useV0Mutation(sendMessageBlockingOperation, url, configuration)
}

const sendMessageAsyncOperation: V0Operation<MessagesSendAsyncResponse> = {
  id: 'messages.sendAsync',
  method: 'POST',
  response: 'json',
}

export type SendMessageAsyncInput = MessagesSendAsyncData['body']
export function useSendMessageAsync(
  url: string,
  configuration: V0MutationConfiguration<
    MessagesSendAsyncResponse,
    MessagesSendAsyncError,
    MessagesSendAsyncData['body']
  > = {},
) {
  return useV0Mutation(sendMessageAsyncOperation, url, configuration)
}

const sendMessageOperation: V0Operation<Response> = {
  id: 'messages.sendStream',
  method: 'POST',
  response: 'stream',
}

export type SendMessageInput = MessagesSendStreamData['body']
export function useSendMessage(
  url: string,
  configuration: V0MutationConfiguration<
    Response,
    MessagesSendStreamError,
    MessagesSendStreamData['body']
  > = {},
) {
  return useV0Mutation(sendMessageOperation, url, configuration)
}

const stopMessageOperation: V0Operation<MessagesStopResponse> = {
  id: 'messages.stop',
  method: 'POST',
  response: 'json',
}

export function useStopMessage(
  url: string,
  configuration: V0MutationConfiguration<MessagesStopResponse, MessagesStopError, never> = {},
) {
  return useV0Mutation(stopMessageOperation, url, configuration)
}

const previewHostsOperation: V0Operation<SettingsGetPreviewHostsResponse> = {
  id: 'settings.getPreviewHosts',
  method: 'GET',
  response: 'json',
}

export function usePreviewHosts(
  url: V0Url,
  configuration: V0QueryConfiguration<
    SettingsGetPreviewHostsResponse,
    SettingsGetPreviewHostsError
  > = {},
) {
  return useV0Query<SettingsGetPreviewHostsResponse, SettingsGetPreviewHostsError, undefined>(
    previewHostsOperation,
    url,
    undefined,
    configuration,
  )
}

const setPreviewHostsOperation: V0Operation<SettingsSetPreviewHostsResponse> = {
  id: 'settings.setPreviewHosts',
  method: 'PUT',
  response: 'json',
}

export type SetPreviewHostsInput = SettingsSetPreviewHostsData['body']
export function useSetPreviewHosts(
  url: string,
  configuration: V0MutationConfiguration<
    SettingsSetPreviewHostsResponse,
    SettingsSetPreviewHostsError,
    SettingsSetPreviewHostsData['body']
  > = {},
) {
  return useV0Mutation(setPreviewHostsOperation, url, configuration)
}

const createWebhookOperation: V0Operation<WebhooksCreateResponse> = {
  id: 'webhooks.create',
  method: 'POST',
  response: 'json',
  transform: webhooksCreateResponseTransformer,
}

export type CreateWebhookInput = WebhooksCreateData['body']
export function useCreateWebhook(
  url: string,
  configuration: V0MutationConfiguration<
    WebhooksCreateResponse,
    WebhooksCreateError,
    WebhooksCreateData['body']
  > = {},
) {
  return useV0Mutation(createWebhookOperation, url, configuration)
}

const deleteWebhookOperation: V0Operation<WebhooksDeleteResponse> = {
  id: 'webhooks.delete',
  method: 'DELETE',
  response: 'json',
}

export function useDeleteWebhook(
  url: string,
  configuration: V0MutationConfiguration<WebhooksDeleteResponse, WebhooksDeleteError, never> = {},
) {
  return useV0Mutation(deleteWebhookOperation, url, configuration)
}

const webhookOperation: V0Operation<WebhooksGetResponse> = {
  id: 'webhooks.get',
  method: 'GET',
  response: 'json',
  transform: webhooksGetResponseTransformer,
}

export function useWebhook(
  url: V0Url,
  configuration: V0QueryConfiguration<WebhooksGetResponse, WebhooksGetError> = {},
) {
  return useV0Query<WebhooksGetResponse, WebhooksGetError, undefined>(
    webhookOperation,
    url,
    undefined,
    configuration,
  )
}

const webhooksOperation: V0Operation<WebhooksListResponse> = {
  id: 'webhooks.list',
  method: 'GET',
  response: 'json',
}

export function useWebhooks(
  url: V0Url,
  configuration: V0QueryConfiguration<WebhooksListResponse, WebhooksListError> = {},
) {
  return useV0Query<WebhooksListResponse, WebhooksListError, undefined>(
    webhooksOperation,
    url,
    undefined,
    configuration,
  )
}

const updateWebhookOperation: V0Operation<WebhooksUpdateResponse> = {
  id: 'webhooks.update',
  method: 'PATCH',
  response: 'json',
  transform: webhooksUpdateResponseTransformer,
}

export type UpdateWebhookInput = WebhooksUpdateData['body']
export function useUpdateWebhook(
  url: string,
  configuration: V0MutationConfiguration<
    WebhooksUpdateResponse,
    WebhooksUpdateError,
    WebhooksUpdateData['body']
  > = {},
) {
  return useV0Mutation(updateWebhookOperation, url, configuration)
}
