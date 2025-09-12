#!/usr/bin/env node

import { Command } from 'commander'
import { existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { blue, bold, cyan, green, red } from 'picocolors'
import type { InitialReturnValue } from 'prompts'
import prompts from 'prompts'
import { createApp, type ExampleType } from './create-app'
import type { PackageManager } from './helpers/get-pkg-manager'
import { getPkgManager } from './helpers/get-pkg-manager'
import { isFolderEmpty } from './helpers/is-folder-empty'
import { validateNpmName } from './helpers/validate-pkg'
import packageJson from '../package.json'

let projectPath: string = ''

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

const onPromptState = (state: {
  value: InitialReturnValue
  aborted: boolean
  exited: boolean
}) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h')
    process.stdout.write('\n')
    process.exit(1)
  }
}

const examples: { name: ExampleType; description: string }[] = [
  {
    name: 'v0-clone',
    description:
      'Next.js app that replicates the v0.dev interface (Recommended)',
  },
  {
    name: 'simple-v0',
    description: 'The simplest way to use v0 - just prompt and see your app',
  },
  {
    name: 'classic-v0',
    description:
      'Full-featured Next.js app similar to the original v0.dev released in 2023',
  },
  {
    name: 'v0-sdk-react-example',
    description: 'Next.js example using @v0-sdk/react components',
  },
  {
    name: 'ai-tools-example',
    description:
      'Node.js example using @v0-sdk/ai-tools with AI SDK + AI Gateway',
  },
]

const program = new Command(packageJson.name)
  .version(
    packageJson.version,
    '-v, --version',
    'Output the current version of create-v0-sdk-app.',
  )
  .argument('[directory]')
  .usage('[directory] [options]')
  .helpOption('-h, --help', 'Display this help message.')
  .option(
    '-e, --example <example-name>',
    `
  
  An example to bootstrap the app with. Available examples:
  ${examples.map((ex) => `  • ${ex.name}: ${ex.description}`).join('\n  ')}
`,
  )
  .option(
    '--use-pnpm',
    'Explicitly tell the CLI to bootstrap the application using pnpm (recommended).',
  )
  .option(
    '--use-npm',
    'Explicitly tell the CLI to bootstrap the application using npm.',
  )
  .option(
    '--use-yarn',
    'Explicitly tell the CLI to bootstrap the application using Yarn.',
  )
  .option(
    '--use-bun',
    'Explicitly tell the CLI to bootstrap the application using Bun.',
  )
  .option(
    '--skip-install',
    'Explicitly tell the CLI to skip installing packages.',
  )
  .action((name) => {
    if (name && !name.startsWith('--no-')) {
      projectPath = name
    }
  })
  .allowUnknownOption()
  .parse(process.argv)

const opts = program.opts()

const packageManager: PackageManager = !!opts.usePnpm
  ? 'pnpm'
  : !!opts.useNpm
    ? 'npm'
    : !!opts.useYarn
      ? 'yarn'
      : !!opts.useBun
        ? 'bun'
        : getPkgManager()

async function run(): Promise<void> {
  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim()
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: 'text',
      name: 'path',
      message: 'What is your project named?',
      initial: 'my-v0-app',
      validate: (name) => {
        const validation = validateNpmName(basename(resolve(name)))
        if (validation.valid) {
          return true
        }
        return 'Invalid project name: ' + validation.problems[0]
      },
    })

    if (typeof res.path === 'string') {
      projectPath = res.path.trim()
    }
  }

  if (!projectPath) {
    console.log(
      '\nPlease specify the project directory:\n' +
        `  ${cyan(program.name())} ${green('<project-directory>')}\n` +
        'For example:\n' +
        `  ${cyan(program.name())} ${green('my-v0-app')}\n\n` +
        `Run ${cyan(`${program.name()} --help`)} to see all options.`,
    )
    process.exit(1)
  }

  const appPath = resolve(projectPath)
  const appName = basename(appPath)

  const validation = validateNpmName(appName)
  if (!validation.valid) {
    console.error(
      `Could not create a project called ${red(
        `"${appName}"`,
      )} because of npm naming restrictions:`,
    )

    validation.problems.forEach((p) =>
      console.error(`    ${red(bold('*'))} ${p}`),
    )
    process.exit(1)
  }

  if (existsSync(appPath) && !isFolderEmpty(appPath, appName)) {
    process.exit(1)
  }

  let example: ExampleType | undefined = opts.example

  if (!example) {
    const res = await prompts({
      onState: onPromptState,
      type: 'select',
      name: 'example',
      message: 'Which example would you like to use?',
      choices: examples.map((ex) => ({
        title: ex.name,
        value: ex.name,
        description: ex.description,
      })),
      initial: 0,
    })
    example = res.example
  }

  if (!example || !examples.some((ex) => ex.name === example)) {
    console.error(
      `Invalid example "${example}". Available examples are:\n` +
        examples.map((ex) => `  • ${ex.name}`).join('\n'),
    )
    process.exit(1)
  }

  try {
    await createApp({
      appPath,
      packageManager,
      example,
      skipInstall: opts.skipInstall || false,
    })
  } catch (reason) {
    console.error('Aborting installation.')
    if (
      reason &&
      typeof reason === 'object' &&
      'command' in reason &&
      typeof (reason as any).command === 'string'
    ) {
      console.error(`  ${cyan((reason as any).command)} has failed.`)
    } else {
      console.error(red('Unexpected error. Please report it as a bug:'), reason)
    }
    process.exit(1)
  }
}

run().catch((reason) => {
  console.error('Aborting installation.')
  console.error(red('Unexpected error. Please report it as a bug:'), reason)
  process.exit(1)
})
