# create-v0-sdk-app

Create [v0 API](https://v0.app/docs/api/v2) SDK apps with one command.

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

- `--example v0-clone` - Explicitly select the v0 clone template (currently the default and only template)
- `--use-pnpm` - Use pnpm as the package manager
- `--use-npm` - Use npm as the package manager
- `--use-yarn` - Use Yarn as the package manager
- `--use-bun` - Use Bun as the package manager
- `--skip-install` - Skip installing dependencies

## Template

The CLI currently creates the full-featured [`v0-clone`](../../examples/v0-clone) example by default. It is the only available template for now.

```bash
pnpm create v0-sdk-app my-app
```

## What's Included

The template comes pre-configured with:

- TypeScript support
- v0 SDK v2 usage
- Example code and documentation
- A v0 SDK agent skill at `.agents/skills/v0/SKILL.md`
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
