'use server'

import { revalidatePath } from 'next/cache'
import {
  v0,
  type ChatsCreateFromFilesData,
  type ChatsCreateFromRepoData,
  type ChatsCreateFromZipData,
} from 'v0'

export type CreateChatResult =
  | { chatId: string }
  | {
      error: string
    }

export type CreateVercelProjectResult = { vercelProjectId: string } | { error: string }

export async function createChatFromFiles(
  files: ChatsCreateFromFilesData['body']['files'],
): Promise<CreateChatResult> {
  if (files.length === 0) return { error: 'Choose at least one file.' }

  try {
    const response = await v0.chats.createFromFiles({
      files,
      privacy: 'private',
    })
    if (response.error) return { error: response.error.message }

    return createdChat(response.data.chat.id)
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function createChatFromZip(
  url: ChatsCreateFromZipData['body']['url'],
): Promise<CreateChatResult> {
  try {
    const response = await v0.chats.createFromZip({
      url,
      privacy: 'private',
    })
    if (response.error) return { error: response.error.message }

    return createdChat(response.data.chat.id)
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function createChatFromRepo(
  repo: ChatsCreateFromRepoData['body']['repo'],
): Promise<CreateChatResult> {
  try {
    const response = await v0.chats.createFromRepo({
      repo,
      privacy: 'private',
    })
    if (response.error) return { error: response.error.message }

    return createdChat(response.data.chat.id)
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function createVercelProject(chatId: string): Promise<CreateVercelProjectResult> {
  try {
    const response = await v0.chats.createVercelProject({ chatId })
    if (response.error) return { error: response.error.message }

    return { vercelProjectId: response.data.vercelProjectId }
  } catch (error) {
    return { error: errorMessage(error, 'Failed to create Vercel project.') }
  }
}

function createdChat(chatId: string): CreateChatResult {
  revalidatePath('/', 'layout')
  return { chatId }
}

function errorMessage(error: unknown, fallback = 'Failed to create chat.') {
  return error instanceof Error ? error.message : fallback
}
