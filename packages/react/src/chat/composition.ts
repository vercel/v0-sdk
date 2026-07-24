import type { Message } from 'v0/browser'

import { toV0UIMessages, type V0UIMessage } from './messages'

/** True only when the newest SDK message is an unfinished assistant. */
export function shouldResumeV0Chat(messages: readonly Message[]): boolean {
  const newest = messages[0]
  return newest?.role === 'assistant' && newest.finishReason === null
}

export function getResumableV0Assistant(messages: readonly Message[]): Message | undefined {
  return shouldResumeV0Chat(messages) ? messages[0] : undefined
}

/**
 * Prepends an older newest-first SDK page without replacing active AI SDK
 * message objects already present in local state.
 */
export function prependV0UIMessageHistory(
  current: readonly V0UIMessage[],
  olderNewestFirst: readonly Message[],
): V0UIMessage[] {
  const currentIds = new Set(current.map((message) => message.id))
  const older = toV0UIMessages(olderNewestFirst).filter((message) => !currentIds.has(message.id))
  return [...older, ...current]
}
