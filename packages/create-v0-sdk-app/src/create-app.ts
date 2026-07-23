import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import degit from 'degit'
import picocolors from 'picocolors'
import type { PackageManager } from './helpers/get-pkg-manager.js'
import { install } from './helpers/install.js'
import { isFolderEmpty } from './helpers/is-folder-empty.js'

const { cyan, green, red } = picocolors

export type ExampleType = 'basic' | 'simple-v0'

type PackageJson = {
  module?: string
  name?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const packageVersions: Record<string, string> = {
  v0: 'canary',
  '@v0-sdk/ai-tools': 'canary',
}

const scriptDescriptions: Record<string, string> = {
  dev: 'Starts the development server.',
  sync: 'Runs the synchronous chat creation example.',
  stream: 'Runs the streaming chat creation example.',
  build: 'Builds the app for production.',
  start: 'Runs the built app in production mode.',
}

const scriptDisplayOrder = ['dev', 'sync', 'stream', 'build', 'start']

const basicScripts: Record<string, string> = {
  sync: 'tsx chats/sync.ts',
  stream: 'tsx chats/stream.ts',
}

const basicDevDependencies: Record<string, string> = {
  '@types/bun': 'latest',
  '@types/node': '^22.0.0',
  tsx: '^4.19.2',
  typescript: '^6.0.3',
}

const lockfiles = ['bun.lock', 'bun.lockb', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']

export async function createApp({
  appPath,
  packageManager,
  example,
  skipInstall,
}: {
  appPath: string
  packageManager: PackageManager
  example: ExampleType
  skipInstall: boolean
}): Promise<void> {
  const appName = basename(appPath)

  if (existsSync(appPath) && !isFolderEmpty(appPath, appName)) {
    process.exit(1)
  }

  console.log(`Creating a new v0 SDK app in ${green(appPath)}.`)
  console.log()

  const template = `vercel/v0-sdk/examples/${example}#v2`

  console.log(`Downloading template ${cyan(template)}. This might take a moment.`)
  console.log()

  try {
    await degit(template, { cache: false, force: true }).clone(appPath)
  } catch (error) {
    console.error(`Failed to download example ${red(example)}:`, error)
    console.error(`Example ${red(example)} does not exist or could not be downloaded.`)
    process.exit(1)
  }

  installAgentSkill(appPath)

  // Update package.json to use published packages instead of workspace references
  const packageJsonPath = join(appPath, 'package.json')
  let packageScripts: Record<string, string> | undefined
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson

    updateTemplatePackage(packageJson, example)

    // Replace workspace dependencies with actual versions
    const replaceWorkspaceDeps = (deps: Record<string, string> | undefined) => {
      if (!deps) return

      for (const [name, version] of Object.entries(deps)) {
        if (version === 'workspace:*') {
          // Map workspace packages to their published versions
          if (packageVersions[name]) {
            deps[name] = packageVersions[name]
          } else {
            // Fallback to latest version
            deps[name] = 'latest'
          }
        }
      }
    }

    replaceWorkspaceDeps(packageJson.dependencies)
    replaceWorkspaceDeps(packageJson.devDependencies)

    // Update the package name to match the app name
    packageJson.name = appName
    packageScripts = packageJson.scripts

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
    removeLockfiles(appPath)
  }

  process.chdir(appPath)

  if (!skipInstall) {
    console.log('Installing packages. This might take a couple of minutes.')
    console.log()

    await install(packageManager)
    console.log()
  }

  console.log(`${green('Success!')} Created ${appName} at ${appPath}`)

  const availableScripts = scriptDisplayOrder.filter((script) => packageScripts?.[script])

  if (availableScripts.length > 0) {
    console.log('Inside that directory, you can run several commands:')
    console.log()

    for (const script of availableScripts) {
      console.log(cyan(`  ${getRunCommand(packageManager, script)}`))
      console.log(`    ${scriptDescriptions[script]}`)
      console.log()
    }
  }

  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(cyan('  cd'), appName)

  if (skipInstall) {
    console.log(cyan(`  ${packageManager} install`))
  }

  const firstScript = availableScripts[0]
  if (firstScript) {
    console.log(cyan(`  ${getRunCommand(packageManager, firstScript)}`))
  }
  console.log()
}

function getRunCommand(packageManager: PackageManager, script: string): string {
  return `${packageManager} ${packageManager === 'npm' ? 'run ' : ''}${script}`
}

function updateTemplatePackage(packageJson: PackageJson, example: ExampleType): void {
  if (example !== 'basic') return

  packageJson.scripts = {
    ...basicScripts,
    ...packageJson.scripts,
  }
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    ...basicDevDependencies,
  }
  delete packageJson.module
  delete packageJson.peerDependencies
}

function installAgentSkill(appPath: string): void {
  const source = join(dirname(fileURLToPath(import.meta.url)), '..', 'templates', 'v0', 'SKILL.md')
  const destination = join(appPath, '.agents', 'skills', 'v0', 'SKILL.md')

  mkdirSync(dirname(destination), { recursive: true })
  copyFileSync(source, destination)
}

function removeLockfiles(appPath: string): void {
  for (const lockfile of lockfiles) {
    const lockfilePath = join(appPath, lockfile)
    if (existsSync(lockfilePath)) {
      unlinkSync(lockfilePath)
    }
  }
}
