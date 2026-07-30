import { NextResponse, type NextRequest } from 'next/server'

const previewPath = /^\/api\/v0-preview\/([^/]+)(?:\/|$)/

export function proxy(request: NextRequest) {
  const referer = request.headers.get('referer')
  if (!referer) return NextResponse.next()
  if (!URL.canParse(referer)) return NextResponse.next()

  const refererUrl = new URL(referer)
  if (refererUrl.origin !== request.nextUrl.origin) return NextResponse.next()

  const chatId = refererUrl.pathname.match(previewPath)?.[1]
  if (!chatId) return NextResponse.next()

  const proxyUrl = request.nextUrl.clone()
  proxyUrl.pathname = `/api/v0-preview/${chatId}${request.nextUrl.pathname}`

  return NextResponse.redirect(proxyUrl, 307)
}

export const config = {
  matcher: '/((?!api/v0-preview/).*)',
}
