# v0 Clone

A deliberately small v0-style chat app built with the v0 SDK.

## Run it

Create `examples/v0-clone/.env.local`:

```bash
V0_API_KEY=your_v0_api_key
```

Then run from the repository root:

```bash
bun install
bun --filter v0-clone dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current architecture

- The root layout fetches favorite and recent chats on the server.
- `/chats/[chatId]` fetches the selected chat and its messages on the server.
- Client chat state uses AI SDK `useChat` with `V0Transport`, while
  `@v0-sdk/react/swr` hooks power chat, file, task-resolution, restore,
  duplicate, download, and deployment actions.
- App Router handlers call the v0 SDK on the server, so `V0_API_KEY` is never
  included in the client bundle.
- New chats can start from a prompt, selected files, a ZIP archive, or a GitHub
  repository.
- Assistant messages render text, reasoning, activities, and task-resolution
  controls from the SDK's ordered message parts.
- The preview iframe loads `/api/v0-preview/[chatId]`. That route uses
  `fetchPreview`, and `proxy.ts` keeps root-relative preview requests on the
  chat-specific same-origin proxy path.
- The iframe uses `allow-scripts` and `allow-same-origin` so generated React
  apps can hydrate and run normally.

There is no local demo data store; chats and files come from the v0 API.
