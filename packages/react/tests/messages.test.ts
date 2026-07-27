import { describe, expect, test } from 'bun:test'

import {
  prependV0UIMessageHistory,
  shouldResumeV0Chat,
  toV0UIMessage,
  toV0UIMessages,
} from '../src/chat'
import { message } from './helpers'

describe('v0 UI messages', () => {
  test('converts standard, files, tools, and rich parts with serialized metadata', () => {
    const source = message({
      id: 'assistant_1',
      role: 'assistant',
      finishReason: 'stop',
      attachments: [{ url: 'https://example.com/a', name: 'a.bin' }],
      parts: [
        { type: 'thinking', text: 'reason' },
        { type: 'text', text: 'answer' },
        { type: 'file-read', paths: ['app/page.tsx'] },
        { type: 'tool-call', name: 'lookup', input: { id: 1 }, output: { ok: true }, status: 'ok' },
        { type: 'agent-action', name: 'diagnostics', summary: 'Checked diagnostics' },
      ],
    })

    const converted = toV0UIMessage(source)
    expect(converted.id).toBe(source.id)
    expect(converted.parts.map((part) => part.type)).toEqual([
      'file',
      'reasoning',
      'text',
      'data-v0-file-read',
      'data-v0-tool-call',
      'data-v0-agent-action',
    ])
    expect(converted.metadata).toMatchObject({
      id: source.id,
      chatId: source.chatId,
      createdAt: source.createdAt.toISOString(),
    })
  })

  test('reverses newest-first persisted history and only resumes unfinished tails', () => {
    const user = message({ id: 'user_1', role: 'user', finishReason: 'stop' })
    const assistant = message({ id: 'assistant_1', role: 'assistant', finishReason: null })
    expect(toV0UIMessages([assistant, user]).map((item) => item.id)).toEqual([
      'user_1',
      'assistant_1',
    ])
    expect(shouldResumeV0Chat([assistant, user])).toBe(true)
    expect(shouldResumeV0Chat([{ ...assistant, finishReason: 'stop' }, user])).toBe(false)
  })

  test('prepends newly paginated history without replacing active messages', () => {
    const current = toV0UIMessages([
      message({ id: 'assistant_2', role: 'assistant' }),
      message({ id: 'user_2', role: 'user' }),
    ])
    const active = current.at(-1)!
    const merged = prependV0UIMessageHistory(current, [
      message({ id: 'user_2', role: 'user' }),
      message({ id: 'user_1', role: 'user' }),
    ])
    expect(merged.map((item) => item.id)).toEqual(['user_1', 'user_2', 'assistant_2'])
    expect(merged.at(-1)).toBe(active)
  })
})
