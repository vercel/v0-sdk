'use server'

import { v0, type Chat } from 'v0'

const CHAT_PAGE_SIZE = 5

export async function getSidebarChats() {
  const [favoriteChats, recentChats] = await Promise.all([listFavoriteChats(), listRecentChats()])

  return { favoriteChats, recentChats }
}

async function listFavoriteChats(): Promise<Chat[]> {
  const page = await listChats({
    limit: CHAT_PAGE_SIZE,
    metadata: { favorite: 'true' },
  })

  return page.chats
}

export async function listRecentChats(cursor?: string) {
  const page = await listChats({
    limit: CHAT_PAGE_SIZE,
    cursor,
  })

  return {
    chats: page.chats.filter((chat) => chat.metadata.favorite !== 'true'),
    cursor: page.cursor,
  }
}

export async function renameChat(chatId: string, title: string) {
  const nextTitle = title.trim()
  if (!nextTitle) throw new Error('Chat title is required')

  const response = await v0.chats.update({
    chatId,
    title: nextTitle,
  })
  throwIfError(response)
  return getSidebarChats()
}

export async function setChatFavorite(chatId: string, favorite: boolean) {
  const response = await v0.chats.update({
    chatId,
    metadata: { favorite: favorite ? 'true' : null },
  })
  throwIfError(response)
  return getSidebarChats()
}

export async function deleteChat(chatId: string) {
  const response = await v0.chats.delete({ chatId })
  throwIfError(response)
  return getSidebarChats()
}

async function listChats(parameters: Parameters<typeof v0.chats.list>[0]) {
  const response = await v0.chats.list(parameters)

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response.data
}

function throwIfError(response: { error?: { message: string } }) {
  if (response.error) throw new Error(response.error.message)
}
