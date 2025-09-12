# @v0-sdk/react Example

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

This is a Next.js example application demonstrating how to use the `@v0-sdk/react` package to render content from the v0 Platform API. It showcases **all possible task types and content parts** that can be exposed via the platform's `experimental_content` field.

## Features Demonstrated

- **Message Rendering**: Shows how to render different types of content from the v0 API
- **All Task Types**: Complete showcase of all 16 task types (v1) available in the platform
- **Content Parts**: Examples of all non-task content types (mdx, parse-error, turn events, etc.)
- **Code Blocks**: Syntax-highlighted code blocks with Prism.js
- **Mathematical Expressions**: Inline and block math using KaTeX
- **Interactive Task Sections**: Collapsible task progress indicators

## Getting Started

### Prerequisites

Make sure you're in the v0 monorepo root and have installed dependencies:

```bash
pnpm install
```

### Running the Example

From the monorepo root:

```bash
cd examples/v0-sdk-react-example
pnpm dev
```

Or run it directly from the root:

```bash
pnpm --filter v0-sdk-react-example dev
```

Open [http://localhost:3000](http://localhost:3000) to see the example.

## Code Structure

### Key Files

- `app/page.tsx` - Main page demonstrating the V0MessageRenderer component
- `lib/sampleData.ts` - Sample data representing v0 Platform API responses
- `app/layout.tsx` - Next.js layout with required CSS imports

### Sample Data Format

The example uses sample data that matches the format returned by the v0 Platform API:

```typescript
{
  id: 'msg-1',
  role: 'user' | 'assistant',
  content: MessageBinaryFormat // Parsed JSON from API response
}
```

## Usage Example

```tsx
import { V0MessageRenderer } from '@v0-sdk/react'
import 'katex/dist/katex.min.css' // Required for math rendering

function ChatMessage({ apiResponse }) {
  // Parse the content from the API response
  const content = JSON.parse(apiResponse.content)

  return (
    <V0MessageRenderer
      content={content}
      messageId={apiResponse.id}
      role={apiResponse.role}
      className="prose prose-sm max-w-none"
    />
  )
}
```

## Content Types Supported

The example demonstrates all content types available in the v0 Platform API:

### Task Types (v1)
1. **task-thinking-v1** - AI reasoning and thought processes
2. **task-search-web-v1** - Web search operations with results and citations
3. **task-search-repo-v1** - Repository/codebase search and file analysis
4. **task-start-v1** - Task initialization and launch events
5. **task-coding-v1** - Code generation with progress tracking and linting
6. **task-diagnostics-v1** - Code diagnostics and issue detection
7. **task-stopped-v1** - Task interruption and cleanup handling
8. **task-run-shell-command-v1** - Shell command execution with output streaming
9. **task-manage-todos-v1** - Todo list management and technical planning
10. **task-read-files-v1** - Multiple file reading operations
11. **task-read-file-v1** - Single file reading with search/grep functionality
12. **task-fetch-from-web-v1** - HTTP requests and API data fetching
13. **task-inspect-site-v1** - Website inspection with screenshots and analysis
14. **task-generate-design-inspiration-v1** - Design generation with color palettes and layouts
15. **task-get-or-request-integration-v1** - Integration management and environment setup
16. **task-repaired-parser-content-v1** - Content parsing error recovery

### Non-Task Content Types
17. **mdx** - Rich markdown content with interactive React components
18. **parse-error** - Content parsing error information
19. **launch-tasks** - Task launching metadata
20. **turn-start** - Agent turn initialization events
21. **turn-reset** - Agent turn reset events  
22. **turn-finish** - Agent turn completion with statistics
23. **agent-finish** - Agent session completion summary

### Traditional Content
- **Markdown Text** - Paragraphs, headings, lists, links, emphasis
- **Code Blocks** - Syntax-highlighted code with language detection
- **Mathematical Expressions** - Both inline and block math using KaTeX

## Styling

The example uses:

- **Tailwind CSS** for layout and basic styling
- **Tailwind Typography** (`prose` classes) for content styling
- **KaTeX CSS** for mathematical expressions

## Dependencies

Key dependencies used in this example:

- `@v0-sdk/react` - The main SDK package
- `next` - Next.js framework
- `react` & `react-dom` - React framework
- `katex` - Math rendering library
- `tailwindcss` - Utility-first CSS framework

## Learn More

- [v0 Platform API Documentation](https://v0.dev/docs/api)
- [@v0-sdk/react Package](../../packages/@v0-sdk/react/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
