# v0 clone

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

An example of how to use the AI Elements to build a v0 clone.

## Setup

First, create a `.env.local` file in the root directory and add your v0 API key:

```bash
# Get your API key from https://v0.dev/chat/settings/keys
V0_API_KEY=your_v0_api_key_here
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

## Usage

1. Add your v0 API key to `.env.local`
2. Start the development server with `pnpm dev`
3. Enter a prompt describing the app you want to build
4. Watch as v0 generates your app in real-time in the preview panel
5. Continue the conversation to iterate and improve your app

## Architecture

- `app/page.tsx` - Main UI with chat interface and preview panel
- `app/api/chat/route.ts` - API route handling v0 SDK integration
- `components/ai-elements/` - AI Elements components for the UI

You now have a working v0 clone you can build off of! Feel free to explore the [v0 Platform API](https://v0.dev/docs/api/platform) and extend your app with additional features.
