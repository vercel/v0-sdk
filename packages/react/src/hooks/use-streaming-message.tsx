import { useRef, useSyncExternalStore } from 'react'
import { MessageBinaryFormat } from '../types'
import * as jsondiffpatch from 'jsondiffpatch'

const jdf = jsondiffpatch.create({})

// Exact copy of the patch function from v0/chat/lib/diffpatch.ts
function patch(original: any, delta: any) {
  const newObj = jdf.clone(original)

  // Check for our customized delta
  if (Array.isArray(delta) && delta[1] === 9 && delta[2] === 9) {
    // Get the path to the modified element
    const indexes = delta[0].slice(0, -1)
    // Get the string to be appended
    const value = delta[0].slice(-1)
    let obj = newObj as any
    for (const index of indexes) {
      if (typeof obj[index] === 'string') {
        obj[index] += value
        return newObj
      }
      obj = obj[index]
    }
  }

  // If not custom delta, apply standard jsondiffpatch-ing
  jdf.patch(newObj, delta)
  return newObj
}

export interface StreamingMessageState {
  content: MessageBinaryFormat
  isStreaming: boolean
  error?: string
  isComplete: boolean
}

export interface UseStreamingMessageOptions {
  onChunk?: (chunk: MessageBinaryFormat) => void
  onComplete?: (finalContent: MessageBinaryFormat) => void
  onError?: (error: string) => void
  onChatData?: (chatData: any) => void
}

// Stream state manager - isolated from React lifecycle
class StreamStateManager {
  private content: MessageBinaryFormat = []
  private isStreaming: boolean = false
  private error?: string
  private isComplete: boolean = false
  private callbacks = new Set<() => void>()
  private processedStreams = new WeakSet<ReadableStream<Uint8Array>>()
  private cachedState: StreamingMessageState | null = null

  subscribe = (callback: () => void) => {
    this.callbacks.add(callback)
    return () => {
      this.callbacks.delete(callback)
    }
  }

  private notifySubscribers = () => {
    // Invalidate cached state when state changes
    this.cachedState = null
    this.callbacks.forEach((callback) => callback())
  }

  getState = (): StreamingMessageState => {
    // Return cached state to prevent infinite re-renders
    if (this.cachedState === null) {
      this.cachedState = {
        content: this.content,
        isStreaming: this.isStreaming,
        error: this.error,
        isComplete: this.isComplete,
      }
    }
    return this.cachedState
  }

  processStream = async (
    stream: ReadableStream<Uint8Array>,
    options: UseStreamingMessageOptions = {},
  ): Promise<void> => {
    // Prevent processing the same stream multiple times
    if (this.processedStreams.has(stream)) {
      return
    }

    // Handle locked streams gracefully
    if (stream.locked) {
      console.warn('Stream is locked, cannot process')
      return
    }

    this.processedStreams.add(stream)
    this.reset()
    this.setStreaming(true)

    try {
      await this.readStream(stream, options)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown streaming error'
      this.setError(errorMessage)
      options.onError?.(errorMessage)
    } finally {
      this.setStreaming(false)
    }
  }

  private reset = () => {
    this.content = []
    this.isStreaming = false
    this.error = undefined
    this.isComplete = false
    this.notifySubscribers()
  }

  private setStreaming = (streaming: boolean) => {
    this.isStreaming = streaming
    this.notifySubscribers()
  }

  private setError = (error: string) => {
    this.error = error
    this.notifySubscribers()
  }

  private setComplete = (complete: boolean) => {
    this.isComplete = complete
    this.notifySubscribers()
  }

  private updateContent = (newContent: MessageBinaryFormat) => {
    this.content = [...newContent]
    this.notifySubscribers()
  }

  private readStream = async (
    stream: ReadableStream<Uint8Array>,
    options: UseStreamingMessageOptions,
  ): Promise<void> => {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let currentContent: MessageBinaryFormat = []

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim() === '') {
            continue
          }

          // Handle SSE format (data: ...)
          let jsonData: string
          if (line.startsWith('data: ')) {
            jsonData = line.slice(6) // Remove "data: " prefix
            if (jsonData === '[DONE]') {
              this.setComplete(true)
              options.onComplete?.(currentContent)
              return
            }
          } else {
            // Handle raw JSON lines (fallback)
            jsonData = line
          }

          try {
            // Parse the JSON data
            const parsedData = JSON.parse(jsonData)

            // Handle v0 streaming format
            if (parsedData.type === 'connected') {
              continue
            } else if (parsedData.type === 'done') {
              this.setComplete(true)
              options.onComplete?.(currentContent)
              return
            } else if (
              parsedData.object &&
              parsedData.object.startsWith('chat')
            ) {
              // Handle chat metadata messages (chat, chat.title, chat.name, etc.)
              options.onChatData?.(parsedData)
              continue
            } else if (parsedData.delta) {
              // Apply the delta using jsondiffpatch
              const patchedContent = patch(currentContent, parsedData.delta)
              currentContent = Array.isArray(patchedContent)
                ? (patchedContent as MessageBinaryFormat)
                : []

              this.updateContent(currentContent)
              options.onChunk?.(currentContent)
            }
          } catch (e) {
            console.warn('Failed to parse streaming data:', line, e)
          }
        }
      }

      this.setComplete(true)
      options.onComplete?.(currentContent)
    } finally {
      reader.releaseLock()
    }
  }
}

/**
 * Hook for handling streaming message content from v0 API using useSyncExternalStore
 */
export function useStreamingMessage(
  stream: ReadableStream<Uint8Array> | null,
  options: UseStreamingMessageOptions = {},
): StreamingMessageState {
  // Create a stable stream manager instance
  const managerRef = useRef<StreamStateManager | null>(null)
  if (!managerRef.current) {
    managerRef.current = new StreamStateManager()
  }

  const manager = managerRef.current

  // Subscribe to state changes using useSyncExternalStore
  const state = useSyncExternalStore(
    manager.subscribe,
    manager.getState,
    manager.getState,
  )

  // Process stream when it changes
  const lastStreamRef = useRef<ReadableStream<Uint8Array> | null>(null)

  if (stream !== lastStreamRef.current) {
    lastStreamRef.current = stream
    if (stream) {
      manager.processStream(stream, options)
    }
  }

  return state
}
