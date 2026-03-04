import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { guestRegex, isDevelopmentEnvironment } from './lib/constants'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 })
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const hasFileExtension = /\.[^/]+$/.test(pathname)
  const fetchDestination = request.headers.get('sec-fetch-dest')
  const acceptHeader = request.headers.get('accept') ?? ''
  const isAssetRequestDestination =
    fetchDestination !== null &&
    fetchDestination !== 'document' &&
    fetchDestination !== 'empty'
  const isAssetAcceptHeader =
    acceptHeader.includes('image/') ||
    acceptHeader.includes('text/css') ||
    acceptHeader.includes('javascript') ||
    acceptHeader.includes('font/') ||
    acceptHeader.includes('application/manifest+json')
  const isPublicFileRequest =
    hasFileExtension &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/chats/') &&
    !pathname.startsWith('/projects/') &&
    (isAssetRequestDestination || isAssetAcceptHeader)

  // Allow static assets from /public, but keep route-like document requests auth-gated.
  if (isPublicFileRequest) {
    return NextResponse.next()
  }

  // Check for required environment variables
  if (!process.env.AUTH_SECRET) {
    console.error(
      '❌ Missing AUTH_SECRET environment variable. Please check your .env file.',
    )
    return NextResponse.next() // Let the app handle the error with better UI
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  })

  if (!token) {
    // Allow API routes to proceed without authentication for anonymous chat creation
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // Allow homepage for anonymous users
    if (pathname === '/') {
      return NextResponse.next()
    }

    // Redirect protected pages to login
    if (['/chats', '/projects'].some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Allow login and register pages
    if (['/login', '/register'].includes(pathname)) {
      return NextResponse.next()
    }

    // For any other protected routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const isGuest = guestRegex.test(token?.email ?? '')

  if (token && !isGuest && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/chats/:path*',
    '/projects/:path*',
    '/api/:path*',
    '/login',
    '/register',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
