'use client'

import { Suspense, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Chat, Message } from '@v0-sdk/react'
import {
  CodeEditorLoading,
  CodeEditorPane,
  type ChatFilesResult,
} from '@/components/chat/code-editor'
import { ChatHeader, type ChatView } from '@/components/chat/chat-header'
import { ChatConversation } from '@/components/chat/chat-conversation'
import { PreviewPane } from '@/components/preview/preview-pane'
import { designModeMessageText, type DesignModeTurn } from '@/lib/design-mode-message'
import type { DesignModeMessage } from 'v0/browser'

export function ChatWorkspace({
  chat,
  messages,
  filesPromise,
}: {
  chat: Chat
  messages: Message[]
  filesPromise: Promise<ChatFilesResult>
}) {
  const router = useRouter()
  const [view, setView] = useState<ChatView>('preview')
  const [contentRevision, setContentRevision] = useState(0)
  const [previewRevision, setPreviewRevision] = useState(0)
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const [isChatBusy, setIsChatBusy] = useState(false)
  const [isDesignSaving, setIsDesignSaving] = useState(false)
  const [designTurn, setDesignTurn] = useState<DesignModeTurn | null>(null)

  const handleDesignStart = useCallback((message: DesignModeMessage) => {
    setDesignTurn({ text: designModeMessageText(message), assistant: null })
  }, [])
  const handleDesignAssistant = useCallback((assistant: Message) => {
    setDesignTurn((turn) => {
      if (!turn) return null
      return { ...turn, assistant }
    })
  }, [])
  const handleDesignSavingChange = useCallback((saving: boolean) => {
    setIsDesignSaving(saving)
    if (!saving)
      setDesignTurn((turn) => {
        if (turn?.assistant) return turn
        return null
      })
  }, [])
  const handleDesignTurnSettled = useCallback(() => {
    setDesignTurn(null)
  }, [])
  const handleChatBusyChange = useCallback((busy: boolean) => {
    setIsChatBusy(busy)
    if (busy) setDesignTurn(null)
  }, [])

  const handleContentChange = useCallback(() => {
    setIsPreviewReady(false)
    setContentRevision((revision) => revision + 1)
    setPreviewRevision((revision) => revision + 1)
  }, [])

  const handleDesignSaved = useCallback(() => {
    // Keep the iframe alive until the runtime receives its Apply acknowledgement.
    setContentRevision((revision) => revision + 1)
    router.refresh()
  }, [router])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader
        chatId={chat.id}
        onViewChange={setView}
        title={chat.title ?? 'Untitled chat'}
        view={view}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 w-full shrink-0 flex-col border-r border-border md:w-80 md:max-w-[42%]">
          <ChatConversation
            chatId={chat.id}
            messages={messages}
            externallyBusy={isDesignSaving}
            onBusyChange={handleChatBusyChange}
            designTurn={designTurn}
            onDesignTurnSettled={handleDesignTurnSettled}
            onContentChange={handleContentChange}
            vercelProjectId={chat.vercelProjectId}
          />
        </div>
        <div className="hidden min-w-0 flex-1 md:block">
          <div className={view === 'preview' ? 'h-full' : 'hidden'}>
            <PreviewPane
              chatId={chat.id}
              disabled={isChatBusy || view !== 'preview' || !chat.writePermission}
              key={previewRevision}
              onReadyChange={setIsPreviewReady}
              onSavingChange={handleDesignSavingChange}
              onStart={handleDesignStart}
              onAssistant={handleDesignAssistant}
              onSaved={handleDesignSaved}
            />
          </div>
          <div className={view === 'code' ? 'h-full' : 'hidden'}>
            <Suspense fallback={<CodeEditorLoading />}>
              <CodeEditorPane
                chatId={chat.id}
                filesPromise={filesPromise}
                isPreviewReady={isPreviewReady}
                key={contentRevision}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
