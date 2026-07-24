'use client'

import { useEffect, useRef } from 'react'
import type { Message as V0Message } from 'v0'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { MessageParts } from '@/components/chat/message-parts'
import { TaskResolution, type ResolveTask } from '@/components/chat/task-resolution'
import { RefreshIcon, SpinnerIcon } from '@/lib/icons'

export function ConversationView({
  messages,
  onRejectPermission,
  onResolveTask,
  onRestoreMessage,
  pendingUserMessage,
  restoringMessageId,
  streamingMessage,
  taskDisabled,
  vercelProjectId,
}: {
  messages: V0Message[]
  onRejectPermission?: () => void | Promise<void>
  onResolveTask?: (task: ResolveTask) => void | Promise<void>
  onRestoreMessage?: (messageId: string) => void
  pendingUserMessage?: string | null
  restoringMessageId?: string | null
  streamingMessage?: V0Message | null
  taskDisabled?: boolean
  vercelProjectId?: string
}) {
  const endRef = useRef<HTMLDivElement>(null)
  const streamingMessageIsListed = messages.some((message) => message.id === streamingMessage?.id)
  const interactiveTaskMessageId =
    pendingUserMessage || streamingMessage ? null : messages.at(-1)?.id

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, pendingUserMessage, streamingMessage])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-4 text-[13px] leading-relaxed">
        {messages.length === 0 && !pendingUserMessage ? (
          <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((message) => (
            <ConversationMessage
              isRestoring={restoringMessageId === message.id}
              isStreaming={streamingMessage?.id === message.id}
              key={message.id}
              message={streamingMessage?.id === message.id ? streamingMessage : message}
              onRejectPermission={
                message.id === interactiveTaskMessageId ? onRejectPermission : undefined
              }
              onResolveTask={message.id === interactiveTaskMessageId ? onResolveTask : undefined}
              onRestore={onRestoreMessage}
              taskDisabled={taskDisabled}
              vercelProjectId={vercelProjectId}
            />
          ))
        )}
        {pendingUserMessage ? (
          <Message from="user">
            <MessageContent className="group-[.is-user]:max-w-[80%] group-[.is-user]:rounded-2xl group-[.is-user]:border group-[.is-user]:border-border group-[.is-user]:bg-muted group-[.is-user]:px-3 group-[.is-user]:py-1.5 group-[.is-user]:text-[13px]">
              {pendingUserMessage}
            </MessageContent>
          </Message>
        ) : null}
        {streamingMessage && !streamingMessageIsListed ? (
          <ConversationMessage isStreaming message={streamingMessage} />
        ) : null}
        <div ref={endRef} />
      </div>
    </div>
  )
}

function ConversationMessage({
  message,
  onRejectPermission,
  onResolveTask,
  onRestore,
  isRestoring = false,
  isStreaming = false,
  taskDisabled = false,
  vercelProjectId,
}: {
  message: V0Message
  onRejectPermission?: () => void | Promise<void>
  onResolveTask?: (task: ResolveTask) => void | Promise<void>
  onRestore?: (messageId: string) => void
  isRestoring?: boolean
  isStreaming?: boolean
  taskDisabled?: boolean
  vercelProjectId?: string
}) {
  const content = (
    <Message from={message.role}>
      <MessageContent
        className={
          message.role === 'user'
            ? 'group-[.is-user]:max-w-[80%] group-[.is-user]:rounded-2xl group-[.is-user]:border group-[.is-user]:border-border group-[.is-user]:bg-muted group-[.is-user]:px-3 group-[.is-user]:py-1.5 group-[.is-user]:text-[13px]'
            : 'w-full text-[13px] leading-relaxed'
        }
      >
        <MessageParts isStreaming={isStreaming} message={message} />
        {onResolveTask && onRejectPermission ? (
          <TaskResolution
            disabled={taskDisabled}
            message={message}
            onRejectPermission={onRejectPermission}
            onResolve={onResolveTask}
            vercelProjectId={vercelProjectId}
          />
        ) : null}
      </MessageContent>
    </Message>
  )

  if (message.role !== 'user' || !onRestore) return content

  return (
    <div className="flex flex-col items-end">
      {content}
      <button
        className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
        disabled={isRestoring}
        onClick={() => onRestore(message.id)}
        type="button"
      >
        {isRestoring ? (
          <SpinnerIcon className="size-3 animate-spin" />
        ) : (
          <RefreshIcon className="size-3" />
        )}
        {isRestoring ? 'Rewinding…' : 'Rewind chat to here'}
      </button>
    </div>
  )
}
