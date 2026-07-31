/**
 * v0-clone has no user accounts: every visitor shares the deployer's v0
 * workspace, API quota, and Vercel team resources. This same-origin check is
 * only a baseline against browser cross-origin abuse — it does not stop direct
 * non-browser requests. Replace or extend it with your application's session
 * auth before exposing a deployment to untrusted users, and keep Vercel
 * deployment protection enabled until then.
 */
export function authorizeProxyRequest(request: Request): Response | undefined {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }
}
