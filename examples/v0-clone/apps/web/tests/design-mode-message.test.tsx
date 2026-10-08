import { describe, expect, test } from 'bun:test'
import { act, create } from 'react-test-renderer'
import type { V0UIMessage } from '@v0-sdk/react'
import { MessageParts } from '../components/chat/message-parts'
import { ConversationView } from '../components/chat/conversation-view'
import {
  designModeMessageText,
  persistedDesignModeText,
  withDesignModeTurn,
} from '../lib/design-mode-message'
import { assistant } from './design-mode-stream'

;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

function prompt(instructions: string) {
  return (
    'The user has requested a refinement of the following design tweak results, defined in the following JSON format with an attached screenshot. Please apply these changes:\n```json\n' +
    JSON.stringify({
      edits: [{ type: 'style', changes: { fontSize: { from: '32px', to: '48px' } } }],
      instructions: { message: instructions, element: '#heading' },
    }) +
    '\n```'
  )
}

const user: V0UIMessage = {
  id: 'user_1',
  role: 'user',
  parts: [{ type: 'text', text: 'Previous request' }],
}

describe('compact Design Mode user messages', () => {
  test('uses human instructions or a concise fallback for both optimistic and persisted turns', () => {
    expect(designModeMessageText({ message: ' Make it blue ' })).toBe('Make it blue')
    expect(designModeMessageText({ message: '' })).toBe('Design Mode edit')
    expect(persistedDesignModeText(prompt('Make it blue'))).toBe('Make it blue')
    expect(persistedDesignModeText(prompt(''))).toBe('Design Mode edit')
  })

  test('does not collapse ordinary user messages containing JSON or markdown', () => {
    expect(persistedDesignModeText('Use this JSON: ```json\n{"message":"Hello"}\n```')).toBeNull()
  })

  test('does not expose malformed internal payloads', () => {
    const malformed = prompt('Hello').replace('"edits"', 'invalid-json')
    expect(persistedDesignModeText(malformed)).toBe('Design Mode edit')
  })

  test('renders only instructions, with no screenshot, raw prompt, or JSON code block', async () => {
    let renderer!: ReturnType<typeof create>
    await act(async () => {
      renderer = create(
        <MessageParts
          message={{
            id: 'user_2',
            role: 'user',
            parts: [
              {
                type: 'file',
                url: 'https://assets.example/a-very-long-screenshot-url.jpg',
                mediaType: 'image/jpeg',
              },
              { type: 'text', text: prompt('Make the heading 48px') },
            ],
          }}
        />,
      )
    })
    expect(renderer.root.findByType('p').children).toEqual(['Make the heading 48px'])
    expect(renderer.root.findAllByType('pre')).toHaveLength(0)
    expect(renderer.root.findAllByType('img')).toHaveLength(0)
    expect(JSON.stringify(renderer.toJSON())).not.toContain('Attached file')
    expect(JSON.stringify(renderer.toJSON())).not.toContain('assets.example')
    expect(JSON.stringify(renderer.toJSON())).not.toContain('"edits"')
    await act(async () => {
      renderer.unmount()
    })
  })

  test('hides other user attachments and wraps long text instead of building a markdown code block', async () => {
    let renderer!: ReturnType<typeof create>
    const text = 'https://example.com/' + 'x'.repeat(1000)
    await act(async () => {
      renderer = create(
        <MessageParts
          message={{
            id: 'user_3',
            role: 'user',
            parts: [
              { type: 'file', url: 'data:image/png;base64,hidden', mediaType: 'image/png' },
              { type: 'text', text },
            ],
          }}
        />,
      )
    })
    const paragraph = renderer.root.findByType('p')
    expect(paragraph.props['className']).toContain('[overflow-wrap:anywhere]')
    expect(paragraph.children).toEqual([text])
    expect(JSON.stringify(renderer.toJSON())).not.toContain('base64')
    await act(async () => {
      renderer.unmount()
    })
  })
})

describe('optimistic Design Mode conversation', () => {
  test('places the optimistic user before the live assistant without mutating history', () => {
    const live = assistant({
      finishReason: null,
      content: '',
      parts: [{ type: 'file-read', paths: ['app/page.tsx'] }],
    })
    const messages = withDesignModeTurn([user], { text: 'Make it blue', assistant: live })
    expect(messages.map((message) => message.role)).toEqual(['user', 'user', 'assistant'])
    expect(messages[1]!.parts).toEqual([{ type: 'text', text: 'Make it blue', state: 'done' }])
    expect(messages[2]!.parts[0]?.type).toBe('data-v0-file-read')
    expect(user.parts[0]).toEqual({ type: 'text', text: 'Previous request' })
  })

  test('merges streamed updates by server ID without duplicating the user or assistant', () => {
    const persisted: V0UIMessage = {
      id: 'assistant_1',
      role: 'assistant',
      parts: [],
      metadata: { finishReason: null },
    }
    const messages = withDesignModeTurn([user, persisted], {
      text: 'Make it blue',
      assistant: assistant(),
    })
    expect(messages).toHaveLength(2)
    expect(messages[1]!.parts[0]).toMatchObject({ type: 'text', text: 'Updated' })
  })

  test('does not overwrite authoritative completed history with a partial stream snapshot', () => {
    const persisted: V0UIMessage = {
      id: 'assistant_1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Final' }],
      metadata: { finishReason: 'stop' },
    }
    const messages = withDesignModeTurn([user, persisted], {
      text: 'Make it blue',
      assistant: assistant({ finishReason: null, content: '', parts: [] }),
    })
    expect(messages[1]).toBe(persisted)
  })

  test('shows intent and processing feedback even before the first assistant event', async () => {
    let renderer!: ReturnType<typeof create>
    const messages = withDesignModeTurn([], { text: 'Make it blue', assistant: null })
    await act(async () => {
      renderer = create(
        <ConversationView
          messages={messages}
          isProcessing
          processingLabel="Applying design changes…"
        />,
      )
    })
    expect(renderer.root.findByType('p').children).toEqual(['Make it blue'])
    expect(renderer.root.findByProps({ role: 'status' }).children).toContain(
      'Applying design changes…',
    )
    expect(renderer.root.findAllByType('pre')).toHaveLength(0)
    await act(async () => {
      renderer.unmount()
    })
  })
})
