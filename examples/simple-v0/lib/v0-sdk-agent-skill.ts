export const V0_SDK_AGENT_SKILL = `
v0 SDK agent skill

Use this guidance when generating or modifying apps that use the v0 TypeScript SDK.

SDK basics:
- Install the SDK from the "v0" package.
- Import the default client with "import { v0 } from 'v0'" for simple server-side usage.
- Use "createV0Client" when the app needs custom auth, a custom base URL, or custom fetch options.
- Read the API key from "V0_API_KEY" on the server. Do not expose it to client components or browser code.
- The v2 API is organized around chats, messages, files, previews, and deployments.

Create a chat:
- Use "v0.chats.create({ message })" when the caller can wait for completion.
- Use "v0.chats.createStream({ message })" for interactive UIs that show progress.
- Store the returned "chat.id" so later requests can continue the same workspace.
- Chat metadata can be used for app-level grouping, customer IDs, or internal routing.

Send follow-up messages:
- Use "v0.messages.send({ chatId, message })" to continue an existing chat synchronously.
- Use "v0.messages.sendStream({ chatId, message })" to stream progress for an existing chat.
- Treat messages as the conversation history and agent trace. Render message "parts" when the UI needs to show thinking, file edits, tool calls, and final text.

Streaming:
- On the server, call "v0.chats.createStream" or "v0.messages.sendStream".
- The SDK stream result can be returned directly with "result.toResponse()", or consumed with "for await (const update of result.stream)".
- On the client, use "readV0Stream(response)" when consuming the v0 wire format directly.
- Prefer streaming for chat-style interfaces so the UI can update while v0 thinks, edits files, and reports usage.

Showing previews:
- Use "v0.chats.getPreview({ chatId })" after a chat exists.
- The preview may be null while the VM is starting. Poll until "preview" is returned.
- Preview access uses a short-lived preview token. If embedding in an iframe, proxy preview requests through a server route and forward the token as "x-v0-preview-token".
- Never send "V0_API_KEY" to the preview URL or browser.

Docs:
- Use the v0 Platform API v2 docs for details and endpoint reference: https://v0.app/docs/api/v2
`.trim()
