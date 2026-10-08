import type { Message, V0StreamFinal, V0StreamUpdate } from 'v0'

export function assistant(overrides: Partial<Message> = {}): Message {
  return {
    id: 'assistant_1',
    chatId: 'chat_1',
    role: 'assistant',
    content: 'Updated',
    createdAt: new Date(),
    updatedAt: new Date(),
    parts: [{ type: 'text', text: 'Updated' }],
    finishReason: 'stop',
    restorable: false,
    authorId: null,
    usage: {
      model: null,
      tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      creditsCost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    },
    ...overrides,
  }
}

export function update(message: Message): V0StreamUpdate {
  return {
    status: 'streaming',
    event: { object: 'message', ...message },
    message,
    parts: message.parts,
    usage: message.usage,
  }
}

export function done(message: Message): V0StreamFinal {
  return { ...update(message), status: 'done' }
}

export function wire(event: 'update' | 'done' | 'error', data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export function streamResponse(message: Message = assistant()): Response {
  return new Response(wire('update', update(message)) + wire('done', done(message)), {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
