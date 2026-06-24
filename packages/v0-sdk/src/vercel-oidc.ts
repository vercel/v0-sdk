import { getVercelOidcToken } from '@vercel/oidc'
import type { Auth, AuthToken } from './generated/core/auth.gen'

type GetVercelOidcToken = () => AuthToken | Promise<AuthToken>

export type VercelOidcAuthOptions = {
  /**
   * Override token minting. Useful for tests or if the caller already wraps
   * `getVercelOidcToken`.
   */
  getToken?: GetVercelOidcToken
}

/**
 * Returns an auth callback for Vercel project-scoped OIDC authentication.
 *
 * Use this from server-side code running on Vercel with OIDC enabled:
 *
 * ```ts
 * import { createV0Client } from 'v0'
 *
 * const v0 = createV0Client()
 * ```
 *
 * The v0 API treats the token as a project-scoped identity: it can only access
 * resources associated with the Vercel project that minted the OIDC token.
 */
export function vercelOidcAuth(options: VercelOidcAuthOptions = {}) {
  return async (_auth?: Auth): Promise<AuthToken> => {
    return (options.getToken ?? getVercelOidcToken)()
  }
}
