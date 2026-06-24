export interface GenerationActivity {
  id: string
  type: string
  status: 'active' | 'complete'
  label: string
  text?: string
  filePath?: string
}

export interface GenerationDoneEvent {
  chat?: any
  activities?: GenerationActivity[]
}

interface ReadGenerationStreamHandlers {
  onActivities?: (activities: GenerationActivity[]) => void
  onChat?: (chat: any) => void
}

export async function readGenerationStream(
  response: Response,
  handlers: ReadGenerationStreamHandlers = {},
): Promise<GenerationDoneEvent> {
  if (!response.body) {
    throw new Error('Generation stream did not include a response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let doneEvent: GenerationDoneEvent | null = null

  const dispatch = (rawEvent: string) => {
    const parsed = parseSseEvent(rawEvent)
    if (!parsed) return

    const { event, data } = parsed

    if (event === 'activities') {
      const activities = Array.isArray(data.activities) ? data.activities : []
      handlers.onActivities?.(activities)
      return
    }

    if (event === 'chat') {
      if (data.chat) {
        handlers.onChat?.(data.chat)
      }
      return
    }

    if (event === 'done') {
      doneEvent = data
      return
    }

    if (event === 'error') {
      throw new Error(data.message || data.error || 'Generation failed')
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() ?? ''

      for (const chunk of chunks) {
        dispatch(chunk)
      }
    }

    const remaining = buffer + decoder.decode()
    if (remaining.trim()) {
      dispatch(remaining)
    }
  } finally {
    reader.releaseLock()
  }

  if (!doneEvent) {
    throw new Error('Generation stream ended before completion')
  }

  return doneEvent
}

function parseSseEvent(rawEvent: string) {
  let event = 'message'
  const dataLines: string[] = []

  for (const line of rawEvent.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.replace(/^event:\s*/, '')
    } else if (line.startsWith('data:')) {
      dataLines.push(line.replace(/^data:\s*/, ''))
    }
  }

  if (dataLines.length === 0) return null

  try {
    return {
      event,
      data: JSON.parse(dataLines.join('\n')),
    }
  } catch {
    return {
      event,
      data: { message: dataLines.join('\n') },
    }
  }
}
