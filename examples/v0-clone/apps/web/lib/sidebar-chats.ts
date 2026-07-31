'use server'

import type { Chat, ChatsListData } from 'v0'
import { v0 } from '@/lib/v0-client'

const CHAT_PAGE_SIZE = 5

export async function getSidebarChats() {
  try {
    const [favoriteChats, recentChats] = await Promise.all([listFavoriteChats(), listRecentChats()])

    return { favoriteChats, recentChats }
  } catch {
    return {
      favoriteChats: [],
      recentChats: { chats: [], cursor: null },
    }
  }
}

async function listFavoriteChats(): Promise<Chat[]> {
  const page = await listChats({
    limit: CHAT_PAGE_SIZE,
    metadata: { favorite: 'true' },
  })

  return page.chats
}

async function listRecentChats(cursor?: string) {
  const page = await listChats({
    limit: CHAT_PAGE_SIZE,
    cursor,
  })

  return {
    chats: page.chats.filter((chat) => chat.metadata.favorite !== 'true'),
    cursor: page.cursor,
  }
}

async function listChats(parameters: ChatsListData['query']) {
  const response = await v0.chats.list(parameters)

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response.data
}
