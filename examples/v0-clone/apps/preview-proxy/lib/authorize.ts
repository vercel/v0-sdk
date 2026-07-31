/**
 * This proxy serves a credentialed channel into the preview of every chat in
 * the deployer's v0 workspace. The same-origin check below is only a baseline
 * against browser cross-origin abuse — it does not stop direct non-browser
 * requests, and a chat ID is not a secret. Replace or extend it with your
 * application's session auth, keyed to which viewer may see which chat, before
 * exposing a deployment to untrusted users.
 */
export function authorizeProxyRequest(request: Request): Response | undefined {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }
}
