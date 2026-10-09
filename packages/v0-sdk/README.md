# v0

TypeScript SDK for the v0 API.

## Install

```sh
npm install v0
```

## Usage

```ts
import { v0 } from 'v0'

const response = await v0.chats.create({
  message: 'Build me a personal website',
})

if (response.error) {
  throw new Error(response.error.message)
}

const preview = await v0.chats.getPreview({
  chatId: response.data.chat.id,
})

if (preview.error) {
  throw new Error(preview.error.message)
}

console.log(preview.data?.url)
```

The default `v0` client uses `V0_API_KEY` when present, otherwise it falls back to Vercel OIDC auth for server-side code deployed on Vercel. Use `createV0Client` when you need custom auth or client options.

## Design Mode

Use `createDesignModeBridge` from **`v0/browser`** to connect your frontend to the Design Mode runtime already injected into v0's proxied VM previews. It enables the editor, receives Apply requests, normalizes screenshots and instructions, and exposes selection/layer state. It has no React dependency and never reads an API key or calls the v0 API.

First configure the [standard preview proxy](https://v0.app/docs/api/v2/guides/accessing-previews). Serve the preview on an isolated origin, allow that hostname in your team's trusted preview hosts, and forward document, asset, and navigation requests with the preview access token. A raw sandbox URL or deployed application does not necessarily contain the runtime. An iframe sandbox must permit scripts and preserve its origin for the authenticated bridge.

### Connect the parent frontend

```ts
import { createDesignModeBridge } from 'v0/browser'

// The iframe must already exist in the DOM. The helper supports connecting
// before or after its runtime loads.
const iframe = document.querySelector<HTMLIFrameElement>('#preview')!
const chatId = 'chat_abc123'

const bridge = createDesignModeBridge({
  iframe,
  targetOrigin: new URL(iframe.src, window.location.href).origin,
  enabled: true,
  async onApply(message, { signal }) {
    // This is YOUR authenticated backend, not api.v0.dev.
    const response = await fetch(`/api/chats/${chatId}/design-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
      signal,
    })

    // For a synchronous save, acknowledge only after your backend confirms it.
    // Throw an Error to also notify onError; return false to reject quietly.
    if (!response.ok) throw new Error('Unable to save design edits')
  },
  onError(error) {
    console.error(error)
  },
})

const unsubscribe = bridge.subscribe((state) => {
  // Render your toggle, saving indicator, selection, and/or layer tree.
  console.log(state.connected, state.enabled, state.applying)
})

await bridge.ready
bridge.setEnabled(false)
bridge.setEnabled(true)

// Optional controls for a customer-owned layers UI. Use IDs from state.tree,
// not CSS selectors; these IDs are local to the current iframe document.
const node = bridge.getState().tree?.children[0]
if (node) {
  await bridge.selectNode(node.id)
  await bridge.hoverNode(node.id)
  await bridge.clearHoveredNode()
  await bridge.setNodeVisibility(node.id, true)
}

// On component teardown or before switching chats/preview origins:
unsubscribe()
bridge.dispose()
```

`ready` resolves after a source- and origin-checked runtime handshake. `setEnabled` is an immediate toggle; the runtime can also report changes caused by its own controls. The helper restores the desired enabled state after iframe navigation, clears document-local selection/tree state when the runtime reconnects, and never automatically resubmits an Apply request.

The optional bridge `logo` setting controls runtime editor branding: omit it (or use `true`) for v0, use `false` to hide the logo, or pass `{ url, alt }` for a custom image. Custom URLs must be absolute HTTP(S) URLs without embedded credentials, for example `logo: { url: new URL('/acme-logo.svg', window.location.origin).href, alt: 'Acme Team' }`. The bridge sends the configuration on every enable and restores it after iframe navigation. This requires a preview runtime with parent-controlled logo support; older runtimes retain their default branding.

`getState()` returns an immutable snapshot:

```ts
{
  connected: boolean,
  enabled: boolean,
  applying: boolean,
  selection: { nodeId: string | null, selectedNodeIds: readonly string[] } | null,
  tree: DesignModeLayer | null,
}
```

There can be one bridge per iframe. `dispose()` disables the editor, removes its listeners, closes its ports, rejects pending control calls, and aborts the signal given to `onApply`. Aborting a fetch does **not** guarantee cancellation of a generation already accepted by your backend. Parent-to-runtime control calls default to a 30-second timeout (`timeoutMs`); the Apply callback has no imposed generation timeout. An unanswered `ready` remains pending until the runtime connects or the bridge is disposed.

Apply is emitted by the **editor's Apply button inside the preview**, not by a parent-side RPC command. The runtime currently exposes no public remote Apply, undo/redo, or screenshot-capture method. For headless controls, submit structured Design Mode input through your backend instead.

### Forward through your backend

The bridge's `onApply` receives the public message body, ready for any of `messages.send`, `messages.sendStream`, or `messages.sendAsync`:

```ts
import { parseDesignModeMessage, v0 } from 'v0'

async function saveDesignEdits(chatId: string, body: unknown) {
  // Before calling this function, authenticate your application user and verify
  // that this chat belongs to them. Do not expose a team-wide API key to clients.
  const message = parseDesignModeMessage(body)
  const result = await v0.messages.send({ chatId, ...message })
  if (result.error) throw new Error(result.error.message)
  if (result.data.finishReason === 'error') throw new Error('Design Mode generation failed')
  return result.data
}
```

`parseDesignModeMessage` validates and copies only the Design Mode fields; malformed or non-actionable input throws `TypeError`, which your endpoint should map to a 4xx response. Normal API-side validation and authorization still apply. Handle the returned message/stream/async ID in your application and keep the preview synchronized using your normal preview integration.

For streaming saves, consume the stream and check its final result before acknowledging Apply. For async saves, track the returned assistant message to completion; accepting the queued job alone is not confirmation that the source edits succeeded. Do not retry a save automatically after an uncertain network failure—resume or inspect the original generation instead.

### Convert raw runtime payloads

If you implement your own runtime bridge, `toDesignModeMessage` is exported from both `v0` and `v0/browser`:

```ts
import { toDesignModeMessage } from 'v0/browser'

const message = toDesignModeMessage({
  edits: [
    {
      type: 'style',
      element: { selectorPath: '#heading', tagName: 'h1' },
      changes: { fontSize: { from: '32px', to: '48px' } },
    },
  ],
  instructions: { message: 'Only change this heading', element: '#heading' },
})
// { message: 'Only change this heading', designMode: { edits: [...], element: '#heading' } }
```

The converter preserves all existing edit types, moves optional instructions to `message`, omits empty instructions, and converts the runtime's JPEG region/element screenshots into `designMode.screenshot.url` data URIs. It preserves region screenshot anchors, uses the same screenshot precedence as v0's web editor, and does not mutate its input. It validates the API's 100-edit and 10 MB screenshot limits. Vercel OIDC principals still cannot submit screenshots or other attachments.

Design Mode updates source using a model; selectors and old values are context, not deterministic DOM-patch preconditions. Normal generation credits apply.

See https://v0.app/docs/api/v2 for full documentation and API reference.
