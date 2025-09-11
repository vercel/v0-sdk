import { Readable } from 'node:stream'
import { sep, posix } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { mkdirSync } from 'node:fs'
import { x } from 'tar'
import { copy } from './copy'

export type RepoInfo = {
  username: string
  name: string
  branch: string
  filePath: string
}

export async function isUrlOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.status === 200
  } catch {
    return false
  }
}

export async function getRepoInfo(
  url: URL,
  examplePath?: string,
): Promise<RepoInfo | undefined> {
  const [, username, name, t, _branch, ...file] = url.pathname.split('/')
  const filePath = examplePath ? examplePath.replace(/^\//, '') : file.join('/')

  if (
    // Support repos whose entire purpose is to be a Next.js example, e.g.
    // https://github.com/:username/:my-cool-nextjs-example-repo-name.
    t === undefined ||
    // Support GitHub URL that ends with a trailing slash, e.g.
    // https://github.com/:username/:my-cool-nextjs-example-repo-name/
    // In this case "t" will be an empty string while the next part "_branch" will be undefined
    (t === '' && _branch === undefined)
  ) {
    try {
      const infoResponse = await fetch(
        `https://api.github.com/repos/${username}/${name}`,
      )
      if (infoResponse.status !== 200) {
        return
      }

      const info = await infoResponse.json()
      return { username, name, branch: info['default_branch'], filePath }
    } catch {
      return
    }
  }

  // Support GitHub URL that ends with a trailing slash, e.g.
  // https://github.com/:username/:my-cool-nextjs-example-repo-name/tree/my-cool-branch/
  // In this case "t" will be "tree" and "_branch" will be the branch name
  if (t === 'tree' && _branch) {
    return { username, name, branch: _branch, filePath }
  }

  return { username, name, branch: 'main', filePath }
}

export function hasRepo({
  username,
  name,
  branch,
  filePath,
}: RepoInfo): Promise<boolean> {
  const contentsUrl = `https://api.github.com/repos/${username}/${name}/contents`
  const packagePath = `${filePath ? `/${filePath}` : ''}/package.json`

  return isUrlOk(`${contentsUrl}${packagePath}?ref=${branch}`)
}

export async function downloadAndExtractRepo(
  root: string,
  { username, name, branch, filePath }: RepoInfo,
): Promise<void> {
  const tempFile = `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`

  // Ensure the target directory exists
  mkdirSync(root, { recursive: true })

  const response = await fetch(tempFile)
  if (!response.body) {
    throw new Error('Failed to fetch repository')
  }

  return pipeline(
    Readable.fromWeb(response.body as any),
    x({
      cwd: root,
      strip: filePath ? filePath.split('/').length + 1 : 1,
      filter: (path) => {
        const chunks = path.split('/')
        if (filePath) {
          const filePathChunks = filePath.split('/')
          if (
            chunks.length <= filePathChunks.length ||
            filePathChunks.some((chunk, i) => chunks[i + 1] !== chunk)
          ) {
            return false
          }
        }
        const [, ...fileChunks] = chunks
        const target = fileChunks.join('/')
        return !target.startsWith('.git')
      },
    }),
  )
}

export async function downloadAndExtractExample(
  repoUrl: string,
  examplePath: string,
  appPath: string,
): Promise<void> {
  const url = new URL(repoUrl)
  const repoInfo = await getRepoInfo(url, examplePath)

  if (!repoInfo) {
    throw new Error(`Could not get repository info for ${repoUrl}`)
  }

  const hasExample = await hasRepo(repoInfo)
  if (!hasExample) {
    throw new Error(`Example "${examplePath}" not found in repository`)
  }

  await downloadAndExtractRepo(appPath, repoInfo)
}
