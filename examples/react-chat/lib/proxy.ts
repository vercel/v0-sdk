import 'server-only'

/** Replace or extend this same-origin check with your application's session auth. */
export function authorizeProxyRequest(request: Request): Response | undefined {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }
}

export function toJsonResponse(result: {
  data?: unknown
  error?: unknown
  response: Response
}): Response {
  return Response.json(result.error ?? result.data ?? null, { status: result.response.status })
}
