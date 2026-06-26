import { createV0Client, type Chat, type ChatsListResponse } from 'v0'

const CHAT_URL_BASE = 'https://v0.app/chat'

type V0Client = ReturnType<typeof createV0Client>
type ListedChat = ChatsListResponse['chats'][number]
type ChatLike = Chat | ListedChat

type V0Result<T> = { data: T; error: undefined } | { data: undefined; error: { message?: string } }

export function getV0Client() {
  const apiKey = process.env.V0_API_KEY

  if (!apiKey) {
    throw new Error('V0_API_KEY is required')
  }

  return createV0Client({
    auth: apiKey,
  })
}

export function unwrapV0Response<T>(result: V0Result<T>) {
  if (result.error) {
    throw new Error(result.error.message || 'v0 API request failed')
  }

  return result.data
}

export function getChatUrl(chatId: string) {
  return `${CHAT_URL_BASE}/${chatId}`
}

export function normalizeChat(chat: ChatLike, previewUrl?: string | null) {
  return {
    ...chat,
    chatId: chat.id,
    title: chat.title,
    url: getChatUrl(chat.id),
    ...(previewUrl ? { demo: previewUrl, previewUrl } : {}),
  }
}

export async function listChats(v0: V0Client) {
  const chats = await listSimpleChats(v0)

  return chats
    .map((chat) => normalizeChat(chat))
    .sort((a, b) => compareDates(b.updatedAt, a.updatedAt))
}

async function listSimpleChats(v0: V0Client) {
  const chats: ListedChat[] = []
  let cursor: string | undefined

  for (let page = 0; page < 10; page++) {
    const response = await v0.chats.list({
      limit: 100,
      ...(cursor ? { cursor } : {}),
    })
    const data = unwrapV0Response(response)

    chats.push(...data.chats)

    if (typeof data.cursor !== 'string' || !data.cursor) {
      break
    }

    cursor = data.cursor
  }

  return chats
}

function compareDates(left: Date | string | undefined, right: Date | string | undefined) {
  return getTime(left) - getTime(right)
}

function getTime(value: Date | string | undefined) {
  if (!value) return 0
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}
