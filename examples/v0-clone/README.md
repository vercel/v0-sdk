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
bun run build # Build the local SDK packages, including v0/browser helpers.
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

## Try Design Mode

1. Start both apps as above and configure an API key using the dialog (or the same environment key on both apps). The key needs write access and available generation credits.
2. Create a chat with a simple test page, for example: **“Build a minimal page with an h1 whose id is `design-mode-test`, text is `Hello`, and font size is 32px.”** Wait for generation to finish.
3. Open **Preview**, wait for the runtime connection, and click **Design Mode** in the preview toolbar.
4. Select the heading inside the iframe, edit its text/font size using the runtime controls, optionally add instructions, and click the runtime's **Apply** button.
5. The chat immediately shows a compact optimistic user turn and **Applying design changes…**. Assistant activities stream into the chat as they arrive instead of waiting for the whole generation. The toolbar also shows **Saving design edits…**; chat submission, restore, and task actions are disabled during the save. After completion, persisted history and **Code** refresh without duplicate turns; the preview stays mounted so Apply can receive its acknowledgement.
6. Inspect the generated source in **Code** to confirm the edits persisted. The toolbar's **Refresh preview** button can reload the iframe while restoring its Design Mode state. Switching to Code or starting another chat operation turns Design Mode off.

The frontend uses `createDesignModeBridge` from `v0/browser`. Apply goes through `/api/chats/[chatId]/design-mode`, which uses the same `authorizeProxyRequest` and server-side credential resolution as the other example endpoints. `parseDesignModeMessage` validates input and strips unrelated capabilities before calling `v0.messages.sendStream`. The frontend consumes the SSE snapshots and acknowledges Apply only after the final assistant completes with `finishReason: 'stop'`; errors/pending actions are exposed for inspection in the conversation. Cache-refresh failures after a confirmed save do not cause a duplicate generation.

User bubbles display human instructions (or **Design Mode edit**), not the internal JSON refinement prompt. User attachments are hidden in the chat UI, but screenshots are still sent to the model as context. User text wraps as plain text so long selectors, URLs, and edit payloads cannot expand the chat panel.

The API key is never passed to the preview bridge. The example's existing **no-auth/shared-workspace security warning still applies** to the new endpoint. These are real API generations and use normal credits; the example tests mock upstream generation and do not spend credits. Screenshots require API-key authentication, not Vercel OIDC.

If the Design Mode button stays disabled, check that the dedicated preview proxy is configured and authenticated, its hostname is trusted, and preview assets (including the injected runtime) load successfully. A deployed app or raw sandbox URL is not a substitute for the proxied preview.

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
- The preview toolbar uses the SDK Design Mode bridge, keeps Apply connected while saving, refreshes message/file caches on completion, and disposes the bridge when the iframe/chat changes.
- The web app points its iframe at the dedicated proxy origin. The proxy uses
  `fetchPreview`, and its `proxy.ts` keeps root-relative preview requests on the
  chat-specific proxy path.

There is no local demo data store; chats and files come from the v0 API.
