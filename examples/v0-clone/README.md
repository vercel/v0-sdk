# v0 Clone

A deliberately small v0-style chat app built with the v0 SDK.

## Architecture

This example is a monorepo with two independently deployable Next.js apps:

- `apps/web` is the host application. It owns chat UI, server routes, and the
  preview iframe.
- `apps/preview-proxy` is a dedicated preview origin. It fetches preview
  credentials on the server, proxies preview traffic, and contains no host-app
  sessions or unrelated application routes.

Generated previews are untrusted code. Do not deploy the preview proxy on the
host application's origin. For strong production isolation, do not use a
same-site subdomain either: prefer origins on different registrable domains,
such as `app.example.com` and `example-preview.net`, rather than
`app.example.com` and `previews.example.com`.

The iframe keeps `allow-scripts` and `allow-same-origin` so generated React apps
can hydrate and run normally. The dedicated proxy origin is what prevents those
permissions from giving preview code access to the host app.

## Run it

Copy the example environment file. Adding an API key here gives both apps a
shared server-side credential:

```bash
cp examples/v0-clone/.env.example examples/v0-clone/.env.local
```

```bash
V0_API_KEY=your_v0_api_key
NEXT_PUBLIC_V0_PREVIEW_PROXY_URL=http://localhost:3001
V0_CLONE_ORIGIN=http://localhost:3000
```

The web app can also start without `V0_API_KEY`. It opens an API key dialog on
first load, validates the entered key, and saves it in a secure, HTTP-only
cookie for that deployment. This runtime key overrides `V0_API_KEY` in the web
app.

The isolated preview proxy cannot share the web app's cookie. Locally, keep
`V0_API_KEY` in `.env.local` for previews. On Vercel, the preview proxy can use
the SDK's project-scoped OIDC fallback instead.

Then run from the repository root:

```bash
bun install
bun --filter v0-clone dev
```

The one `dev` command starts both apps:

- Web app: [http://localhost:3000](http://localhost:3000)
- Preview proxy: [http://localhost:3001](http://localhost:3001)

When this example is created with `create-v0-sdk`, run the same commands from
the generated project directory:

```bash
bun install
bun dev
```

## Deploy it

Create two projects from the same repository:

1. Deploy `apps/web` as the host application.
2. Deploy `apps/preview-proxy` on a different registrable domain with deployment
   protection disabled or otherwise configured to allow iframe navigations.
3. Set `V0_API_KEY` on the preview proxy, or configure its Vercel project to use
   the SDK's OIDC fallback. Setting `V0_API_KEY` on the web project is optional;
   without it, each user can enter a key in the app.
4. Set `NEXT_PUBLIC_V0_PREVIEW_PROXY_URL` on the web project to the proxy
   project's public origin.
5. Set `V0_CLONE_ORIGIN` on the proxy project to the web project's exact public
   origin. The proxy uses it for loading-state messages.
6. Configure the preview proxy's hostname as a trusted preview host in v0.

The preview proxy must not share authentication cookies or application
endpoints with the host app. `fetchPreview` strips incoming credentials and
infrastructure headers before forwarding requests.

### Trust the preview proxy hostname

Add the isolated preview proxy's hostname to your team's trusted preview hosts.
Use the hostname only, without a scheme, port, or path. Do not use the web
application's hostname.

From the generated project's root, the following command reads `V0_API_KEY`
from `.env.local`:

```bash
set -a
. ./.env.local
set +a

curl -X PUT "https://api.v0.dev/v2/settings/preview-hosts" \
  -H "Authorization: Bearer $V0_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"hosts":["preview.example-preview.com"]}'
```

Replace `preview.example-preview.com` with the proxy's production hostname.
This endpoint replaces the complete trusted-host list, so include any existing
hostnames that should remain trusted.

## Implementation notes

- The root layout fetches favorite and recent chats on the server and falls
  back to an empty sidebar until credentials are available.
- `/chats/[chatId]` fetches the selected chat and its messages on the server.
- Client chat state uses AI SDK `useChat` with `V0Transport`, while
  `@v0-sdk/react/swr` hooks power chat, file, task-resolution, restore,
  duplicate, download, and deployment actions.
- App Router handlers call the v0 SDK on the server. They prefer a validated
  browser-provided key, then `V0_API_KEY`, then the SDK's Vercel OIDC fallback.
  No key is included in the client bundle.
- New chats can start from a prompt, selected files, a ZIP archive, or a GitHub
  repository.
- Assistant messages render text, reasoning, activities, and task-resolution
  controls from the SDK's ordered message parts.
- The web app points its iframe at the dedicated proxy origin. The proxy uses
  `fetchPreview`, and its `proxy.ts` keeps root-relative preview requests on the
  chat-specific proxy path.

There is no local demo data store; chats and files come from the v0 API.
