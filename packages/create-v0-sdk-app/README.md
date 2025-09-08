# create-v0-sdk-app

Create v0 SDK-powered apps with one command.

## Usage

```bash
npx create-v0-sdk-app my-app
```

Or with other package managers:

```bash
# With pnpm
pnpm create v0-sdk-app my-app

# With yarn
yarn create v0-sdk-app my-app

# With bun
bun create v0-sdk-app my-app
```

## Options

- `--example <example-name>` - Specify which example to use
- `--use-npm` - Use npm as the package manager
- `--use-pnpm` - Use pnpm as the package manager
- `--use-yarn` - Use Yarn as the package manager
- `--use-bun` - Use Bun as the package manager
- `--skip-install` - Skip installing dependencies

## Available Examples

### ai-tools-example

Node.js example using `@v0-sdk/ai-tools` with AI SDK. Perfect for building AI-powered command-line tools and scripts.

```bash
npx create-v0-sdk-app my-ai-app --example ai-tools-example
```

### classic-v0

Full-featured Next.js app similar to v0.dev with project management, chat interface, and code generation capabilities.

```bash
npx create-v0-sdk-app my-classic-app --example classic-v0
```

### v0-clone

Next.js app that replicates the v0.dev interface with modern React components and AI chat functionality.

```bash
npx create-v0-sdk-app my-clone-app --example v0-clone
```

### v0-sdk-react-example

Next.js example using `@v0-sdk/react` components with different UI themes (minimal, elegant, neobrutalism, terminal).

```bash
npx create-v0-sdk-app my-react-app --example v0-sdk-react-example
```

## Interactive Mode

If you don't specify an example, the CLI will prompt you to choose one:

```bash
npx create-v0-sdk-app my-app
# ? Which example would you like to use? (Use arrow keys)
# ❯ ai-tools-example - Node.js example using @v0-sdk/ai-tools with AI SDK
#   classic-v0 - Full-featured Next.js app similar to v0.dev
#   v0-clone - Next.js app that replicates the v0.dev interface
#   v0-sdk-react-example - Next.js example using @v0-sdk/react components
```

## What's Included

Each example comes pre-configured with:

- TypeScript support
- Modern tooling and build setup
- Example code and documentation
- Proper dependency management
- Development and production scripts

## Development

To work on this package:

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Test locally
pnpm dev --help
```

## License

MIT
