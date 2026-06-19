import { type ClientOptions, V0Sdk } from './generated'
import { createClient, createConfig } from './generated/client'
import { createV0StreamResult, type V0StreamResult } from './stream/result'
import { vercelOidcAuth } from './vercel-oidc'

export * from './stream'
export { vercelOidcAuth, type VercelOidcAuthOptions } from './vercel-oidc'
export type * from './generated/types.gen'

type CreateClientConfig = NonNullable<Parameters<typeof createClient>[0]>
type CreateV0ClientConfig = CreateClientConfig & {
  /**
   * v0 API key, or a callback returning a token. A string is sent as-is on
   * every request; a callback is invoked per request, for tokens that have to
   * be fetched or refreshed. Defaults to {@link vercelOidcAuth} when omitted.
   */
  auth?: CreateClientConfig['auth']
}

type GeneratedV0Client = V0Sdk
type GeneratedChats = GeneratedV0Client['chats']
type GeneratedMessages = GeneratedV0Client['messages']
type ChatsCreateStreamOptions = Parameters<GeneratedChats['createStream']>[0]
type MessagesSendStreamOptions = Parameters<GeneratedMessages['sendStream']>[0]

/** The v0 client returned by {@link createV0Client}. */
export type V0Client = Omit<GeneratedV0Client, 'chats' | 'messages'> & {
  chats: Omit<GeneratedChats, 'createStream'> & {
    createStream(options: ChatsCreateStreamOptions): Promise<V0StreamResult>
  }
  messages: Omit<GeneratedMessages, 'sendStream'> & {
    sendStream(options: MessagesSendStreamOptions): Promise<V0StreamResult>
  }
}

/**
 * Creates a v0 client. To authenticate:
 * - pass your v0 API key as `auth`; or
 * - omit `auth` for server-side code deployed on Vercel with OIDC enabled,
 *   which uses project-scoped Vercel OIDC auth automatically.
 */
export function createV0Client(config: CreateV0ClientConfig = {}): V0Client {
  const client = createClient(
    createConfig<ClientOptions>({
      baseUrl: 'https://v0.app',
      auth: vercelOidcAuth(),
      ...config,
    }),
  )

  return wrapV0Client(new V0Sdk({ client }))
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
        return async (options: ChatsCreateStreamOptions) => {
          const result = await target.createStream(options)
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
      if (property === 'sendStream') {
        return async (options: MessagesSendStreamOptions) => {
          const result = await target.sendStream(options)
          return createV0StreamResult(result.stream)
        }
      }

      return Reflect.get(target, property, receiver)
    },
  }) as unknown as V0Client['messages']
}
