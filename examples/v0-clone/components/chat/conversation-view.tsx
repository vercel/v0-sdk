'use client'

import type { V0UIMessage } from '@v0-sdk/react'
import { useEffect, useRef } from 'react'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { MessageParts } from '@/components/chat/message-parts'
import { TaskResolution, type ResolveTask } from '@/components/chat/task-resolution'
import { RefreshIcon, SpinnerIcon } from '@/lib/icons'

export function ConversationView({
  messages,
  isStreaming = false,
  pendingUserMessage,
  onRejectPermission,
  onResolveTask,
  onRestoreMessage,
  restoringMessageId,
  taskDisabled,
  vercelProjectId,
}: {
  messages: V0UIMessage[]
  isStreaming?: boolean
  pendingUserMessage?: string | null
  onRejectPermission?: () => void | Promise<void>
  onResolveTask?: (task: ResolveTask) => void | Promise<void>
  onRestoreMessage?: (messageId: string) => void
  restoringMessageId?: string | null
  taskDisabled?: boolean
  vercelProjectId?: string
}) {
  const endRef = useRef<HTMLDivElement>(null)
  const visibleMessages: V0UIMessage[] = pendingUserMessage
    ? [
        ...messages,
        {
          id: 'pending-user-message',
          role: 'user',
          parts: [
            {
              type: 'text',
              text: pendingUserMessage,
              state: 'done',
            },
          ],
        },
      ]
    : messages
  const interactiveTaskMessageId =
    isStreaming || pendingUserMessage ? null : visibleMessages.at(-1)?.id
  const streamingMessageId = isStreaming
    ? visibleMessages.findLast((message) => message.role === 'assistant')?.id
    : null

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, isStreaming, pendingUserMessage])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-4 text-[13px] leading-relaxed">
        {visibleMessages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          visibleMessages.map((message) => (
            <ConversationMessage
              isRestoring={restoringMessageId === message.id}
              isStreaming={streamingMessageId === message.id}
              key={message.id}
              message={message}
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
  message: V0UIMessage
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

  if (!message.metadata?.restorable || !onRestore) return content

  return (
    <div className="flex flex-col items-start">
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
