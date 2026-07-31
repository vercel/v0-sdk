import 'server-only'

import { cookies } from 'next/headers'
import { createV0Client, vercelOidcAuth } from 'v0'

export const V0_PROXY_API_KEY_COOKIE =
  process.env.NODE_ENV === 'production'
    ? '__Host-v0-clone-preview-api-key'
    : 'v0-clone-preview-api-key'

async function getV0ApiKey() {
  if (process.env.V0_API_KEY) return process.env.V0_API_KEY

  const cookieStore = await cookies()
  return cookieStore.get(V0_PROXY_API_KEY_COOKIE)?.value
}

const oidcAuth = vercelOidcAuth()

export const v0 = createV0Client({
  auth: async (auth) => (await getV0ApiKey()) ?? oidcAuth(auth),
})
