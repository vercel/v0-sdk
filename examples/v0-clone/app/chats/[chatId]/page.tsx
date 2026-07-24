import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { v0 } from 'v0'
import type { ChatFilesResult } from '@/components/chat/code-editor'
import { ChatWorkspace } from '@/components/chat/chat-workspace'
import { getVercelDeploymentUrl } from '@/lib/vercel'

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const filesPromise: Promise<ChatFilesResult> = v0.chats
    .getFiles({ chatId })
    .then((response) => {
      if (response.error) return { error: response.error.message }
      return { files: response.data.files }
    })
    .catch(() => ({ error: 'Failed to load files.' }))
  const [chatResponse, messagesResponse] = await Promise.all([
    v0.chats.get({ chatId }),
    v0.messages.list({ chatId, limit: 100 }),
  ])

  if (chatResponse.error) throw new Error(chatResponse.error.message)
  if (messagesResponse.error) throw new Error(messagesResponse.error.message)

  async function duplicateChatAction() {
    'use server'

    const response = await v0.chats.duplicate({
      chatId,
      privacy: 'private',
    })

    if (response.error) return { error: response.error.message }

    revalidatePath('/', 'layout')
    redirect(`/chats/${response.data.id}`)
  }

  async function deployChatAction() {
    'use server'

    const response = await v0.chats.deploy({ chatId })

    if (response.error) return { error: response.error.message }

    const deploymentUrl = await getVercelDeploymentUrl(response.data.deploymentId)
    return { deploymentUrl }
  }

  async function updateFilesAction(files: Array<{ path: string; content: string | null }>) {
    'use server'

    try {
      const response = await v0.chats.updateFiles({ chatId, files })
      if (response.error) return { error: response.error.message }

      const [filesResponse, messagesResponse] = await Promise.all([
        v0.chats.getFiles({ chatId }),
        v0.messages.list({ chatId, limit: 100 }),
      ])

      if (filesResponse.error) return { error: filesResponse.error.message }
      if (messagesResponse.error) {
        return { error: messagesResponse.error.message }
      }

      return {
        success: true as const,
        files: filesResponse.data.files,
        messages: messagesResponse.data.messages.toReversed(),
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to save files.',
      }
    }
  }

  async function refreshMessagesAction() {
    'use server'

    const response = await v0.messages.list({ chatId, limit: 100 })
    if (response.error) return { error: response.error.message }

    return { messages: response.data.messages.toReversed() }
  }

  async function restoreMessageAction(messageId: string) {
    'use server'

    try {
      const restoreResponse = await v0.chats.restoreMessage({
        chatId,
        messageId,
      })
      if (restoreResponse.error) {
        return { error: restoreResponse.error.message }
      }

      const filesResponse = await v0.chats.getFiles({ chatId })
      if (filesResponse.error) return { error: filesResponse.error.message }

      return {
        success: true as const,
        files: filesResponse.data.files,
        messages: restoreResponse.data.messages,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to restore message.',
      }
    }
  }

  async function stopMessageAction(messageId: string) {
    'use server'

    try {
      const response = await v0.messages.stop({
        chatId,
        messageId,
      })
      if (response.error) return { error: response.error.message }

      return { success: true as const }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to stop message.',
      }
    }
  }

  return (
    <ChatWorkspace
      chat={chatResponse.data}
      deployChatAction={deployChatAction}
      duplicateChatAction={duplicateChatAction}
      filesPromise={filesPromise}
      key={chatResponse.data.id}
      messages={messagesResponse.data.messages.toReversed()}
      refreshMessagesAction={refreshMessagesAction}
      restoreMessageAction={restoreMessageAction}
      stopMessageAction={stopMessageAction}
      updateFilesAction={updateFilesAction}
    />
  )
}
