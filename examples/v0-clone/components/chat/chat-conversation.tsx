'use client'

import { useEffect, useState } from 'react'
import { readV0Stream, type Files, type Message } from 'v0'
import { ConversationView } from '@/components/chat/conversation-view'
import { PromptBox } from '@/components/prompt-box'
import type { ResolveTask } from '@/components/chat/task-resolution'
import { useSettings } from '@/lib/hooks/useSettings'

export type RefreshMessagesAction = () => Promise<{ messages: Message[] } | { error: string }>

export type RestoreMessageAction = (
  messageId: string,
) => Promise<{ success: true; files: Files['files']; messages: Message[] } | { error: string }>

export type StopMessageAction = (
  messageId: string,
) => Promise<{ success: true } | { error: string }>

export function ChatConversation({
  chatId,
  messages,
  onMessagesChange,
  onRestore,
  refreshMessagesAction,
  restoreMessageAction,
  stopMessageAction,
  vercelProjectId,
}: {
  chatId: string
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
  onRestore: (files: Files['files']) => void
  refreshMessagesAction: RefreshMessagesAction
  restoreMessageAction: RestoreMessageAction
  stopMessageAction: StopMessageAction
  vercelProjectId?: string
}) {
  const { settings, updateSettings } = useSettings()
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [restoringMessageId, setRestoringMessageId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const latestMessage = messages.at(-1)
    const unfinishedMessage =
      latestMessage?.role === 'assistant' && latestMessage.finishReason === null
        ? latestMessage
        : null
    const shouldResume = !latestMessage || latestMessage.role === 'user' || unfinishedMessage

    if (!shouldResume) return

    const controller = new AbortController()

    const resumeStream = async () => {
      setError(null)
      setIsSubmitting(true)
      if (unfinishedMessage) setStreamingMessage(unfinishedMessage)

      try {
        const result = readV0Stream(
          fetch(`/api/chats/${encodeURIComponent(chatId)}/resume`, {
            method: 'POST',
            signal: controller.signal,
          }),
        )

        for await (const update of result.stream) {
          if (controller.signal.aborted) return

          const messageId =
            update.message?.id ??
            (update.event.object === 'message.parts.chunk' ||
            update.event.object === 'message.usage'
              ? update.event.id
              : null)
          if (!messageId) continue

          setStreamingMessage((current) => {
            const message =
              update.message ??
              (current?.id === messageId ? current : createStreamingMessage(chatId, messageId))

            return {
              ...message,
              parts: update.parts,
              usage: update.usage ?? message.usage,
            }
          })
        }

        if (controller.signal.aborted) return

        const refreshed = await refreshMessagesAction()
        if ('error' in refreshed) throw new Error(refreshed.error)

        onMessagesChange(refreshed.messages)
        setStreamingMessage(null)
      } catch (error) {
        if (controller.signal.aborted) return
        setError(error instanceof Error ? error.message : 'Failed to resume message.')
      } finally {
        if (!controller.signal.aborted) setIsSubmitting(false)
      }
    }

    void resumeStream()
    return () => controller.abort()
  }, [chatId])

  const sendMessage = async (message: string) => {
    setError(null)
    setPendingUserMessage(message)
    setStreamingMessage(null)
    setIsSubmitting(true)

    try {
      const result = readV0Stream(
        fetch(`/api/chats/${encodeURIComponent(chatId)}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            modelConfiguration: {
              modelId: settings.model,
              imageGenerations: false,
            },
          }),
        }),
      )

      for await (const update of result.stream) {
        if (update.message) setStreamingMessage(update.message)
      }

      const refreshed = await refreshMessagesAction()
      if ('error' in refreshed) throw new Error(refreshed.error)

      onMessagesChange(refreshed.messages)
      setPendingUserMessage(null)
      setStreamingMessage(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message.')

      const refreshed = await refreshMessagesAction().catch(() => null)
      if (refreshed && !('error' in refreshed)) {
        onMessagesChange(refreshed.messages)
        setPendingUserMessage(null)
        setStreamingMessage(null)
      }
    } finally {
      setIsStopping(false)
      setIsSubmitting(false)
    }
  }

  const restoreMessage = async (messageId: string) => {
    setError(null)
    setRestoringMessageId(messageId)

    try {
      const result = await restoreMessageAction(messageId)
      if ('error' in result) {
        setError(result.error)
        return
      }

      onMessagesChange([...messages, ...result.messages])
      onRestore(result.files)
    } catch {
      setError('Failed to restore message.')
    } finally {
      setRestoringMessageId(null)
    }
  }

  const resolveTask = async (task: ResolveTask) => {
    setError(null)
    setStreamingMessage(null)
    setIsSubmitting(true)

    try {
      const result = readV0Stream(
        fetch(`/api/chats/${encodeURIComponent(chatId)}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task,
            modelConfiguration: {
              modelId: settings.model,
              imageGenerations: false,
            },
          }),
        }),
      )

      for await (const update of result.stream) {
        if (update.message) setStreamingMessage(update.message)
      }

      const refreshed = await refreshMessagesAction()
      if ('error' in refreshed) throw new Error(refreshed.error)

      onMessagesChange(refreshed.messages)
      setStreamingMessage(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resolve task.')

      const refreshed = await refreshMessagesAction().catch(() => null)
      if (refreshed && !('error' in refreshed)) {
        onMessagesChange(refreshed.messages)
        setStreamingMessage(null)
      }
    } finally {
      setIsStopping(false)
      setIsSubmitting(false)
    }
  }

  const stopMessage = async () => {
    if (!streamingMessage) return

    setError(null)
    setIsStopping(true)

    try {
      const result = await stopMessageAction(streamingMessage.id)
      if ('error' in result) {
        setError(result.error)
        setIsStopping(false)
      }
    } catch {
      setError('Failed to stop message.')
      setIsStopping(false)
    }
  }

  const isStreaming =
    isSubmitting && streamingMessage !== null && streamingMessage.finishReason === null

  return (
    <>
      <ConversationView
        messages={messages}
        onRejectPermission={() => sendMessage('Do not run this action. Continue without it.')}
        onResolveTask={resolveTask}
        onRestoreMessage={restoreMessage}
        pendingUserMessage={pendingUserMessage}
        restoringMessageId={restoringMessageId}
        streamingMessage={streamingMessage}
        taskDisabled={isSubmitting || restoringMessageId !== null}
        vercelProjectId={vercelProjectId}
      />
      <div className="shrink-0 px-3 pb-3">
        <PromptBox
          compact
          isSubmitting={isSubmitting || restoringMessageId !== null}
          isStopping={isStopping}
          isStreaming={isStreaming}
          model={settings.model}
          onModelChange={(model) => updateSettings({ model })}
          onStop={stopMessage}
          onSubmit={sendMessage}
          placeholder="Ask v0 to make changes..."
        />
        {error ? <p className="mt-1.5 px-1 text-xs text-destructive">{error}</p> : null}
      </div>
    </>
  )
}

function createStreamingMessage(chatId: string, messageId: string): Message {
  const now = new Date()

  return {
    id: messageId,
    chatId,
    role: 'assistant',
    createdAt: now,
    updatedAt: now,
    content: '',
    parts: [],
    finishReason: null,
    authorId: null,
    usage: emptyUsage(),
  }
}

function emptyUsage(): Message['usage'] {
  return {
    tokens: {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      total: 0,
    },
    creditsCost: {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      total: 0,
    },
  }
}
