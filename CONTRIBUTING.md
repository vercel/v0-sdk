# Contributing to v0 SDK

Thank you for your interest in contributing to the v0 SDK! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 22+
- pnpm 9+

### Getting Started

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build all packages:
   ```bash
   pnpm build
   ```
4. Run tests to make sure everything works:
   ```bash
   pnpm test
   ```

## Development Workflow

### Making Changes

1. Create a new branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the appropriate package (`packages/v0-sdk/`)

3. Run tests to ensure your changes work:

   ```bash
   pnpm test
   ```

4. Check code formatting:

   ```bash
   pnpm format:check
   ```

5. Fix formatting if needed:

   ```bash
   pnpm format
   ```

6. Type check your changes:
   ```bash
   pnpm type-check
   ```

### SDK Generation

If you need to update the SDK from the OpenAPI specification:

```bash
pnpm sdk:generate
```

This will fetch the latest OpenAPI spec and regenerate the TypeScript SDK.

### Creating a Changeset

**Every pull request that modifies packages must include a changeset.** This is automatically enforced by our CI workflow.

Create a changeset to describe your changes:

```bash
pnpm changeset
```

Follow the prompts to:

- Select which packages are affected
- Choose the type of change (patch, minor, major)
- Write a summary of your changes

**Please use patch changesets for most changes** unless you're adding new features (minor) or making breaking changes (major).

### Submitting Changes

1. Commit your changes with a descriptive message:

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

2. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

3. Open a Pull Request on GitHub

## Project Structure

```
v0-sdk/
├── .changeset/          # Changesets configuration
├── .github/             # GitHub Actions workflows
├── packages/
│   └── v0-sdk/         # Main TypeScript SDK package
│       ├── src/        # Source code
│       ├── tests/      # Test files
│       └── dist/       # Built output
├── package.json        # Root package configuration
├── turbo.json         # Turborepo configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

## Available Scripts

### Root Level Commands

- `pnpm build` - Build all packages
- `pnpm test` - Run tests for all packages (CI mode)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm type-check` - Type check all packages
- `pnpm format` - Format code across all packages
- `pnpm format:check` - Check code formatting
- `pnpm sdk:generate` - Generate SDK from OpenAPI spec

### Release Management

- `pnpm changeset` - Create a new changeset
- `pnpm version-packages` - Update package versions
- `pnpm release` - Build and publish packages

### Package-Specific Commands

You can also run commands for specific packages:

```bash
# Run tests for just the SDK package
pnpm --filter v0-sdk test

# Build just the SDK package
pnpm --filter v0-sdk build
```

## Testing

We use [Vitest](https://vitest.dev/) for testing. Tests are located in the `tests/` directory within each package.

- Write tests for new features
- Update tests when modifying existing functionality
- Ensure all tests pass before submitting a PR

## Code Style

We use [Prettier](https://prettier.io/) for code formatting. The configuration is in the root `package.json`.

- Run `pnpm format` to format your code
- Run `pnpm format:check` to check formatting
- The CI pipeline will fail if code is not properly formatted

## Continuous Integration

Our CI pipeline runs on every push and pull request:

1. **Build** - Ensures all packages build successfully
2. **Type Check** - Verifies TypeScript types are correct
3. **Test** - Runs the full test suite
4. **Format Check** - Ensures code is properly formatted

## Release Process

Releases are fully automated using [Changesets](https://github.com/changesets/changesets):

1. **Create a changeset** for your changes using `pnpm changeset`
2. **Open a pull request** with your changes and the changeset
3. **Merge the PR** after review and CI passes
4. **GitHub Actions automatically**:
   - Creates a "Version Packages" PR with version bumps and changelog updates
   - When you merge the "Version Packages" PR, packages are published to npm

### Changeset Verification

Our CI workflow ensures:

- **Required changesets**: Any PR modifying packages must include a changeset
- **Proper format**: Changesets must have valid frontmatter and structure
- **Patch releases only**: Only patch version bumps are allowed by default

### Version Packages PR

The automated "Version Packages" PR will look like this:

```
This PR was opened by the Changesets release GitHub action. When you're ready to do a release,
you can merge this and the packages will be published to npm automatically.

# Releases
## v0-sdk@1.2.3
### Patch Changes
- abc1234: fix: resolve issue with API client timeout
```

### Manual Release (if needed)

If you need to manually trigger a release:

```bash
# Version packages (updates package.json versions and CHANGELOG.md)
pnpm ci:version

# Build and publish to npm
pnpm ci:release
```

## Getting Help

- Check existing [Issues](https://github.com/vercel/v0-sdk/issues) and [Discussions](https://github.com/vercel/v0-sdk/discussions)
- Create a new issue if you find a bug
- Start a discussion if you have questions

## License

By contributing to this project, you agree that your contributions will be licensed under the Apache 2.0 License.
