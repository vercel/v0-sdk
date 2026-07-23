import { NextRequest, NextResponse } from 'next/server'
import type { Chat } from 'v0'
import { checkRateLimit, getUserIdentifier } from '@/lib/rate-limiter'
import { getV0Client, normalizeChat } from '@/lib/v0'

type ModelId = 'v0-auto' | 'v0-mini' | 'v0-pro' | 'v0-max' | 'v0-max-fast'

type Attachment = {
  url: string
}

const SYSTEM_PROMPT =
  'v0 MUST always generate code even if the user just says "hi" or asks a question. v0 MUST NOT ask the user to clarify their request.'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatId, modelId = 'v0-pro', imageGenerations = false } = body
    const attachments = normalizeAttachments(body.attachments)

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 },
      )
    }

    // Check rate limit for ALL generations (both new and existing chats)
    const userIdentifier = getUserIdentifier(request)
    const rateLimitResult = await checkRateLimit(userIdentifier)

    if (!rateLimitResult.success) {
      const resetTime = rateLimitResult.resetTime.toLocaleString()
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: `You've reached the limit of 3 generations per 12 hours. Please try again after ${resetTime}.`,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        },
      )
    }

    const v0 = getV0Client()
    const abortController = new AbortController()
    const encoder = new TextEncoder()
    const resolvedModelId = isModelId(modelId) ? modelId : 'v0-pro'

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        try {
          let upstreamError: unknown
          let latestChat: Chat | null = null

          const streamResult = chatId
            ? await v0.messages.sendStream(
                {
                  chatId,
                  message: message.trim(),
                  modelConfiguration: {
                    modelId: resolvedModelId,
                    imageGenerations: Boolean(imageGenerations),
                  },
                  ...(attachments.length > 0 && { attachments }),
                },
                {
                  signal: abortController.signal,
                  sseMaxRetryAttempts: 1,
                  onSseError: (error) => {
                    upstreamError = error
                  },
                },
              )
            : await v0.chats.createStream(
                {
                  systemPrompt: SYSTEM_PROMPT,
                  message: message.trim(),
                  modelConfiguration: {
                    modelId: resolvedModelId,
                    imageGenerations: Boolean(imageGenerations),
                  },
                  ...(attachments.length > 0 && { attachments }),
                },
                {
                  signal: abortController.signal,
                  sseMaxRetryAttempts: 1,
                  onSseError: (error) => {
                    upstreamError = error
                  },
                },
              )

          for await (const update of streamResult.stream) {
            if (abortController.signal.aborted) {
              return
            }

            if (update.chat) {
              latestChat = update.chat
              sendEvent('chat', { chat: normalizeChat(latestChat) })
            }
          }

          if (abortController.signal.aborted) {
            return
          }

          if (upstreamError) {
            sendEvent('error', {
              message: getErrorMessage(upstreamError),
            })
            return
          }

          if (!latestChat && !chatId) {
            sendEvent('error', {
              message: 'The v0 stream ended before returning a chat.',
            })
            return
          }

          sendEvent('done', latestChat ? { chat: normalizeChat(latestChat) } : {})
        } catch (error) {
          if (!abortController.signal.aborted) {
            sendEvent('error', {
              message: getErrorMessage(error),
            })
          }
        } finally {
          controller.close()
        }
      },
      cancel() {
        abortController.abort()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    // Check if it's an API key error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (
        errorMessage.includes('api key is required') ||
        errorMessage.includes('v0_api_key') ||
        errorMessage.includes('v0_api_key is required') ||
        errorMessage.includes('config.apikey')
      ) {
        return NextResponse.json(
          { error: 'API_KEY_MISSING', message: error.message },
          { status: 401 },
        )
      }

      return NextResponse.json(
        { error: `Failed to generate app: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate app. Please try again.' },
      { status: 500 },
    )
  }
}

function normalizeAttachments(value: unknown): Attachment[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((attachment) => {
    if (
      attachment &&
      typeof attachment === 'object' &&
      typeof (attachment as { url?: unknown }).url === 'string'
    ) {
      return [{ url: (attachment as { url: string }).url }]
    }

    return []
  })
}

function isModelId(value: unknown): value is ModelId {
  return (
    value === 'v0-auto' ||
    value === 'v0-mini' ||
    value === 'v0-pro' ||
    value === 'v0-max' ||
    value === 'v0-max-fast'
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  if (typeof error === 'string') return error

  return 'v0 streaming request failed'
}
