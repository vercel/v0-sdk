# create-v0-sdk-app

Create [v0 Platform API v2](https://v0.app/docs/api/v2) SDK apps with one command.

## Usage

```bash
pnpm create v0-sdk-app my-app
```

Or with other package managers:

```bash
# With npm
npx create-v0-sdk-app my-app

# With yarn
yarn create v0-sdk-app my-app

# With bun
bun create v0-sdk-app my-app
```

## Options

- `--example <example-name>` - Specify which example to use
- `--use-pnpm` - Use pnpm as the package manager
- `--use-npm` - Use npm as the package manager
- `--use-yarn` - Use Yarn as the package manager
- `--use-bun` - Use Bun as the package manager
- `--skip-install` - Skip installing dependencies

## Available Examples

### simple-v0 (Recommended)

Next.js app that uses the v2 SDK to generate, preview, manage, and deploy v0 chats.

```bash
pnpm create v0-sdk-app my-app --example simple-v0
```

### basic

Minimal TypeScript scripts for creating v2 chats with synchronous and streaming SDK calls.

```bash
pnpm create v0-sdk-app my-basic-app --example basic
```

## Interactive Mode

If you do not specify an example, the CLI prompts you to choose one:

```bash
pnpm create v0-sdk-app my-app
# ? Which example would you like to use?
# > simple-v0 - Next.js app for generating, previewing, managing, and deploying v0 chats (Recommended)
#   basic - Minimal TypeScript scripts for sync and streaming v2 chat creation
```

## What's Included

Each example comes pre-configured with:

- TypeScript support
- v0 SDK v2 usage
- Example code and documentation
- Published package dependencies for use outside this monorepo

## Development

To work on this package:

```bash
bun install
bun --filter create-v0-sdk-app build
bun --filter create-v0-sdk-app typecheck
bun --filter create-v0-sdk-app dev --help
```

## License

Apache 2.0
