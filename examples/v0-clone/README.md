# v0 clone

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

An example of how to use the AI Elements to build a v0 clone.

## Setup

First, create a `.env.local` file in the root directory and add your v0 API key:

```bash
# Get your API key from https://v0.dev/chat/settings/keys
V0_API_KEY=your_v0_api_key_here

# Optional: Use a custom API URL (useful for local development)
# V0_API_URL=http://localhost:3001/v1
```

## Getting Started

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

This v0 clone includes:

- **AI Elements Integration**: Uses AI Elements components for a polished UI
- **v0 SDK Integration**: Connects to the v0 Platform API for generating apps
- **Real-time Preview**: Split-screen interface with chat and preview panels
- **Conversation History**: Maintains chat history throughout the session
- **Suggestion System**: Provides helpful prompts to get users started
- **Streaming Support**: Toggle between streaming and non-streaming AI responses for real-time updates

## Usage

1. Add your v0 API key to `.env.local`
2. (Optional) Set `V0_API_URL` if you want to test against a local API server
3. Start the development server with `pnpm dev`
4. Use the "Streaming" toggle in the header to enable/disable real-time streaming responses
5. Enter a prompt describing the app you want to build
6. Watch as v0 generates your app in real-time in the preview panel (with streaming enabled, you'll see responses appear as they're generated)
7. Continue the conversation to iterate and improve your app

## Architecture

- `app/page.tsx` - Main UI with chat interface, streaming toggle, and preview panel
- `app/api/chat/route.ts` - API route handling both streaming and non-streaming v0 SDK integration
- `components/ai-elements/` - AI Elements components for the UI
- Uses `@v0-sdk/react` components for rendering streaming AI responses

### Streaming Implementation

When streaming is enabled:

- Frontend sends `streaming: true` to the API route
- API route calls `v0.chats.create({ responseMode: 'experimental_stream' })`
- Server returns a streaming response with `Content-Type: text/event-stream`
- Frontend uses `StreamingMessage` component from `@v0-sdk/react` to render responses in real-time

You now have a working v0 clone you can build off of! Feel free to explore the [v0 Platform API](https://v0.dev/docs/api/platform) and extend your app with additional features.
