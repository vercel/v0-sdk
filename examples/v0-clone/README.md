# v0 clone

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

<p align="center">
    <img src="./screenshot.png" alt="v0 Clone Screenshot" width="800" />
</p>

<p align="center">
    An example of how to use the AI Elements to build a v0 clone with authentication and multi-tenant support.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#setup"><strong>Setup</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#usage"><strong>Usage</strong></a>
</p>
<br/>

## Deploy Your Own

You can deploy your own version of the v0 clone to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fv0-sdk%2Ftree%2Fmain%2Fexamples%2Fv0-clone&env=V0_API_KEY,AUTH_SECRET&envDescription=Get+your+v0+API+key&envLink=https%3A%2F%2Fv0.app%2Fchat%2Fsettings%2Fkeys&products=%255B%257B%2522type%2522%253A%2522integration%2522%252C%2522protocol%2522%253A%2522storage%2522%252C%2522productSlug%2522%253A%2522neon%2522%252C%2522integrationSlug%2522%253A%2522neon%2522%257D%255D&project-name=v0-clone&repository-name=v0-clone&demo-title=v0+Clone&demo-description=A+full-featured+v0+clone+built+with+Next.js%2C+AI+Elements%2C+and+the+v0+SDK&demo-url=https%3A%2F%2Fclone-demo.v0-sdk.dev)

## Setup

### Environment Variables

Create a `.env` file with all required variables:

```bash
# Auth Secret - Generate a random string for production
# Generate with: openssl rand -base64 32
# Or visit: https://generate-secret.vercel.app/32
AUTH_SECRET=your-auth-secret-here

# Database URL - PostgreSQL connection string
POSTGRES_URL=postgresql://user:password@localhost:5432/v0_clone
# For Vercel Postgres, use the connection string from your dashboard

# Get your API key from https://v0.dev/chat/settings/keys
V0_API_KEY=your_v0_api_key_here

# Optional: Use a custom API URL
# V0_API_URL=http://localhost:3001/v1
```

### Database Setup

This project uses PostgreSQL with Drizzle ORM. Set up your database:

1. **Generate Database Schema**:

   ```bash
   pnpm db:generate
   ```

2. **Run Database Migrations**:

   ```bash
   pnpm db:migrate
   ```

3. **Optional - Open Database Studio**:
   ```bash
   pnpm db:studio
   ```

## Getting Started

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

This v0 clone includes:

### Core Features

- **AI Elements Integration**: Uses AI Elements components for a polished UI
- **v0 SDK Integration**: Connects to the v0 Platform API for generating apps
- **Real-time Preview**: Split-screen interface with chat and preview panels
- **Conversation History**: Maintains chat history throughout the session
- **Suggestion System**: Provides helpful prompts to get users started
- **Streaming Support**: Toggle between streaming and non-streaming AI responses for real-time updates
- **Comprehensive Task Support**: Full support for all v0 Platform API task types including:
  - `task-thinking-v1` - AI reasoning and thought processes
  - `task-search-web-v1` - Web search operations with results
  - `task-search-repo-v1` - Repository/codebase search functionality
  - `task-diagnostics-v1` - Code analysis and issue detection
  - `task-read-file-v1` - File reading operations
  - `task-coding-v1` - Code generation and editing tasks
  - `task-generate-design-inspiration-v1` - Design inspiration generation
  - **Graceful fallback** for unknown task types with user-friendly display

### Authentication & Multi-Tenant Features

- **Anonymous Access**: Unauthenticated users can create chats directly (with rate limits)
- **Guest Access**: Users can register as guests for persistent sessions
- **User Registration/Login**: Email/password authentication with secure password hashing
- **Session Management**: Secure session handling with NextAuth.js
- **Multi-Tenant Architecture**: Multiple users share the same v0 API organization
- **Ownership Mapping**: Authenticated users only see their own chats and projects
- **Rate Limiting**: Different limits for anonymous, guest, and registered users
- **User Navigation**: Header dropdown with user info and sign-out options

## Usage

### Setup

1. Set up all environment variables in `.env`
2. Run database migrations with `pnpm db:migrate`
3. Start the development server with `pnpm dev` or production server with `pnpm start`

### Using the App

4. **Anonymous Usage**: Visit the homepage and start creating chats immediately (3 chats/day limit)
5. **Guest Access**: Register as a guest for persistent sessions (5 chats/day limit)
6. **Full Account**: Create a permanent account for higher limits (50 chats/day)
7. Use the "Streaming" toggle in the header to enable/disable real-time streaming responses
8. Enter a prompt describing the app you want to build
9. Watch as v0 generates your app in real-time in the preview panel
10. Continue the conversation to iterate and improve your app
11. Authenticated users' chats are automatically saved and associated with their account

## Architecture

### Frontend

- `app/page.tsx` - Main UI with chat interface, streaming toggle, and preview panel
- `components/ai-elements/` - AI Elements components for the UI
- `components/shared/app-header.tsx` - Navigation header with user authentication
- Uses `@v0-sdk/react` components for rendering streaming AI responses

### Backend & API

- `app/api/chat/route.ts` - Chat creation and messaging with ownership tracking
- `app/api/chats/` - User's chat listing and individual chat access
- `app/api/projects/` - User's project listing and individual project access
- `app/(auth)/` - Authentication configuration and login/register pages

### Database

- **Users**: Store user accounts with email and hashed passwords
- **ProjectOwnership**: Maps v0 API project IDs → user IDs (ownership only)
- **ChatOwnership**: Maps v0 API chat IDs → user IDs with optional project association
- **AnonymousChatLog**: Tracks anonymous chat creation by IP address for rate limiting

### Multi-Tenant Design

- **v0 API as Source of Truth**: All actual chat/project data stays in v0 API
- **Ownership Layer**: Database only tracks "who owns what"
- **Access Control**: API routes filter v0 data based on ownership
- **No Data Duplication**: Avoids storing redundant data

### Streaming Implementation

When streaming is enabled:

- Frontend sends `streaming: true` to the API route
- API route calls `v0.chats.create({ responseMode: 'experimental_stream' })`
- Server returns a streaming response with `Content-Type: text/event-stream`
- Frontend uses `StreamingMessage` component from `@v0-sdk/react` to render responses in real-time

## Database Commands

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Apply pending migrations
- `pnpm db:studio` - Open Drizzle Studio for database inspection
- `pnpm db:push` - Push schema changes directly (for development)

## Security Features

- Password hashing with bcrypt
- Secure session cookies
- CSRF protection
- SQL injection protection via Drizzle ORM
- User data isolation through ownership mapping

## User Types & Rate Limits

- **Anonymous Users**: No account needed, 3 chats per day, no data persistence
- **Guest Users**: Auto-created accounts, 5 chats per day, data persists during session
- **Registered Users**: Permanent accounts, 50 chats per day, data persists across sessions and devices

Rate limits are enforced per 24-hour period and reset daily.

---

You now have a working multi-tenant v0 clone with authentication! Feel free to explore the [v0 Platform API](https://v0.dev/docs/api/platform) and extend your app with additional features.
