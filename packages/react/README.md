# @v0-sdk/react

React components for rendering content from the v0 Platform API.

## Installation

```bash
npm install @v0-sdk/react
# or
yarn add @v0-sdk/react
# or
pnpm add @v0-sdk/react
```

## Usage

### Basic Usage

```tsx
import { V0MessageRenderer } from '@v0-sdk/react'

function ChatMessage({ apiResponse }) {
  // Parse the content from the API response
  const content = JSON.parse(apiResponse.content)

  return (
    <V0MessageRenderer
      content={content}
      messageId={apiResponse.id}
      role={apiResponse.role}
    />
  )
}
```

### With Streaming

```tsx
import { V0MessageRenderer } from '@v0-sdk/react'

function StreamingMessage({ apiResponse, isStreaming }) {
  const content = JSON.parse(apiResponse.content)

  return (
    <V0MessageRenderer
      content={content}
      messageId={apiResponse.id}
      role={apiResponse.role}
      streaming={isStreaming}
      isLastMessage={true}
    />
  )
}
```

### Custom Styling

```tsx
import { V0MessageRenderer } from '@v0-sdk/react'

function StyledMessage({ apiResponse }) {
  const content = JSON.parse(apiResponse.content)

  return (
    <V0MessageRenderer
      content={content}
      messageId={apiResponse.id}
      role={apiResponse.role}
      className="my-custom-message-styles"
    />
  )
}
```

## API Reference

### V0MessageRenderer

The main component for rendering v0 Platform API message content.

#### Props

| Prop            | Type                                          | Default       | Description                                                                  |
| --------------- | --------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `content`       | `MessageBinaryFormat`                         | **required**  | The parsed content from the v0 Platform API (JSON.parse the 'content' field) |
| `messageId`     | `string`                                      | `'unknown'`   | Optional message ID for tracking purposes                                    |
| `role`          | `'user' \| 'assistant' \| 'system' \| 'tool'` | `'assistant'` | Role of the message sender                                                   |
| `streaming`     | `boolean`                                     | `false`       | Whether the message is currently being streamed                              |
| `isLastMessage` | `boolean`                                     | `false`       | Whether this is the last message in the conversation                         |
| `className`     | `string`                                      | `undefined`   | Custom className for styling                                                 |

### Types

#### MessageBinaryFormat

```typescript
type MessageBinaryFormat = [number, ...any[]][]
```

The binary format for message content as returned by the v0 Platform API. Each row is a tuple where the first element is the type and the rest are data.

#### V0MessageRendererProps

```typescript
interface V0MessageRendererProps {
  content: MessageBinaryFormat
  messageId?: string
  role?: 'user' | 'assistant' | 'system' | 'tool'
  streaming?: boolean
  isLastMessage?: boolean
  className?: string
}
```

## Features

### Supported Content Types

- **Markdown/Text Content**: Paragraphs, headings, lists, links, emphasis, code spans, etc.
- **Code Blocks**: Syntax-highlighted code blocks with support for 25+ programming languages
- **Mathematical Expressions**: Inline and block math using KaTeX
- **Extensible**: Easy to extend with additional content types

### Syntax Highlighting

Code blocks are automatically syntax-highlighted using Prism.js with support for:

- JavaScript/TypeScript
- Python, Java, C/C++, C#
- PHP, Ruby, Go, Rust
- Swift, Kotlin, Scala
- SQL, JSON, YAML
- Markdown, CSS/SCSS
- Bash/Shell scripts
- And many more...

### Math Rendering

Mathematical expressions are rendered using KaTeX:

- Inline math: `$E = mc^2$`
- Block math: `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`

## CSS Styling

The component uses Tailwind CSS classes by default. You can:

1. **Use Tailwind CSS**: The component works out of the box with Tailwind
2. **Custom CSS**: Override styles using the `className` prop
3. **CSS Modules**: Import your own styles and pass via `className`

### Required CSS

Make sure to include KaTeX CSS for math rendering:

```css
@import 'katex/dist/katex.min.css';
```

Or import it in your JavaScript:

```javascript
import 'katex/dist/katex.min.css'
```

## Examples

### Complete Chat Interface

```tsx
import { V0MessageRenderer } from '@v0-sdk/react'
import 'katex/dist/katex.min.css'

function ChatInterface({ messages }) {
  return (
    <div className="chat-container">
      {messages.map((message, index) => {
        const content = JSON.parse(message.content)
        const isLast = index === messages.length - 1

        return (
          <div key={message.id} className="message">
            <div className="message-header">
              <span className="role">{message.role}</span>
              <span className="timestamp">{message.createdAt}</span>
            </div>
            <V0MessageRenderer
              content={content}
              messageId={message.id}
              role={message.role}
              isLastMessage={isLast}
              className="message-content"
            />
          </div>
        )
      })}
    </div>
  )
}
```

### Error Handling

```tsx
import { V0MessageRenderer } from '@v0-sdk/react'

function SafeMessageRenderer({ apiResponse }) {
  try {
    const content = JSON.parse(apiResponse.content)

    return (
      <V0MessageRenderer
        content={content}
        messageId={apiResponse.id}
        role={apiResponse.role}
      />
    )
  } catch (error) {
    console.error('Failed to parse message content:', error)

    return <div className="error-message">Failed to render message content</div>
  }
}
```

## Requirements

- React 18+ or React 19+
- Modern browser with ES2020+ support

## License

MIT
