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
- The chat prompt optimistically renders the user message, calls
  `messages.send` through a server action, then replaces the local transcript
  with the returned server state.
- Assistant messages render text, collapsible thinking, and activity directly
  from the SDK's ordered `Message.parts` array.
- The preview pane intentionally shows a loading placeholder.
- The home composer is presentational; its send controls are disabled.
- `v0@canary` is used only from server code, so `V0_API_KEY` is never included in
  the client bundle.

There are no local API routes or demo data stores. Server components and server
actions call the v0 SDK directly.
