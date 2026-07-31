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

Copy the example environment file:

```bash
cp examples/v0-clone/.env.example examples/v0-clone/.env.local
```

```bash
V0_API_KEY=
V0_PREVIEW_PROXY_URL=
V0_CLONE_ORIGIN=
```

Local URLs require no configuration: the web app uses `http://localhost:3000`
and the proxy uses `http://localhost:3001`. `V0_API_KEY` is optional. With no
key in the environment, the web app opens an API key dialog on first load.
Saving a key does three things:

1. Validates the key and stores it in the web app's HTTP-only cookie.
2. Sends the key directly from the browser to the resolved preview proxy.
3. The proxy derives its own hostname, merges it into the team's trusted preview
   hosts, and stores the key in its own HTTP-only cookie.

Each app resolves credentials in this order: `V0_API_KEY`, its own browser
cookie, then Vercel OIDC. When `V0_API_KEY` is set, the dialog is read-only. Set
the same environment key on both apps, or leave it unset on both and use the
dialog.

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
2. Deploy `apps/preview-proxy` on a different registrable domain. Keep
   deployment protection enabled until you add real session auth. Each tester
   must authenticate to the proxy deployment directly before the web app can
   configure it or load its iframe.

   The proxy serves a credentialed channel into the preview of every chat in
   your workspace to anyone who knows a chat ID, and chat IDs are enumerable
   from the web app's routes. Add real auth before exposing either project to
   untrusted users.

3. Link each Vercel project to the other as a Related Project. Add the preview
   proxy's project ID to `apps/web/vercel.json`, and the web project's ID to
   `apps/preview-proxy/vercel.json`:

   ```json
   {
     "relatedProjects": ["prj_other_project_id"]
   }
   ```

   Preserve the existing install and build commands in each file. Related
   Projects supplies the matching branch deployment URLs to both apps through
   `VERCEL_RELATED_PROJECTS`.

4. For production, set `V0_PREVIEW_PROXY_URL` on the web project to the proxy's
   public origin and `V0_CLONE_ORIGIN` on the proxy project to the web app's
   public origin. A related project's production host is used as a fallback.
5. Either set the same `V0_API_KEY` on both projects, leave it unset and use the
   dialog, or let both projects fall back to Vercel OIDC.

The URL resolver is shared by the iframe and API-key dialog:

| Environment    | Web app → preview proxy                      | Preview proxy → web app                 |
| -------------- | -------------------------------------------- | --------------------------------------- |
| Local          | `http://localhost:3001`                      | `http://localhost:3000`                 |
| Vercel Preview | Related Project's matching preview URL       | Related Project's matching preview URL  |
| Production     | `V0_PREVIEW_PROXY_URL`, then Related Project | `V0_CLONE_ORIGIN`, then Related Project |

In production, the proxy key is stored in a `Secure`, HTTP-only, partitioned
cookie. Partitioning lets the isolated proxy receive its cookie inside the
iframe without sharing the web app's cookie or exposing the key to generated
preview code. `fetchPreview` strips incoming credentials and infrastructure
headers before forwarding requests.

The preview proxy owns trusted-host registration. It registers the hostname
when a browser key is provisioned and also checks once before serving previews
with an environment or OIDC credential. Existing hosts and matching wildcard
entries are preserved.

## Implementation notes

- The root layout fetches favorite and recent chats on the server and falls
  back to an empty sidebar until credentials are available.
- `/chats/[chatId]` fetches the selected chat and its messages on the server.
- Client chat state uses AI SDK `useChat` with `V0Transport`, while
  `@v0-sdk/react/swr` hooks power chat, file, task-resolution, restore,
  duplicate, download, and deployment actions.
- App Router handlers call the v0 SDK on the server. They prefer `V0_API_KEY`,
  then a validated browser-provided key, then the SDK's Vercel OIDC fallback.
  No key is included in the client bundle.
- Every App Router handler and the preview proxy route call
  `authorizeProxyRequest` first; that seam is where you add session auth.
- The preview proxy follows the same credential order using its own isolated,
  partitioned cookie. Its key-provisioning route only allows the resolved web
  origin through credentialed CORS.
- New chats can start from a prompt, selected files, a ZIP archive, or a GitHub
  repository.
- Assistant messages render text, reasoning, activities, and task-resolution
  controls from the SDK's ordered message parts.
- The web app points its iframe at the dedicated proxy origin. The proxy uses
  `fetchPreview`, and its `proxy.ts` keeps root-relative preview requests on the
  chat-specific proxy path.

There is no local demo data store; chats and files come from the v0 API.
