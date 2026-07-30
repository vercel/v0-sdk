const defaultCloneOrigin = 'http://localhost:3000'

export function getCloneOrigin() {
  const configuredOrigin = process.env.V0_CLONE_ORIGIN ?? defaultCloneOrigin
  const url = new URL(configuredOrigin)

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('V0_CLONE_ORIGIN must be an HTTP(S) origin without a path.')
  }

  return url.origin
}
