# Simple v0

The simplest way to use v0. Just prompt and see your app generated instantly - no chat management, no complexity. Build AI-powered apps with real-time generation and seamless deployment to Vercel.

![Screenshot](screenshot.png)

## Deploy Your Own

You can deploy your own version of Simple v0 to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fv0-sdk%2Ftree%2Fmain%2Fexamples%2Fsimple-v0&env=V0_API_KEY&envDescription=Get+your+v0+API+key&envLink=https%3A%2F%2Fv0.app%2Fchat%2Fsettings%2Fkeys&project-name=simple-v0&repository-name=simple-v0&demo-title=Simple+v0&demo-description=The+simplest+way+to+use+v0+-+just+prompt+and+see+your+app&demo-url=https%3A%2F%2Fsimple-demo.v0-sdk.dev)

## Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Configure environment:**
   Create a `.env.local` file in the root directory:

   ```env
   V0_API_KEY=your_api_key_here

   # Optional: For rate limiting (if not provided, rate limiting is disabled)
   KV_REST_API_URL=your_kv_rest_api_url
   KV_REST_API_TOKEN=your_kv_rest_api_token
   ```

   - Get your v0 API key from [v0.app/settings](https://v0.app/settings)
   - Optionally get your Upstash Redis credentials from [upstash.com](https://upstash.com) for rate limiting

3. **Run development server:**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- **AI App Generation**: Create applications from natural language prompts using v0's AI
- **Live Preview**: Starts the v0 preview VM and embeds the returned preview URL
- **Chat Management**: Continue conversations, fork chats, rename, and delete as needed
- **One-Click Deployment**: Deploy generated apps directly to Vercel
- **File Attachments**: Upload images and files to enhance your prompts
- **SDK Agent Skill**: Adds v0 SDK guidance to generated apps through the generation system prompt
- **Voice Input**: Use speech-to-text for hands-free prompt creation
- **Rate Limiting**: Built-in rate limiting (3 AI generations per 12 hours) to prevent abuse
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Session Caching**: Improved performance with intelligent caching of chats

## API Routes

- `GET /api/validate` - Validate API key
- `GET /api/chats` - List chats
- `POST /api/generate` - Generate or continue app conversation
- `GET /api/chats/[id]` - Retrieve chat details and history
- `GET /api/chats/[id]/preview` - Start/check the VM-backed preview URL
- `DELETE /api/chats/[id]` - Delete a chat conversation
- `PATCH /api/chats/[id]` - Update chat (rename)
- `POST /api/chats/fork` - Create a new chat from an existing one
- `POST /api/deployments` - Deploy generated apps to Vercel

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Runtime:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI primitives with custom styling
- **API Integration:** v0 for Platform API communication
- **Rate Limiting:** Upstash Redis with sliding window algorithm
- **Fonts:** Geist Sans and Geist Mono via next/font
- **Build Tool:** Turbopack for fast development

## Rate Limiting

This application implements optional rate limiting to prevent abuse and ensure fair usage:

- **Limit:** 3 AI generations per 12 hours per IP address
- **What counts as 1 generation:** Each call to `v0.chats.create()` or `v0.messages.send()`
- **Scope:** Applies to all AI generation requests regardless of chat type
- **Implementation:** Uses Upstash Redis with a sliding window algorithm
- **Optional:** If Upstash credentials are not provided, rate limiting is disabled
- **Fallback:** If rate limiting service is unavailable, requests are allowed (fail-open strategy)

When the rate limit is exceeded, users receive a 429 status code with information about when they can try again.

## File Structure

```
├── app/
│   ├── api/                    # API route handlers
│   │   ├── chats/[chatId]/     # Chat CRUD operations
│   │   ├── deployments/        # Vercel deployment handling
│   │   ├── generate/           # AI app generation
│   │   └── validate/           # API key validation
│   ├── components/             # App-specific components
│   ├── chats/[chatId]/         # Individual chat pages
│   ├── globals.css             # Global styles and Tailwind config
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Homepage with main interface
├── components/
│   └── ui/                     # Reusable UI components (buttons, dialogs, etc.)
├── lib/
│   ├── hooks/                  # Custom React hooks
│   ├── v0-sdk-agent-skill.ts   # v0 SDK guidance sent to the v0 agent
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## Agent Skill

The starter template includes a local v0 SDK agent skill at `lib/v0-sdk-agent-skill.ts`.
It is included in the `systemPrompt` for both new chats and follow-up messages in
`app/api/generate/route.ts`.

The skill covers SDK setup, chat creation, follow-up messages, streaming, preview
rendering, and links to the v0 Platform API v2 docs:
[v0.app/docs/api/v2](https://v0.app/docs/api/v2).

## Environment Variables

| Variable            | Required | Description                                                                             |
| ------------------- | -------- | --------------------------------------------------------------------------------------- |
| `V0_API_KEY`        | Yes      | Your v0 Platform API key from [v0.app/settings](https://v0.app/settings)                |
| `KV_REST_API_URL`   | No       | Upstash Redis REST URL for rate limiting (if not provided, rate limiting is disabled)   |
| `KV_REST_API_TOKEN` | No       | Upstash Redis REST token for rate limiting (if not provided, rate limiting is disabled) |

## Development Commands

```bash
# Install dependencies
bun install

# Start development server with Turbopack
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linting
bun run lint

# Format code
bun run format

# Check formatting
bun run format:check
```

## Usage

1. **Start Creating**: Enter a prompt describing the app you want to build
2. **Iterate**: Continue conversations to refine and improve your apps
3. **Deploy**: One-click deployment to Vercel for sharing and testing
4. **Manage**: Rename, delete, or fork chats as your ideas evolve

## Learn More

- [v0 Platform API Documentation](https://v0.app/docs/api/v2)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
