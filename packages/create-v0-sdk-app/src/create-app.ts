import { basename, dirname, join, resolve } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { cyan, green, red } from 'picocolors'
import { copy } from './helpers/copy'
import type { PackageManager } from './helpers/get-pkg-manager'
import { install } from './helpers/install'
import { isFolderEmpty } from './helpers/is-folder-empty'
import { getOnline } from './helpers/is-online'

export type ExampleType =
  | 'ai-tools-example'
  | 'classic-v0'
  | 'v0-clone'
  | 'v0-sdk-react-example'

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

  // Find the examples directory relative to this package
  const packageRoot = resolve(__dirname, '..')
  const monorepoRoot = resolve(packageRoot, '../..')
  const examplesDir = join(monorepoRoot, 'examples')
  const examplePath = join(examplesDir, example)

  if (!existsSync(examplePath)) {
    console.error(`Example ${red(example)} does not exist.`)
    process.exit(1)
  }

  // Copy the example to the target directory
  await copy(['**'], appPath, {
    cwd: examplePath,
    rename: (name) => {
      // Rename gitignore template to .gitignore
      if (name === 'gitignore') {
        return '.gitignore'
      }
      return name
    },
  })

  // Update package.json to use published packages instead of workspace references
  const packageJsonPath = join(appPath, 'package.json')
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

    // Replace workspace dependencies with actual versions
    const replaceWorkspaceDeps = (deps: Record<string, string> | undefined) => {
      if (!deps) return

      for (const [name, version] of Object.entries(deps)) {
        if (version === 'workspace:*') {
          // Map workspace packages to their published versions
          const packageVersions: Record<string, string> = {
            'v0-sdk': '^0.11.0',
            '@v0-sdk/react': '^0.3.0',
            '@v0-sdk/ai-tools': '^0.1.0',
          }

          if (packageVersions[name]) {
            deps[name] = packageVersions[name]
          } else {
            // Fallback to monorepo version
            const rootPackageJson = JSON.parse(
              readFileSync(join(monorepoRoot, 'package.json'), 'utf8'),
            )
            deps[name] = `^${rootPackageJson.version}`
          }
        }
      }
    }

    replaceWorkspaceDeps(packageJson.dependencies)
    replaceWorkspaceDeps(packageJson.devDependencies)

    // Update the package name to match the app name
    packageJson.name = appName

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  }

  process.chdir(appPath)

  if (!skipInstall) {
    console.log('Installing packages. This might take a couple of minutes.')
    console.log()

    const isOnline = await getOnline()
    await install(packageManager, isOnline)
    console.log()
  }

  console.log(`${green('Success!')} Created ${appName} at ${appPath}`)
  console.log('Inside that directory, you can run several commands:')
  console.log()
  console.log(
    cyan(`  ${packageManager} ${packageManager === 'npm' ? 'run ' : ''}dev`),
  )
  console.log('    Starts the development server.')
  console.log()
  console.log(
    cyan(`  ${packageManager} ${packageManager === 'npm' ? 'run ' : ''}build`),
  )
  console.log('    Builds the app for production.')
  console.log()

  if (example !== 'ai-tools-example') {
    console.log(
      cyan(
        `  ${packageManager} ${packageManager === 'npm' ? 'run ' : ''}start`,
      ),
    )
    console.log('    Runs the built app in production mode.')
    console.log()
  }

  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(cyan('  cd'), appName)

  if (skipInstall) {
    console.log(cyan(`  ${packageManager} install`))
  }

  console.log(
    cyan(`  ${packageManager} ${packageManager === 'npm' ? 'run ' : ''}dev`),
  )
  console.log()
}
