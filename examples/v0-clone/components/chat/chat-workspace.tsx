'use client'

import { Suspense, useState } from 'react'
import type { Chat, Files, Message } from 'v0'
import {
  CodeEditorLoading,
  CodeEditorPane,
  type ChatFilesResult,
  type UpdateFilesAction,
} from '@/components/chat/code-editor'
import {
  ChatHeader,
  type ChatView,
  type DeployChatAction,
  type DuplicateChatAction,
} from '@/components/chat/chat-header'
import {
  ChatConversation,
  type RefreshMessagesAction,
  type RestoreMessageAction,
  type StopMessageAction,
} from '@/components/chat/chat-conversation'
import { PreviewPane } from '@/components/preview/preview-pane'

export function ChatWorkspace({
  chat,
  messages,
  deployChatAction,
  duplicateChatAction,
  filesPromise,
  refreshMessagesAction,
  restoreMessageAction,
  stopMessageAction,
  updateFilesAction,
}: {
  chat: Chat
  messages: Message[]
  deployChatAction: DeployChatAction
  duplicateChatAction: DuplicateChatAction
  filesPromise: Promise<ChatFilesResult>
  refreshMessagesAction: RefreshMessagesAction
  restoreMessageAction: RestoreMessageAction
  stopMessageAction: StopMessageAction
  updateFilesAction: UpdateFilesAction
}) {
  const [view, setView] = useState<ChatView>('preview')
  const [currentMessages, setCurrentMessages] = useState(messages)
  const [restoredFiles, setRestoredFiles] = useState<Files['files'] | null>(null)
  const [restoreRevision, setRestoreRevision] = useState(0)
  const [isPreviewReady, setIsPreviewReady] = useState(false)

  const handleRestore = (files: Files['files']) => {
    setRestoredFiles(files)
    setIsPreviewReady(false)
    setRestoreRevision((revision) => revision + 1)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader
        chatId={chat.id}
        deployChatAction={deployChatAction}
        duplicateChatAction={duplicateChatAction}
        onViewChange={setView}
        title={chat.title ?? 'Untitled chat'}
        view={view}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-full shrink-0 flex-col border-r border-border md:w-80 md:max-w-[42%]">
          <ChatConversation
            chatId={chat.id}
            messages={currentMessages}
            onMessagesChange={setCurrentMessages}
            onRestore={handleRestore}
            refreshMessagesAction={refreshMessagesAction}
            restoreMessageAction={restoreMessageAction}
            stopMessageAction={stopMessageAction}
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
                files={restoredFiles ?? undefined}
                filesPromise={filesPromise}
                isPreviewReady={isPreviewReady}
                key={restoreRevision}
                onMessagesChange={setCurrentMessages}
                updateFilesAction={updateFilesAction}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
