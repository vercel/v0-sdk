# v0 SDK Monorepo

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

A monorepo containing SDKs for interacting with the v0 Platform API to create and manage AI-powered chat conversations, projects, integrations, and more.

## Packages

- [`@v0/sdk`](./packages/v0-sdk) - TypeScript SDK for the v0 Platform API

## Quick Start

### Installation

```bash
npm install @v0/sdk
# or
yarn add @v0/sdk
# or
pnpm add @v0/sdk
```

### Usage

Get your API key from [v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys).

Set `V0_API_KEY` environment variable.

```typescript
import { v0 } from '@v0/sdk'

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
pnpm --filter @v0/sdk build
pnpm --filter @v0/sdk test
pnpm --filter @v0/sdk generate

# Run commands in all packages
pnpm build
pnpm test
```

### Adding new packages

1. Create a new directory in `packages/`
2. Add a `package.json` with the appropriate `@v0/` scope
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

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing:

- `pnpm changeset` - Create a new changeset (describes changes for release)
- `pnpm version-packages` - Update package versions based on changesets
- `pnpm release` - Build and publish packages to npm

### CI/CD

The project includes GitHub Actions workflows:

- **CI Pipeline** (`ci.yml`): Runs on every push and PR to main
  - Builds all packages
  - Runs type checking
  - Runs tests
  - Checks code formatting

- **SDK Generation** (`generate-sdk.yml`):
  - Runs daily to check for OpenAPI spec updates
  - Can be triggered manually
  - Creates PRs when the SDK needs updates

## Resources

- [v0 Documentation](https://v0.dev/docs)
- [API Terms](https://vercel.com/legal/api-terms)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## License

MIT
