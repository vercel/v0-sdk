import { cookies } from 'next/headers'
import { createV0Client } from 'v0'
import { V0_API_KEY_COOKIE } from '@/lib/v0-client'

const MAX_API_KEY_LENGTH = 3_500
const API_KEY_MAX_AGE = 60 * 60 * 24 * 30

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as { apiKey?: unknown } | null
  const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''

  if (!apiKey) {
    return Response.json({ message: 'Enter a v0 API key.' }, { status: 400 })
  }

  if (apiKey.length > MAX_API_KEY_LENGTH) {
    return Response.json({ message: 'The API key is too long.' }, { status: 400 })
  }

  const result = await createV0Client({ auth: apiKey })
    .chats.list({ limit: 1 })
    .catch(() => null)

  if (!result) {
    return Response.json(
      { message: 'The v0 API key could not be validated. Try again.' },
      { status: 502 },
    )
  }

  if (result.error) {
    return Response.json(
      { message: result.error.message || 'The v0 API key could not be validated.' },
      { status: result.response.status },
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(V0_API_KEY_COOKIE, apiKey, {
    httpOnly: true,
    maxAge: API_KEY_MAX_AGE,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })

  return Response.json({ configured: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.set(V0_API_KEY_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })

  return Response.json({ configured: Boolean(process.env.V0_API_KEY) })
}
