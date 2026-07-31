import { createV0Client } from 'v0'

type V0Client = ReturnType<typeof createV0Client>

const MAX_TRUSTED_HOSTS = 5

export class TrustedHostError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export async function ensureTrustedPreviewHost(client: V0Client, hostname: string) {
  if (isLocalhost(hostname)) return

  const trustedHostsResult = await client.settings.getPreviewHosts().catch(() => null)

  if (!trustedHostsResult) {
    throw new TrustedHostError('The trusted preview hosts could not be loaded.', 502)
  }

  if (trustedHostsResult.error) {
    throw new TrustedHostError(
      trustedHostsResult.error.message || 'The v0 credential could not be validated.',
      trustedHostsResult.response.status,
    )
  }

  const hosts = trustedHostsResult.data.hosts

  if (!isTrustedPreviewHost(hostname, hosts)) {
    if (hosts.length >= MAX_TRUSTED_HOSTS) {
      throw new TrustedHostError(
        'v0 already has five trusted preview hosts. Remove one and try again.',
        409,
      )
    }

    const updateResult = await client.settings
      .setPreviewHosts({ hosts: [...hosts, hostname] })
      .catch(() => null)

    if (!updateResult) {
      throw new TrustedHostError('This preview proxy could not add itself as a trusted host.', 502)
    }

    if (updateResult.error) {
      throw new TrustedHostError(
        updateResult.error.message || 'This preview proxy could not add itself as a trusted host.',
        updateResult.response.status,
      )
    }
  }
}

function isLocalhost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

function isTrustedPreviewHost(hostname: string, patterns: string[]) {
  const normalizedHostname = hostname.toLowerCase()
  const hostLabels = normalizedHostname.split('.')

  return patterns.some((value) => {
    const pattern = value.toLowerCase()

    if (pattern.startsWith('**.')) {
      const suffixLabels = pattern.slice(3).split('.')
      return (
        hostLabels.length > suffixLabels.length &&
        hostLabels.slice(-suffixLabels.length).join('.') === suffixLabels.join('.')
      )
    }

    if (pattern.startsWith('*.')) {
      const suffixLabels = pattern.slice(2).split('.')
      return (
        hostLabels.length === suffixLabels.length + 1 &&
        hostLabels.slice(1).join('.') === suffixLabels.join('.')
      )
    }

    return pattern === normalizedHostname
  })
}
