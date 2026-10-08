import type { Message, V0UIMessage } from '@v0-sdk/react'
import { toV0UIMessage } from '@v0-sdk/react'
import type { DesignModeMessage } from 'v0/browser'

export type DesignModeTurn = { text: string; assistant: Message | null }

export function designModeMessageText(message: Pick<DesignModeMessage, 'message'>): string {
  return message.message?.trim() || 'Design Mode edit'
}

/** The public API currently returns the internal Design Mode prompt as user text. */
export function persistedDesignModeText(text: string): string | null {
  if (
    !text.startsWith('The user has requested a refinement of the following design tweak results,')
  )
    return null
  const json = /```json\n([\s\S]*?)\n```/.exec(text)
  if (json) {
    try {
      const payload: unknown = JSON.parse(json[1]!)
      if (payload && typeof payload === 'object' && 'instructions' in payload) {
        const instructions = payload.instructions
        if (
          instructions &&
          typeof instructions === 'object' &&
          'message' in instructions &&
          typeof instructions.message === 'string'
        ) {
          return designModeMessageText({ message: instructions.message })
        }
      }
    } catch {
      /* Fall back to a label instead of exposing a malformed internal prompt. */
    }
  }
  return 'Design Mode edit'
}

/** Keep the optimistic user turn before the live assistant, then merge by server ID. */
export function withDesignModeTurn(
  messages: V0UIMessage[],
  turn: DesignModeTurn | null,
): V0UIMessage[] {
  if (!turn) return messages
  let assistant: V0UIMessage | null = null
  if (turn.assistant) assistant = toV0UIMessage(turn.assistant)
  if (assistant && messages.some((message) => message.id === assistant.id)) {
    const liveAssistant = assistant
    return messages.map((message) => {
      if (message.id !== liveAssistant.id || message.metadata?.finishReason) return message
      return liveAssistant
    })
  }
  const result: V0UIMessage[] = [
    ...messages,
    {
      id: 'pending-design-mode-user',
      role: 'user',
      parts: [{ type: 'text', text: turn.text, state: 'done' }],
    },
  ]
  if (assistant) result.push(assistant)
  return result
}
