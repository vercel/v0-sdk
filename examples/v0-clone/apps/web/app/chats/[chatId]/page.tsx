import { v0 } from 'v0'
import type { ChatFilesResult } from '@/components/chat/code-editor'
import { ChatWorkspace } from '@/components/chat/chat-workspace'

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

  return (
    <ChatWorkspace
      chat={chatResponse.data}
      filesPromise={filesPromise}
      key={chatResponse.data.id}
      messages={messagesResponse.data.messages}
    />
  )
}
