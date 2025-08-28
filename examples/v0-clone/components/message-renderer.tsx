import React from 'react'
import { Message, MessageBinaryFormat } from '@v0-sdk/react'
import { sharedComponents } from './shared-components'

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
  const processedContent = preprocessMessageContent(content)

  return (
    <Message
      content={processedContent}
      messageId={messageId}
      role={role}
      className={className}
      components={sharedComponents}
    />
  )
}
