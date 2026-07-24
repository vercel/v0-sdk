'use client'

import type { ReactNode } from 'react'
import type { Message } from 'v0'
import { Response } from '@/components/ai-elements/response'
import {
  AgentIcon,
  ChevronDownIcon,
  CrossCircleIcon,
  EyeIcon,
  FileIcon,
  SearchIcon,
  SparklesIcon,
  TerminalIcon,
  ToolIcon,
} from '@/lib/icons'

type MessagePart = Message['parts'][number]

export function MessageParts({
  message,
  isStreaming = false,
}: {
  message: Message
  isStreaming?: boolean
}) {
  if (message.role === 'user') {
    const text = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n\n')

    return text || message.content
  }

  const hasTextPart = message.parts.some((part) => part.type === 'text')
  const content = visibleAssistantText(message.content)

  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5">
      {message.parts.map((part, index) => (
        <MessagePartView isStreaming={isStreaming} key={`${message.id}-${index}`} part={part} />
      ))}
      {!hasTextPart && content ? <Markdown isStreaming={isStreaming}>{content}</Markdown> : null}
    </div>
  )
}

function MessagePartView({ part, isStreaming }: { part: MessagePart; isStreaming: boolean }) {
  switch (part.type) {
    case 'text': {
      const text = visibleAssistantText(part.text)
      return text ? <Markdown isStreaming={isStreaming}>{text}</Markdown> : null
    }
    case 'thinking':
      return <ThinkingPart isStreaming={isStreaming} part={part} />
    case 'file-read':
      return (
        <Activity
          detail={part.paths.join(', ')}
          icon={<EyeIcon />}
          title={part.paths.length === 1 ? 'Read file' : `Read ${part.paths.length} files`}
        />
      )
    case 'file-edit':
      return (
        <Activity
          detail={
            part.operation === 'rename' && part.toPath ? `${part.path} → ${part.toPath}` : part.path
          }
          icon={<FileIcon />}
          title={fileEditLabel(part.operation)}
        />
      )
    case 'search':
      return (
        <Activity
          detail={part.query}
          icon={<SearchIcon />}
          title={part.scope === 'web' ? 'Searched the web' : 'Searched the codebase'}
        />
      )
    case 'bash':
      return (
        <Activity detail={part.command} icon={<TerminalIcon />} title="Ran command">
          {part.output}
        </Activity>
      )
    case 'tool-call': {
      const Icon = part.status === 'error' ? CrossCircleIcon : ToolIcon
      return (
        <Activity
          detail={humanize(part.name)}
          error={part.status === 'error'}
          icon={<Icon />}
          title={part.status === 'error' ? 'Tool failed' : 'Used tool'}
        >
          {formatToolDetails(part.input, part.output)}
        </Activity>
      )
    }
    case 'agent-action':
      return (
        <Activity detail={part.summary} icon={<AgentIcon />} title={humanize(part.name)}>
          {part.data === undefined || isPendingAgentAction(part)
            ? undefined
            : formatValue(part.data)}
        </Activity>
      )
  }
}

function isPendingAgentAction(part: Extract<MessagePart, { type: 'agent-action' }>) {
  if (!part.data) return false

  return (
    (part.name === 'ask_user_questions' && 'questions' in part.data) ||
    (part.name === 'exit_plan_mode' && 'plan' in part.data) ||
    (part.name === 'get_or_request_integration' && 'requestedIntegrations' in part.data)
  )
}

function visibleAssistantText(text: string) {
  const projectStart = text.indexOf('<CodeProject')
  if (projectStart === -1) return text

  const projectEnd = text.indexOf('</CodeProject>', projectStart)
  if (projectEnd === -1) return text.slice(0, projectStart).trim()

  return `${text.slice(0, projectStart)}${text.slice(projectEnd + '</CodeProject>'.length)}`.trim()
}

function ThinkingPart({
  part,
  isStreaming,
}: {
  part: Extract<MessagePart, { type: 'thinking' }>
  isStreaming: boolean
}) {
  if (!part.text) return null

  return (
    <details className="group text-muted-foreground">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 py-0.5 text-xs font-medium hover:text-foreground [&::-webkit-details-marker]:hidden">
        <SparklesIcon className="size-3.5 shrink-0" />
        <span>{thinkingLabel(part.startedAt, part.finishedAt)}</span>
        <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 border-l border-border pl-3 text-xs leading-relaxed text-muted-foreground">
        <Markdown isStreaming={isStreaming}>{part.text}</Markdown>
      </div>
    </details>
  )
}

function Markdown({ children, isStreaming }: { children: string; isStreaming: boolean }) {
  return (
    <Response
      animated={isStreaming}
      isAnimating={isStreaming}
      mode={isStreaming ? 'streaming' : 'static'}
      parseIncompleteMarkdown={isStreaming}
    >
      {children}
    </Response>
  )
}

function Activity({
  title,
  detail,
  icon,
  error = false,
  children,
}: {
  title: string
  detail?: string
  icon: ReactNode
  error?: boolean
  children?: string
}) {
  const row = (
    <div className="flex min-w-0 items-center gap-2 py-0.5 text-xs">
      <span
        className={
          error
            ? 'shrink-0 text-destructive [&>svg]:size-3.5'
            : 'shrink-0 text-muted-foreground [&>svg]:size-3.5'
        }
      >
        {icon}
      </span>
      <span className={error ? 'font-medium text-destructive' : 'font-medium'}>{title}</span>
      {detail ? (
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
          {detail}
        </span>
      ) : null}
      {children ? (
        <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      ) : null}
    </div>
  )

  if (!children) return row

  return (
    <details className="group min-w-0">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        {row}
      </summary>
      <pre className="mt-1.5 max-h-48 overflow-auto rounded-md border border-border bg-muted/40 p-2 whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
        {children}
      </pre>
    </details>
  )
}

function thinkingLabel(startedAt?: Date, finishedAt?: Date) {
  if (!startedAt || !finishedAt) return 'Thought for a moment'

  const duration = Date.parse(String(finishedAt)) - Date.parse(String(startedAt))
  if (!Number.isFinite(duration) || duration <= 0) return 'Thought for a moment'

  const seconds = Math.max(1, Math.round(duration / 1000))
  if (seconds < 60) return `Thought for ${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds
    ? `Thought for ${minutes}m ${remainingSeconds}s`
    : `Thought for ${minutes}m`
}

function fileEditLabel(operation: Extract<MessagePart, { type: 'file-edit' }>['operation']) {
  const labels = {
    create: 'Created file',
    update: 'Updated file',
    delete: 'Deleted file',
    rename: 'Renamed file',
    patch: 'Patched file',
  } as const

  return labels[operation]
}

function humanize(value: string) {
  return value.replaceAll(/[-_]+/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function formatToolDetails(input: unknown, output: unknown) {
  const details = []
  if (input !== undefined) details.push(`Input\n${formatValue(input)}`)
  if (output !== undefined) details.push(`Output\n${formatValue(output)}`)
  return details.join('\n\n') || undefined
}

function formatValue(value: unknown) {
  if (typeof value === 'string') return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
