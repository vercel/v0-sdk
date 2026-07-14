import { type ClientOptions, V0Sdk } from './generated'
import { createClient, createConfig } from './generated/client'
import type { Auth, AuthToken } from './generated/core/auth.gen'
import { createV0StreamResult, type V0StreamResult } from './stream/result'
import { vercelOidcAuth } from './vercel-oidc'

export { fetchPreview } from './preview-proxy'
export * from './stream'
export type { FetchPreviewOptions } from './preview-proxy'
export { vercelOidcAuth, type VercelOidcAuthOptions } from './vercel-oidc'
export type * from './generated/types.gen'

export { createChatId } from './id'

type CreateClientConfig = NonNullable<Parameters<typeof createClient>[0]>
type CreateV0ClientConfig = CreateClientConfig & {
  /**
   * v0 API key, or a callback returning a token. A string is sent as-is on
   * every request; a callback is invoked per request, for tokens that have to
   * be fetched or refreshed. Defaults to `V0_API_KEY`, then
   * {@link vercelOidcAuth}, when omitted.
   */
  auth?: CreateClientConfig['auth']
}

type GeneratedV0Client = V0Sdk
type GeneratedChats = GeneratedV0Client['chats']
type GeneratedMessages = GeneratedV0Client['messages']
type ChatsCreateStreamOptions = Parameters<GeneratedChats['createStream']>[0]
type ChatsCreateStreamRequestOptions = Parameters<GeneratedChats['createStream']>[1]
type ChatsResumeOptions = Parameters<GeneratedChats['resume']>[0]
type ChatsResumeRequestOptions = Parameters<GeneratedChats['resume']>[1]
type MessagesResolveStreamOptions = Parameters<GeneratedMessages['resolveStream']>[0]
type MessagesResolveStreamRequestOptions = Parameters<GeneratedMessages['resolveStream']>[1]
type MessagesSendStreamOptions = Parameters<GeneratedMessages['sendStream']>[0]
type MessagesSendStreamRequestOptions = Parameters<GeneratedMessages['sendStream']>[1]

type ProcessWithEnv = {
  env?: {
    V0_API_KEY?: string
  }
}

/** The v0 client returned by {@link createV0Client}. */
export type V0Client = Omit<GeneratedV0Client, 'chats' | 'messages'> & {
  chats: Omit<GeneratedChats, 'createStream' | 'resume'> & {
    createStream(
      parameters: ChatsCreateStreamOptions,
      options?: ChatsCreateStreamRequestOptions,
    ): Promise<V0StreamResult>
    resume(
      parameters: ChatsResumeOptions,
      options?: ChatsResumeRequestOptions,
    ): Promise<V0StreamResult>
  }
  messages: Omit<GeneratedMessages, 'resolveStream' | 'sendStream'> & {
    resolveStream(
      parameters: MessagesResolveStreamOptions,
      options?: MessagesResolveStreamRequestOptions,
    ): Promise<V0StreamResult>
    sendStream(
      parameters: MessagesSendStreamOptions,
      options?: MessagesSendStreamRequestOptions,
    ): Promise<V0StreamResult>
  }
}

/**
 * Creates a v0 client. To authenticate:
 * - pass your v0 API key as `auth`; or
 * - omit `auth` to use the `V0_API_KEY` environment variable when present, or
 *   project-scoped Vercel OIDC auth for server-side code deployed on Vercel.
 */
export function createV0Client(config: CreateV0ClientConfig = {}): V0Client {
  const { auth = defaultV0Auth, ...clientConfig } = config

  const client = createClient(
    createConfig<ClientOptions>({
      baseUrl: 'https://v0.app',
      ...clientConfig,
      auth,
    }),
  )

  return wrapV0Client(new V0Sdk({ client }))
}

/** Default v0 client using `V0_API_KEY` or Vercel OIDC auth. */
export const v0 = createV0Client()

const defaultVercelOidcAuth = vercelOidcAuth()

async function defaultV0Auth(auth: Auth): Promise<AuthToken> {
  return getV0ApiKeyFromEnv() ?? defaultVercelOidcAuth(auth)
}

function getV0ApiKeyFromEnv(): string | undefined {
  const maybeProcess = (globalThis as typeof globalThis & { process?: ProcessWithEnv }).process
  return maybeProcess?.env?.V0_API_KEY
}

function wrapV0Client(raw: V0Sdk): V0Client {
  const chats = wrapChats(raw.chats)
  const messages = wrapMessages(raw.messages)

  return new Proxy(raw, {
    get(target, property, receiver) {
      if (property === 'chats') {
        return chats
      }

      if (property === 'messages') {
        return messages
      }

      return Reflect.get(target, property, receiver)
    },
  }) as unknown as V0Client
}

function wrapChats(chats: GeneratedChats): V0Client['chats'] {
  return new Proxy(chats, {
    get(target, property, receiver) {
      if (property === 'createStream') {
        return async (
          parameters: ChatsCreateStreamOptions,
          options?: ChatsCreateStreamRequestOptions,
        ) => {
          const result = await target.createStream(parameters, options)
          return createV0StreamResult(result.stream)
        }
      }

      if (property === 'resume') {
        return async (parameters: ChatsResumeOptions, options?: ChatsResumeRequestOptions) => {
          const result = await target.resume(parameters, options)
          return createV0StreamResult(result.stream)
        }
      }

      return Reflect.get(target, property, receiver)
    },
  }) as unknown as V0Client['chats']
}

function wrapMessages(messages: GeneratedMessages): V0Client['messages'] {
  return new Proxy(messages, {
    get(target, property, receiver) {
      if (property === 'resolveStream') {
        return async (
          parameters: MessagesResolveStreamOptions,
          options?: MessagesResolveStreamRequestOptions,
        ) => {
          const result = await target.resolveStream(parameters, options)
          return createV0StreamResult(result.stream)
        }
      }

      if (property === 'sendStream') {
        return async (
          parameters: MessagesSendStreamOptions,
          options?: MessagesSendStreamRequestOptions,
        ) => {
          const result = await target.sendStream(parameters, options)
          return createV0StreamResult(result.stream)
        }
      }

      return Reflect.get(target, property, receiver)
    },
  }) as unknown as V0Client['messages']
}
