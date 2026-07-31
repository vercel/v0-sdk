# v0 Clone

A deliberately small v0-style chat app built with the v0 SDK.

> **Security warning:** this example has no user accounts or authentication.
> Everyone who can reach a deployment shares the deployer's v0 workspace —
> they can read, create, modify, and delete chats, run generations at the
> deployer's expense, and create Vercel projects and deployments with the
> Vercel token embedded in `V0_API_KEY`. Every server route passes through
> `authorizeProxyRequest` (`apps/web/lib/proxy.ts`,
> `apps/preview-proxy/lib/authorize.ts`), a same-origin baseline check only:
> it does not stop direct non-browser requests. Replace or extend it with real
> session auth before exposing a deployment to untrusted users, and keep
> Vercel deployment protection enabled on both apps until you do.

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

Copy the example environment file and add your API key:

```bash
cp examples/v0-clone/.env.example examples/v0-clone/.env.local
```

```bash
V0_API_KEY=your_v0_api_key
NEXT_PUBLIC_V0_PREVIEW_PROXY_URL=http://localhost:3001
V0_CLONE_ORIGIN=http://localhost:3000
```

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
   Note the proxy serves a credentialed channel into the preview of every chat
   in your workspace to anyone who knows a chat ID, and chat IDs are
   enumerable from the web app's unauthenticated routes — add auth first if
   that matters for your deployment.
3. Set `V0_API_KEY` on both projects.
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

- The root layout fetches favorite and recent chats on the server.
- `/chats/[chatId]` fetches the selected chat and its messages on the server.
- Client chat state uses AI SDK `useChat` with `V0Transport`, while
  `@v0-sdk/react/swr` hooks power chat, file, task-resolution, restore,
  duplicate, download, and deployment actions.
- App Router handlers call the v0 SDK on the server, so `V0_API_KEY` is never
  included in the client bundle.
- Every App Router handler and the preview proxy route call
  `authorizeProxyRequest` first; that seam is where you add session auth.
- New chats can start from a prompt, selected files, a ZIP archive, or a GitHub
  repository.
- Assistant messages render text, reasoning, activities, and task-resolution
  controls from the SDK's ordered message parts.
- The web app points its iframe at the dedicated proxy origin. The proxy uses
  `fetchPreview`, and its `proxy.ts` keeps root-relative preview requests on the
  chat-specific proxy path.

There is no local demo data store; chats and files come from the v0 API.
