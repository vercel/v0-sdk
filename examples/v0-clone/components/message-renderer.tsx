import React from 'react'
import {
  Message,
  CodeProjectPart,
  CodeBlock,
  MathPart,
  MessageBinaryFormat,
  ThinkingSectionProps,
  TaskSectionProps,
  CodeProjectPartProps,
} from '@v0-sdk/react'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai-elements/reasoning'
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from '@/components/ai-elements/task'

// Function to preprocess message content and remove V0_FILE markers and shell placeholders
function preprocessMessageContent(
  content: MessageBinaryFormat,
): MessageBinaryFormat {
  if (!Array.isArray(content)) return content

  return content.map((row) => {
    if (!Array.isArray(row)) return row

    // Process text content to remove V0_FILE markers and shell placeholders
    return row.map((item, index) => {
      if (typeof item === 'string') {
        // Remove V0_FILE markers with various patterns
        let processed = item.replace(/\[V0_FILE\][^:]*:file="[^"]*"\n?/g, '')
        processed = processed.replace(/\[V0_FILE\][^\n]*\n?/g, '')

        // Remove shell placeholders with various patterns
        processed = processed.replace(/\.\.\. shell \.\.\./g, '')
        processed = processed.replace(/\.\.\.\s*shell\s*\.\.\./g, '')

        // Remove empty lines that might be left behind
        processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n')
        processed = processed.replace(/^\s*\n+/g, '') // Remove leading empty lines
        processed = processed.replace(/\n+\s*$/g, '') // Remove trailing empty lines
        processed = processed.trim()

        // If the processed string is empty or only whitespace, return empty string
        if (!processed || processed.match(/^\s*$/)) {
          return ''
        }

        return processed
      }
      return item
    }) as [number, ...any[]] // Type assertion to match MessageBinaryFormat structure
  })
}

// Wrapper component to adapt AI Elements Reasoning to @v0-sdk/react ThinkingSection
const ThinkingSectionWrapper = ({
  title,
  duration,
  thought,
  collapsed,
  onCollapse,
  children,
  brainIcon,
  chevronRightIcon,
  chevronDownIcon,
  iconRenderer,
  ...props
}: ThinkingSectionProps) => {
  return (
    <Reasoning
      duration={duration ? Math.round(duration) : duration}
      defaultOpen={!collapsed}
      onOpenChange={(open) => onCollapse?.()}
      {...props}
    >
      <ReasoningTrigger title={title || 'Thinking'} />
      <ReasoningContent>
        {thought ||
          (typeof children === 'string'
            ? children
            : 'No thinking content available')}
      </ReasoningContent>
    </Reasoning>
  )
}

// Wrapper component to adapt AI Elements Task to @v0-sdk/react TaskSection
const TaskSectionWrapper = ({
  title,
  type,
  parts,
  collapsed,
  onCollapse,
  children,
  taskIcon,
  chevronRightIcon,
  chevronDownIcon,
  iconRenderer,
  ...props
}: TaskSectionProps) => {
  return (
    <Task
      className="w-full"
      defaultOpen={!collapsed}
      onOpenChange={(open) => onCollapse?.()}
    >
      <TaskTrigger title={title || type || 'Task'} />
      <TaskContent>
        {parts &&
          parts.length > 0 &&
          parts.map((part, index) => {
            if (typeof part === 'string') {
              return <TaskItem key={index}>{part}</TaskItem>
            }

            // Handle structured task data with proper AI Elements components
            if (part && typeof part === 'object') {
              const partObj = part as any

              if (partObj.type === 'starting-repo-search' && partObj.query) {
                return (
                  <TaskItem key={index}>Searching: "{partObj.query}"</TaskItem>
                )
              }

              if (
                partObj.type === 'select-files' &&
                Array.isArray(partObj.filePaths)
              ) {
                return (
                  <TaskItem key={index}>
                    Read{' '}
                    {partObj.filePaths.map((file: string, i: number) => (
                      <TaskItemFile key={i}>
                        {file.split('/').pop()}
                      </TaskItemFile>
                    ))}
                  </TaskItem>
                )
              }

              if (partObj.type === 'fetching-diagnostics') {
                return <TaskItem key={index}>Checking for issues...</TaskItem>
              }

              if (partObj.type === 'diagnostics-passed') {
                return <TaskItem key={index}>✓ No issues found</TaskItem>
              }

              // Fallback for other structured data
              return (
                <TaskItem key={index}>
                  <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {JSON.stringify(part, null, 2)}
                  </div>
                </TaskItem>
              )
            }

            return null
          })}

        {children && <TaskItem>{children}</TaskItem>}
      </TaskContent>
    </Task>
  )
}

// Wrapper component to adapt AI Elements styling to @v0-sdk/react CodeProjectPart
const CodeProjectPartWrapper = ({
  title,
  filename,
  code,
  language,
  collapsed,
  className,
  children,
  iconRenderer,
  ...props
}: CodeProjectPartProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed ?? true)

  return (
    <div
      className={`my-6 border rounded-lg bg-white dark:bg-gray-900 ${className || ''}`}
      {...props}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {title || 'Code Project'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            v1
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {!isCollapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {children || (
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-mono">
                    {filename || 'app/page.tsx'}
                  </span>
                </div>
              </div>

              {code && (
                <CodeBlock language={language || 'typescript'} code={code} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface MessageRendererProps {
  content: MessageBinaryFormat | string
  messageId?: string
  role: 'user' | 'assistant'
  className?: string
}

export function MessageRenderer({
  content,
  messageId,
  role,
  className,
}: MessageRendererProps) {
  // If content is a string (user message or fallback), render it as plain text
  if (typeof content === 'string') {
    return (
      <div className={className}>
        <p className="mb-4 text-gray-700 dark:text-gray-200 leading-relaxed">
          {content}
        </p>
      </div>
    )
  }

  // If content is MessageBinaryFormat (from v0 API), use the Message component
  // Preprocess content to remove V0_FILE markers and shell placeholders
  console.log('Raw content before preprocessing:', content)
  const processedContent = preprocessMessageContent(content)
  console.log('Processed content after preprocessing:', processedContent)

  return (
    <Message
      content={processedContent}
      messageId={messageId}
      role={role}
      className={className}
      components={{
        // AI Elements components for structured content
        ThinkingSection: ThinkingSectionWrapper,
        TaskSection: TaskSectionWrapper,
        CodeProjectPart: CodeProjectPartWrapper,
        CodeBlock,
        MathPart,

        // Styled HTML elements for the v0 clone theme
        p: {
          className: 'mb-4 text-gray-700 dark:text-gray-200 leading-relaxed',
        },
        h1: {
          className: 'mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100',
        },
        h2: {
          className:
            'mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100',
        },
        h3: {
          className:
            'mb-3 text-lg font-medium text-gray-900 dark:text-gray-100',
        },
        h4: {
          className:
            'mb-3 text-base font-medium text-gray-900 dark:text-gray-100',
        },
        h5: {
          className:
            'mb-2 text-sm font-medium text-gray-900 dark:text-gray-100',
        },
        h6: {
          className:
            'mb-2 text-sm font-medium text-gray-900 dark:text-gray-100',
        },
        ul: {
          className:
            'mb-4 ml-6 list-disc space-y-1 text-gray-700 dark:text-gray-200',
        },
        ol: {
          className:
            'mb-4 ml-6 list-decimal space-y-1 text-gray-700 dark:text-gray-200',
        },
        li: {
          className: 'text-gray-700 dark:text-gray-200',
        },
        blockquote: {
          className:
            'mb-4 border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400',
        },
        code: {
          className:
            'rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono text-gray-900 dark:text-gray-100',
        },
        pre: {
          className:
            'mb-4 overflow-x-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-4',
        },
        a: {
          className: 'text-blue-600 dark:text-blue-400 hover:underline',
        },
        strong: {
          className: 'font-semibold text-gray-900 dark:text-gray-100',
        },
        em: {
          className: 'italic text-gray-700 dark:text-gray-300',
        },
      }}
    />
  )
}
