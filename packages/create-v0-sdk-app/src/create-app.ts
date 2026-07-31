import { basename, dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
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

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as {
  version: string
}

export type ExampleType = 'v0-clone'

type PackageJson = {
  name?: string
  packageManager?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const packageVersions: Record<string, string> = {
  v0: packageJson.version,
  '@v0-sdk/ai-tools': packageJson.version,
  '@v0-sdk/react': packageJson.version,
}

const scriptDescriptions: Record<string, string> = {
  dev: 'Starts the web app and preview proxy.',
  build: 'Builds both apps for production.',
  start: 'Runs both built apps in production mode.',
}

const scriptDisplayOrder = ['dev', 'build', 'start']

const templateDirectories: Record<ExampleType, string> = {
  'v0-clone': 'v0-clone',
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

  const template = `vercel/v0-sdk/examples/${templateDirectories[example]}#v${packageJson.version}`

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

  const rootPackageJsonPath = join(appPath, 'package.json')
  let packageScripts: Record<string, string> | undefined
  if (existsSync(rootPackageJsonPath)) {
    for (const packageJsonPath of findPackageJsonPaths(appPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson

      const replaceWorkspaceDeps = (deps: Record<string, string> | undefined) => {
        if (!deps) return

        for (const [name, version] of Object.entries(deps)) {
          if (version === 'workspace:*') {
            if (packageVersions[name]) {
              deps[name] = packageVersions[name]
            } else {
              deps[name] = 'latest'
            }
          }
        }
      }

      replaceWorkspaceDeps(packageJson.dependencies)
      replaceWorkspaceDeps(packageJson.devDependencies)

      if (packageJsonPath === rootPackageJsonPath) {
        packageJson.name = appName
        packageJson.packageManager = getPackageManagerField(packageManager)
        packageScripts = packageJson.scripts
      }

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
    }
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
  console.log()
  console.log(`Copy ${cyan('.env.example')} to ${cyan('.env.local')} before starting the app.`)
  console.log(`Add your ${cyan('V0_API_KEY')} to ${cyan('.env.local')}.`)
  console.log(`Create an API key at ${cyan('https://v0.app/settings/keys')}.`)

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

function getPackageManagerField(packageManager: PackageManager): string {
  const version = execFileSync(packageManager, ['--version'], {
    encoding: 'utf8',
  }).trim()

  return `${packageManager}@${version}`
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

function findPackageJsonPaths(directory: string): string[] {
  const packageJsonPaths: string[] = []

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue

    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      packageJsonPaths.push(...findPackageJsonPaths(entryPath))
    } else if (entry.name === 'package.json') {
      packageJsonPaths.push(entryPath)
    }
  }

  return packageJsonPaths
}
