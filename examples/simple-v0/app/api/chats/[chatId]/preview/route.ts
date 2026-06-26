import { NextRequest, NextResponse } from 'next/server'
import { getV0Client, unwrapV0Response } from '@/lib/v0'

export const dynamic = 'force-dynamic'

const V0_APP_ORIGIN = 'https://v0.app'

type PreviewOpenResult =
  | {
      ok: true
      url: string
      status: number
      statusText: string
    }
  | {
      ok: false
      status: number
      statusText: string
      redirectedTo: string | null
      body: string
    }
  | {
      ok: false
      error: string
    }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const v0 = getV0Client()
    const rawPreviewUrl = await getPreviewUrl(v0, chatId)
    const openResult = rawPreviewUrl
      ? await getAuthenticatedPreviewUrl(rawPreviewUrl, chatId)
      : null
    const previewUrl = openResult?.ok ? openResult.url : rawPreviewUrl

    console.info('[simple-v0 preview API] getPreview', {
      chatId,
      hasPreviewUrl: Boolean(rawPreviewUrl),
      rawPreviewOrigin: rawPreviewUrl ? safeOrigin(rawPreviewUrl) : null,
      authenticated: Boolean(openResult?.ok),
      openResult: summarizeOpenResult(openResult),
    })

    return NextResponse.json(
      {
        previewUrl,
        rawPreviewUrl,
        authenticated: Boolean(openResult?.ok),
        debug: {
          rawPreviewOrigin: rawPreviewUrl ? safeOrigin(rawPreviewUrl) : null,
          previewOrigin: previewUrl ? safeOrigin(previewUrl) : null,
          openResult: summarizeOpenResult(openResult),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    )
  } catch (error) {
    console.error('[simple-v0 preview API] failed', { error })

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
        { error: `Failed to get preview: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: 'Failed to get preview' }, { status: 500 })
  }
}

async function getPreviewUrl(v0: ReturnType<typeof getV0Client>, chatId: string) {
  const response = await v0.chats.getPreview({
    chatId,
  })
  const preview = unwrapV0Response(response)

  return isPreviewDetails(preview.preview) ? preview.preview.url : null
}

function isPreviewDetails(value: unknown): value is { url: string } {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { url?: unknown }).url === 'string'
  )
}

async function getAuthenticatedPreviewUrl(
  rawPreviewUrl: string,
  chatId: string,
): Promise<PreviewOpenResult> {
  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'V0_API_KEY is required' }
  }

  const openUrl = new URL('/chat/api/vm/open', V0_APP_ORIGIN)
  openUrl.searchParams.set('vmUrl', rawPreviewUrl)
  openUrl.searchParams.set('chatId', chatId)

  try {
    const response = await fetch(openUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      redirect: 'manual',
      cache: 'no-store',
    })
    const location = response.headers.get('location')

    if (response.status >= 300 && response.status < 400 && location) {
      return {
        ok: true,
        url: new URL(location, openUrl).toString(),
        status: response.status,
        statusText: response.statusText,
      }
    }

    return {
      ok: false,
      status: response.status,
      statusText: response.statusText,
      redirectedTo: location,
      body: await response.text().catch(() => ''),
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown open error',
    }
  }
}

function summarizeOpenResult(result: PreviewOpenResult | null) {
  if (!result) return null

  if (result.ok) {
    return {
      ok: true,
      status: result.status,
      statusText: result.statusText,
      redirectOrigin: safeOrigin(result.url),
      hasSessionToken: result.url.includes('__v0_s='),
    }
  }

  if ('error' in result) {
    return result
  }

  return {
    ok: false,
    status: result.status,
    statusText: result.statusText,
    redirectedToOrigin: result.redirectedTo ? safeOrigin(result.redirectedTo) : null,
    redirectedToPath: result.redirectedTo ? safePath(result.redirectedTo) : null,
    body: result.body.slice(0, 500),
  }
}

function safeOrigin(value: string) {
  try {
    return new URL(value, V0_APP_ORIGIN).origin
  } catch {
    return null
  }
}

function safePath(value: string) {
  try {
    const url = new URL(value, V0_APP_ORIGIN)
    return url.pathname
  } catch {
    return null
  }
}
