import 'server-only'

import { relatedProjects, type VercelRelatedProject } from '@vercel/related-projects'

const LOCAL_PREVIEW_PROXY_URL = 'http://localhost:3001'

export function getPreviewProxyOrigin() {
  if (!process.env.VERCEL) return LOCAL_PREVIEW_PROXY_URL

  const relatedProject = getRelatedProject()
  const configuredUrl = process.env.V0_PREVIEW_PROXY_URL
  const resolvedUrl =
    process.env.VERCEL_ENV === 'preview'
      ? getPreviewUrl(relatedProject) || configuredUrl
      : configuredUrl || getProductionUrl(relatedProject)

  if (!resolvedUrl) {
    throw new Error(
      process.env.VERCEL_ENV === 'preview'
        ? 'Link the preview proxy as a Vercel Related Project or set V0_PREVIEW_PROXY_URL.'
        : 'V0_PREVIEW_PROXY_URL is required when the preview proxy is not a Vercel Related Project.',
    )
  }

  const url = new URL(resolvedUrl)

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('The preview proxy URL must be an HTTP(S) origin without a path.')
  }

  if (url.protocol !== 'https:') {
    throw new Error('The preview proxy URL must use HTTPS on Vercel.')
  }

  return url.origin
}

function getRelatedProject() {
  const projects = relatedProjects({ noThrow: true })

  if (projects.length > 1) {
    throw new Error('The web app must have only the preview proxy configured as a Related Project.')
  }

  return projects[0]
}

function getPreviewUrl(project?: VercelRelatedProject) {
  const host = project?.preview.customEnvironment || project?.preview.branch
  return host ? `https://${host}` : undefined
}

function getProductionUrl(project?: VercelRelatedProject) {
  const host = project?.production.alias || project?.production.url
  return host ? `https://${host}` : undefined
}
