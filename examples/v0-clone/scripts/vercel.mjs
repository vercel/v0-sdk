import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'

const [action, app] = process.argv.slice(2)
const appRoot = process.cwd()

function findAncestor(predicate) {
  let directory = resolve(appRoot)

  while (true) {
    if (predicate(directory)) return directory

    const parent = dirname(directory)
    if (parent === directory) return undefined
    directory = parent
  }
}

const repositoryRoot = findAncestor(
  (directory) =>
    existsSync(join(directory, 'packages/v0-sdk/package.json')) &&
    existsSync(join(directory, 'packages/react/package.json')),
)

const cloneRoot = findAncestor(
  (directory) =>
    existsSync(join(directory, 'apps/web/package.json')) &&
    existsSync(join(directory, 'apps/preview-proxy/package.json')),
)

const workspaceRoot = repositoryRoot ?? cloneRoot

if (!workspaceRoot) {
  throw new Error('Could not find the v0 clone workspace root.')
}

function run(args, cwd) {
  const result = spawnSync('bun', args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

if (action === 'install') {
  run(['install'], workspaceRoot)
} else if (action === 'build') {
  if (repositoryRoot) {
    run(['--filter', 'v0', 'build'], repositoryRoot)

    if (app === 'web') {
      run(['--filter', '@v0-sdk/react', 'build'], repositoryRoot)
    }
  }

  run(['run', 'build'], appRoot)
} else {
  throw new Error(`Unknown Vercel action: ${action}`)
}
