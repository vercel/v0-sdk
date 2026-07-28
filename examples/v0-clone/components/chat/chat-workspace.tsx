'use client'

import { Suspense, useState } from 'react'
import type { Chat, Message } from '@v0-sdk/react'
import {
  CodeEditorLoading,
  CodeEditorPane,
  type ChatFilesResult,
} from '@/components/chat/code-editor'
import { ChatHeader, type ChatView } from '@/components/chat/chat-header'
import { ChatConversation } from '@/components/chat/chat-conversation'
import { PreviewPane } from '@/components/preview/preview-pane'

export function ChatWorkspace({
  chat,
  messages,
  filesPromise,
}: {
  chat: Chat
  messages: Message[]
  filesPromise: Promise<ChatFilesResult>
}) {
  const [view, setView] = useState<ChatView>('preview')
  const [restoreRevision, setRestoreRevision] = useState(0)
  const [isPreviewReady, setIsPreviewReady] = useState(false)

  const handleRestore = () => {
    setIsPreviewReady(false)
    setRestoreRevision((revision) => revision + 1)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader
        chatId={chat.id}
        onViewChange={setView}
        title={chat.title ?? 'Untitled chat'}
        view={view}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-full shrink-0 flex-col border-r border-border md:w-80 md:max-w-[42%]">
          <ChatConversation
            chatId={chat.id}
            messages={messages}
            onRestore={handleRestore}
            vercelProjectId={chat.vercelProjectId}
          />
        </div>
        <div className="hidden min-w-0 flex-1 md:block">
          <div className={view === 'preview' ? 'h-full' : 'hidden'}>
            <PreviewPane chatId={chat.id} key={restoreRevision} onReadyChange={setIsPreviewReady} />
          </div>
          <div className={view === 'code' ? 'h-full' : 'hidden'}>
            <Suspense fallback={<CodeEditorLoading />}>
              <CodeEditorPane
                chatId={chat.id}
                filesPromise={filesPromise}
                isPreviewReady={isPreviewReady}
                key={restoreRevision}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
