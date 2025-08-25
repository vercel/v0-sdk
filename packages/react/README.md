# @v0-sdk/react

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

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
import { Message } from '@v0-sdk/react'

function ChatMessage({ apiResponse }) {
  // Parse the content from the API response
  const content = JSON.parse(apiResponse.content)

  return (
    <Message
      content={content}
      messageId={apiResponse.id}
      role={apiResponse.role}
    />
  )
}
```

### With Streaming

```tsx
import { Message } from '@v0-sdk/react'

function StreamingMessage({ apiResponse, isStreaming }) {
  const content = JSON.parse(apiResponse.content)

  return (
    <Message
      content={content}
      messageId={apiResponse.id}
      role={apiResponse.role}
      streaming={isStreaming}
      isLastMessage={true}
    />
  )
}
```

### Custom Component Styling

The `Message` component supports custom component renderers for complete control over styling and behavior:

```tsx
import { Message, CodeBlock, MathPart } from '@v0-sdk/react'

// Custom code block with syntax highlighting
function CustomCodeBlock({ language, code, className }) {
  return (
    <div className="my-code-block">
      <div className="code-header">{language}</div>
      <pre className={className}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Custom math renderer
function CustomMathPart({ content, inline, className }) {
  return (
    <span className={`my-math ${inline ? 'inline' : 'block'} ${className}`}>
      {content}
    </span>
  )
}

function StyledMessage({ apiResponse }) {
  const content = JSON.parse(apiResponse.content)

  return (
    <Message
      content={content}
      messageId={apiResponse.id}
      role={apiResponse.role}
      components={{
        CodeBlock: CustomCodeBlock,
        MathPart: CustomMathPart,
        // Style HTML elements with simple className objects
        p: { className: 'my-paragraph-styles' },
        h1: { className: 'my-heading-styles' },
        // Or use custom components for full control
        blockquote: ({ children, ...props }) => (
          <div className="my-custom-blockquote" {...props}>
            {children}
          </div>
        ),
      }}
      className="my-custom-message-styles"
    />
  )
}
```

## API Reference

### Message

The main component for rendering v0 Platform API message content.

#### Props

| Prop            | Type                                          | Default       | Description                                                                  |
| --------------- | --------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `content`       | `MessageBinaryFormat`                         | **required**  | The parsed content from the v0 Platform API (JSON.parse the 'content' field) |
| `messageId`     | `string`                                      | `'unknown'`   | Optional message ID for tracking purposes                                    |
| `role`          | `'user' \| 'assistant' \| 'system' \| 'tool'` | `'assistant'` | Role of the message sender                                                   |
| `streaming`     | `boolean`                                     | `false`       | Whether the message is currently being streamed                              |
| `isLastMessage` | `boolean`                                     | `false`       | Whether this is the last message in the conversation                         |
| `className`     | `string`                                      | `undefined`   | Custom className for styling the root container                              |
| `components`    | `ComponentOverrides`                          | `undefined`   | Custom component renderers (see Custom Components section)                   |

### Individual Components

You can also use individual components directly:

```tsx
import {
  CodeBlock,
  MathPart,
  ThinkingSection,
  TaskSection,
  CodeProjectPart
} from '@v0-sdk/react'

// Use components directly
<CodeBlock language="javascript" code="console.log('Hello')" />
<MathPart content="E = mc^2" inline />
<ThinkingSection title="Planning" thought="Let me think about this..." />
```

#### CodeBlock

| Prop        | Type              | Default      | Description                                  |
| ----------- | ----------------- | ------------ | -------------------------------------------- |
| `language`  | `string`          | **required** | Programming language for syntax highlighting |
| `code`      | `string`          | **required** | The code content to display                  |
| `filename`  | `string`          | `undefined`  | Optional filename to display                 |
| `className` | `string`          | `undefined`  | Custom styling                               |
| `children`  | `React.ReactNode` | `undefined`  | Custom content (overrides code prop)         |

#### MathPart

| Prop          | Type              | Default      | Description                             |
| ------------- | ----------------- | ------------ | --------------------------------------- |
| `content`     | `string`          | **required** | The mathematical expression             |
| `inline`      | `boolean`         | `false`      | Whether to render inline or as block    |
| `displayMode` | `boolean`         | `undefined`  | Alternative to inline for display mode  |
| `className`   | `string`          | `undefined`  | Custom styling                          |
| `children`    | `React.ReactNode` | `undefined`  | Custom content (overrides content prop) |

#### ThinkingSection

| Prop         | Type         | Default     | Description                  |
| ------------ | ------------ | ----------- | ---------------------------- |
| `title`      | `string`     | `undefined` | Section title                |
| `thought`    | `string`     | `undefined` | The thinking content         |
| `duration`   | `number`     | `undefined` | Duration in milliseconds     |
| `collapsed`  | `boolean`    | `false`     | Whether section is collapsed |
| `onCollapse` | `() => void` | `undefined` | Collapse toggle handler      |
| `className`  | `string`     | `undefined` | Custom styling               |

#### TaskSection

| Prop         | Type         | Default     | Description                  |
| ------------ | ------------ | ----------- | ---------------------------- |
| `title`      | `string`     | `undefined` | Section title                |
| `type`       | `string`     | `undefined` | Task type                    |
| `parts`      | `any[]`      | `undefined` | Task content parts           |
| `collapsed`  | `boolean`    | `false`     | Whether section is collapsed |
| `onCollapse` | `() => void` | `undefined` | Collapse toggle handler      |
| `className`  | `string`     | `undefined` | Custom styling               |

### Types

#### MessageBinaryFormat

```typescript
type MessageBinaryFormat = [number, ...any[]][]
```

The binary format for message content as returned by the v0 Platform API. Each row is a tuple where the first element is the type and the rest are data.

#### MessageProps

```typescript
interface MessageProps {
  content: MessageBinaryFormat
  messageId?: string
  role?: 'user' | 'assistant' | 'system' | 'tool'
  streaming?: boolean
  isLastMessage?: boolean
  className?: string
  components?: ComponentOverrides
}
```

## Features

### Supported Content Types

- **Markdown/Text Content**: Paragraphs, headings, lists, links, emphasis, code spans, etc.
- **Code Blocks**: Syntax-highlighted code blocks with filename support
- **Mathematical Expressions**: Inline and block math expressions
- **Thinking Sections**: Collapsible reasoning/thinking content
- **Task Sections**: Structured task and workflow content
- **Code Projects**: Multi-file code project display
- **Rich Components**: Full component customization support

### Component Customization

The `components` prop allows you to override any part of the rendering:

```tsx
// Simple className-based styling
<Message
  content={content}
  components={{
    p: { className: 'my-paragraph' },
    h1: { className: 'text-2xl font-bold' }
  }}
/>

// Full component replacement
<Message
  content={content}
  components={{
    CodeBlock: MyCustomCodeBlock,
    MathPart: MyCustomMathRenderer,
    ThinkingSection: MyCustomThinking
  }}
/>
```

### Default Styling

The components use Tailwind CSS classes by default but can work with any CSS framework:

1. **Tailwind CSS**: Works out of the box
2. **Custom CSS**: Use the `className` prop and `components` overrides
3. **CSS Modules**: Pass CSS module classes via `className` and `components`
4. **Styled Components**: Wrap components with styled-components

## Backward Compatibility

The package maintains backward compatibility with previous versions:

```tsx
// These all work and refer to the same component
import { Message } from '@v0-sdk/react'
import { MessageRenderer } from '@v0-sdk/react'
import { V0MessageRenderer } from '@v0-sdk/react'

// These are all equivalent
<Message content={content} />
<MessageRenderer content={content} />
<V0MessageRenderer content={content} />
```

## Examples

### Complete Chat Interface

```tsx
import { Message } from '@v0-sdk/react'

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
            <Message
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

### Custom Theme Example

```tsx
import { Message, CodeBlock, MathPart } from '@v0-sdk/react'

// Dark theme code block
function DarkCodeBlock({ language, code, filename }) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {filename && (
        <div className="bg-gray-800 px-4 py-2 text-gray-300 text-sm">
          {filename}
        </div>
      )}
      <div className="bg-gray-700 px-2 py-1 text-xs text-gray-400">
        {language}
      </div>
      <pre className="p-4 text-green-400 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Elegant math renderer
function ElegantMath({ content, inline }) {
  return (
    <span
      className={`
      ${inline ? 'mx-1' : 'block text-center my-4'}
      font-serif text-blue-600
    `}
    >
      {content}
    </span>
  )
}

function ThemedChat({ apiResponse }) {
  const content = JSON.parse(apiResponse.content)

  return (
    <Message
      content={content}
      components={{
        CodeBlock: DarkCodeBlock,
        MathPart: ElegantMath,
        h1: { className: 'text-3xl font-bold text-gray-800 mb-4' },
        h2: { className: 'text-2xl font-semibold text-gray-700 mb-3' },
        p: { className: 'text-gray-600 leading-relaxed mb-4' },
        blockquote: { className: 'border-l-4 border-blue-500 pl-4 italic' },
      }}
      className="max-w-4xl mx-auto p-6"
    />
  )
}
```

### Error Handling

```tsx
import { Message } from '@v0-sdk/react'

function SafeMessageRenderer({ apiResponse }) {
  try {
    const content = JSON.parse(apiResponse.content)

    return (
      <Message
        content={content}
        messageId={apiResponse.id}
        role={apiResponse.role}
      />
    )
  } catch (error) {
    console.error('Failed to parse message content:', error)
    return (
      <div className="error-message p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700">Failed to render message content</p>
        <pre className="text-xs text-red-600 mt-2 overflow-x-auto">
          {error.message}
        </pre>
      </div>
    )
  }
}
```

## TypeScript

The package is written in TypeScript and includes comprehensive type definitions. All components and props are fully typed for the best development experience.

```tsx
import type {
  MessageProps,
  CodeBlockProps,
  MathPartProps,
  MessageBinaryFormat,
} from '@v0-sdk/react'

// Type-safe usage
const myMessage: MessageProps = {
  content: parsedContent,
  role: 'assistant',
  streaming: false,
}
```

## Requirements

- React 18+ or React 19+
- Modern browser with ES2020+ support
- TypeScript 4.5+ (if using TypeScript)

## License

MIT
