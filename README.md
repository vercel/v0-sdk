# v0 SDK Monorepo

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

A monorepo containing SDKs for interacting with the v0 Platform API to create and manage AI-powered chat conversations, projects, integrations, and more.

## Packages

- [`v0-sdk`](./packages/v0-sdk) - TypeScript SDK for the v0 Platform API
- [`@v0-sdk/react`](./packages/react) - React components for rendering v0 Platform API content
- [`@v0-sdk/ai-tools`](./packages/ai-tools) - AI SDK tools for the v0 Platform API
- [`create-v0-sdk-app`](./packages/create-v0-sdk-app) - Create v0 SDK-powered apps with one command

## Examples

- [`v0-clone`](./examples/v0-clone) ([Demo](https://clone-demo.v0-sdk.dev)) - Full-featured v0 clone with authentication, database, and AI Elements
- [`simple-v0`](./examples/simple-v0) ([Demo](https://simple-demo.v0-sdk.dev)) - The simplest way to use v0. Just prompt and see your app generated instantly
- [`classic-v0`](./examples/classic-v0) - Classic v0 interface clone with clean, minimalist design
- [`v0-sdk-react-example`](./examples/v0-sdk-react-example) - Next.js example demonstrating @v0-sdk/react usage with multiple UI themes
- [`ai-tools-example`](./examples/ai-tools-example) - Demonstrates @v0-sdk/ai-tools integration with AI SDK for advanced agent patterns

## Quick Start

### Option 1: Create a New App (Recommended)

The fastest way to get started is with `create-v0-sdk-app`:

```bash
pnpm create v0-sdk-app@latest my-v0-app
# or
npx create-v0-sdk-app@latest my-v0-app
cd my-v0-app
```

This will create a new project with everything set up and ready to go.

### Option 2: Manual Installation

```bash
pnpm add v0-sdk
# or
npm install v0-sdk
# or
yarn add v0-sdk
```

### Usage

Get your API key from [v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys).

Set `V0_API_KEY` environment variable.

```typescript
import { v0 } from 'v0-sdk'

// Create a new chat
const chat = await v0.chats.create({
  message: 'Create a responsive navbar with Tailwind CSS',
  system: 'You are an expert React developer',
})
console.log(`Chat created: ${chat.webUrl}`)
```

## Development

This monorepo uses [Turborepo](https://turbo.build/) for build orchestration and [pnpm](https://pnpm.io/) for package management.

### Prerequisites

- Node.js 22+
- pnpm 9+

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests for all packages
pnpm test

# Type check all packages
pnpm type-check

# Format code
pnpm format
```

### Working with packages

```bash
# Run commands in specific package
pnpm --filter v0-sdk build
pnpm --filter v0-sdk test
pnpm --filter v0-sdk generate

# Run commands in all packages
pnpm build
pnpm test
```

### Adding new packages

1. Create a new directory in `packages/`
2. Add a `package.json` with the appropriate `@v0-sdk/` scope
3. Update the root `tsconfig.json` paths if needed
4. Add any necessary scripts to `turbo.json`

## Scripts

- `pnpm build` - Build all packages
- `pnpm test` - Run tests for all packages (CI mode)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm type-check` - Type check all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code across all packages
- `pnpm sdk:generate` - Generate SDK from OpenAPI spec

### Code Quality

The project includes automated code quality checks:

- **Pre-commit hooks**: Automatically format code before commits using Husky and lint-staged
- **CI formatting check**: Ensures all code is properly formatted in pull requests

### Release Management

This project uses [Changesets](https://github.com/changesets/changesets) for automated version management and publishing. See [CONTRIBUTING.md](./CONTRIBUTING.md#release-process) for detailed release guidelines.

- `pnpm changeset` - Create a new changeset (describes changes for release)
- Releases are automated via GitHub Actions when changesets are merged to main

### CI/CD

The project includes GitHub Actions workflows:

- **CI Pipeline** (`ci.yml`): Runs on every push and PR to main
  - Builds all packages
  - Runs linting, formatting, and type checking
  - Runs tests on Node.js 20 and 22

- **Release Pipeline** (`release.yml`): Automated releases
  - Creates "Version Packages" PRs when changesets are added
  - Publishes packages to npm when version PRs are merged

- **Changeset Verification** (`verify-changesets.yml`):
  - Ensures package changes include appropriate changesets
  - Validates changeset format

- **SDK Generation** (`generate-sdk.yml`):
  - Runs daily to check for OpenAPI spec updates
  - Can be triggered manually
  - Creates PRs when the SDK needs updates

## Resources

- [v0 Documentation](https://v0.dev/docs)
- [API Terms](https://vercel.com/legal/api-terms)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## License

Apache 2.0
