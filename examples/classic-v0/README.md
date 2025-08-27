# Classic v0 - AI-Powered UI Generation

A faithful recreation of the original v0.dev interface using the v0-sdk. This example demonstrates how to build a classic v0-style interface with modern React, Next.js, and shadcn/ui components.

## Features

- **Classic v0 Interface**: Faithful recreation of the original v0.dev workflow
- **Multiple Generations**: Creates 3 different variations (A, B, C) for each prompt
- **Generation Selection**: Click between different generations to compare and choose
- **Live Preview**: See your generated components in real-time via iframe
- **Modern Stack**: Built with Next.js 15, React 19, TypeScript, and Tailwind CSS
- **shadcn/ui Components**: Professional UI components for a polished interface
- **Two-Stage Workflow**: Prompt input → Multiple generations → Selection and iteration

## Technologies Usedr

- **Frontend Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS
- **AI Integration**: v0-sdk for chat and component generation
- **Code Highlighting**: react-syntax-highlighter
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm (recommended) or npm
- v0 API key from [v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys)

### Installation

1. Navigate to the classic-v0 directory:

   ```bash
   cd examples/classic-v0
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   export V0_API_KEY=your_api_key_here
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Enter Your Prompt**: Describe the UI component you want to build
2. **Get Suggestions**: Click on any of the provided prompt suggestions to get started quickly
3. **View Multiple Generations**: Three different variations (A, B, C) are generated simultaneously
4. **Select Your Favorite**: Click on the generation buttons to switch between options
5. **Continue Iterating**: Choose one generation to continue refining and iterating
6. **Start Over**: Use the back button or "+" to begin a new prompt

### Example Prompts

- "Create a responsive navbar with Tailwind CSS"
- "Build a todo app with React hooks"
- "Make a landing page for a coffee shop"
- "Design a contact form with validation"
- "Create a dashboard with charts"

## Interface Components

### Prompt Input Stage

- **Main Prompt**: Large textarea for describing your UI
- **Suggestions**: Quick-start prompts for inspiration
- **Loading State**: Animated feedback while generating

### Generations View

- **Generation Display**: Full-screen preview of selected generation
- **Generation Selector**: A, B, C buttons to switch between options
- **Navigation**: Back button to return to prompt input
- **Headers**: Clean navigation with v0 branding

## Architecture

```
classic-v0/
├── app/
│   ├── api/chat/route.ts    # API endpoint for v0-sdk integration
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx            # Main interface component
│   └── globals.css         # Global styles
├── components/ui/           # shadcn/ui components
├── lib/utils.ts            # Utility functions
└── package.json            # Dependencies and scripts
```

## Key Features

### AI-Powered Generation

- Integrates with v0-sdk for component generation
- Handles both new chats and message continuations
- Error handling for failed requests

### Modern UI/UX

- Clean, minimalist design inspired by the original v0
- Responsive layout optimized for desktop
- Smooth animations and transitions
- Professional typography and spacing

### Developer Experience

- TypeScript for type safety
- Hot reload during development
- Modern React patterns with hooks
- Clean component architecture

## Environment Variables

| Variable     | Description                        | Required |
| ------------ | ---------------------------------- | -------- |
| `V0_API_KEY` | Your v0 API key for authentication | Yes      |

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Contributing

This example is part of the v0-sdk monorepo. See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

Apache 2.0 - see [LICENSE](../../LICENSE)
