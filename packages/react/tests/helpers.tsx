import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'

;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

export async function renderV0Hook(children: ReactNode): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer
  await act(async () => {
    renderer = create(<SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>)
  })
  return renderer
}

export async function flush(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
  })
}

export function message(id = 'message_1') {
  return {
    id,
    chatId: 'chat_1',
    role: 'assistant',
    createdAt: '2026-01-02T03:04:05.000Z',
    updatedAt: '2026-01-02T03:04:05.000Z',
    parts: [],
    attachments: [],
    finishReason: 'stop',
  }
}
