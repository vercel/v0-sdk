import { cookies } from 'next/headers'
import { createV0Client } from 'v0'
import { getCloneOrigin } from '@/lib/origins'
import { ensureTrustedPreviewHost, TrustedHostError } from '@/lib/trusted-host'
import { V0_PROXY_API_KEY_COOKIE } from '@/lib/v0-client'

const API_KEY_MAX_AGE = 60 * 60 * 4

export async function OPTIONS(request: Request) {
  const headers = getCorsHeaders(request)
  return new Response(null, { status: headers ? 204 : 403, headers })
}

export async function PUT(request: Request) {
  const corsHeaders = getCorsHeaders(request)
  if (!corsHeaders) return forbiddenResponse()

  if (process.env.V0_API_KEY) {
    return Response.json(
      {
        message:
          'The preview proxy already uses V0_API_KEY. Set it on the web app too, or remove it from the proxy.',
      },
      { status: 409, headers: corsHeaders },
    )
  }

  const body = (await request.json().catch(() => null)) as { apiKey?: unknown } | null
  const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''

  if (!apiKey) {
    return Response.json({ message: 'Enter a v0 API key.' }, { status: 400, headers: corsHeaders })
  }

  const hostname = new URL(request.url).hostname
  const client = createV0Client({ auth: apiKey })

  try {
    await ensureTrustedPreviewHost(client, hostname)
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : 'The preview proxy could not be configured.',
      },
      { status: error instanceof TrustedHostError ? error.status : 502, headers: corsHeaders },
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(V0_PROXY_API_KEY_COOKIE, apiKey, getCookieOptions(API_KEY_MAX_AGE))

  return Response.json({ configured: true }, { headers: corsHeaders })
}

export async function DELETE(request: Request) {
  const corsHeaders = getCorsHeaders(request)
  if (!corsHeaders) return forbiddenResponse()

  const cookieStore = await cookies()
  cookieStore.set(V0_PROXY_API_KEY_COOKIE, '', getCookieOptions(0))

  return Response.json({ configured: Boolean(process.env.V0_API_KEY) }, { headers: corsHeaders })
}

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin')
  if (origin !== getCloneOrigin()) return undefined

  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': origin,
    'Cache-Control': 'private, no-store',
    Vary: 'Origin',
  }
}

function getCookieOptions(maxAge: number) {
  const production = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    maxAge,
    partitioned: production,
    path: '/',
    sameSite: production ? ('none' as const) : ('lax' as const),
    secure: production,
  }
}

function forbiddenResponse() {
  return Response.json(
    { message: 'This origin cannot configure the preview proxy.' },
    { status: 403 },
  )
}
