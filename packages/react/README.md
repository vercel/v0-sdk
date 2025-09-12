# @v0-sdk/react

> **⚠️ Developer Preview**: This SDK is currently in beta and is subject to change. Use in production at your own risk.

Headless React components and hooks for rendering content from the v0 Platform API.

## Features

- **Headless by design** - Works with React Native, TUIs, and any React renderer
- **Flexible rendering** - Use provided JSX components or build your own with headless hooks
- **Customizable** - Override any component or styling
- **Zero DOM dependencies** - No `react-dom` required
- **Streaming support** - Real-time message streaming with `useStreamingMessage`
- **Backward compatible** - Drop-in replacement for existing implementations

## Installation

```bash
npm install @v0-sdk/react
# or
yarn add @v0-sdk/react
# or
pnpm add @v0-sdk/react
```

## Usage

### Basic JSX Components (Web/React DOM)

```tsx
import { Message, StreamingMessage } from '@v0-sdk/react'

function ChatMessage({ content }) {
  return (
    <Message
      content={content}
      messageId="msg-1"
      role="assistant"
      className="my-message"
    />
  )
}

function StreamingChat({ stream }) {
  return (
    <StreamingMessage
      stream={stream}
      messageId="streaming-msg"
      role="assistant"
      onComplete={(content) => console.log('Complete:', content)}
    />
  )
}
```

### Headless Hooks (React Native/Ink/TUI)

```tsx
import { useMessage, useStreamingMessageData } from '@v0-sdk/react'
import { Text, View } from 'react-native' // or any other renderer

function HeadlessMessage({ content }) {
  const messageData = useMessage({
    content,
    messageId: 'msg-1',
    role: 'assistant',
  })

  return (
    <View>
      {messageData.elements.map((element) => (
        <Text key={element.key}>
          {element.type === 'text' ? element.data : JSON.stringify(element)}
        </Text>
      ))}
    </View>
  )
}

function HeadlessStreamingMessage({ stream }) {
  const streamingData = useStreamingMessageData({
    stream,
    messageId: 'streaming-msg',
    role: 'assistant',
  })

  if (streamingData.error) {
    return <Text style={{ color: 'red' }}>Error: {streamingData.error}</Text>
  }

  if (streamingData.isStreaming && !streamingData.messageData) {
    return <Text>Loading...</Text>
  }

  return (
    <View>
      {streamingData.messageData?.elements.map((element) => (
        <Text key={element.key}>
          {element.type === 'text' ? element.data : JSON.stringify(element)}
        </Text>
      ))}
    </View>
  )
}
```

### Ink CLI Example

```tsx
import { useMessage } from '@v0-sdk/react'
import { Text, Box } from 'ink'

function CliMessage({ content }) {
  const messageData = useMessage({
    content,
    messageId: 'cli-msg',
    role: 'assistant',
  })

  return (
    <Box flexDirection="column">
      {messageData.elements.map((element) => (
        <Text key={element.key}>
          {element.type === 'text' ? element.data : `[${element.type}]`}
        </Text>
      ))}
    </Box>
  )
}
```

## Available Hooks

### Core Hooks

- `useMessage(props)` - Process message content into headless data structure
- `useStreamingMessageData(props)` - Handle streaming messages with real-time updates
- `useStreamingMessage(stream, options)` - Low-level streaming hook

### Component Hooks

- `useIcon(props)` - Icon data and fallbacks
- `useCodeBlock(props)` - Code block processing
- `useMath(props)` - Math content processing
- `useThinkingSection(props)` - Thinking section state management
- `useTaskSection(props)` - Task section state and processing
- `useCodeProject(props)` - Code project structure
- `useContentPart(part)` - Content part analysis and processing

## Available Components

All components are optional JSX renderers that work with DOM environments. For headless usage, use the corresponding hooks instead.

- `Message` - Main message renderer
- `StreamingMessage` - Streaming message with loading states
- `Icon` - Generic icon component with fallbacks
- `CodeBlock` - Code syntax highlighting
- `MathPart` - Math content rendering
- `ThinkingSection` - Collapsible thinking sections
- `TaskSection` - Collapsible task sections
- `CodeProjectPart` - Code project file browser
- `ContentPartRenderer` - Handles different content part types

## Supported Task Types

The package automatically handles all v0 Platform API task types:

### Explicitly Supported Tasks

- `task-thinking-v1` - AI reasoning and thought processes
- `task-search-web-v1` - Web search operations with results
- `task-search-repo-v1` - Repository/codebase search functionality
- `task-diagnostics-v1` - Code analysis and issue detection
- `task-read-file-v1` - File reading operations
- `task-coding-v1` - Code generation and editing tasks
- `task-generate-design-inspiration-v1` - Design inspiration generation
- `task-start-v1` - Task initialization (usually hidden)

### Future-Proof Support

Any new task type following the `task-*-v1` pattern will be automatically supported with:

- Auto-generated readable titles
- Appropriate icon selection
- Proper task section rendering
- Graceful fallback handling

## Customization

### Custom Components

```tsx
import { Message } from '@v0-sdk/react'

function CustomMessage({ content }) {
  return (
    <Message
      content={content}
      components={{
        // Override specific HTML elements
        p: ({ children }) => <MyParagraph>{children}</MyParagraph>,
        code: ({ children }) => <MyCode>{children}</MyCode>,

        // Override v0-specific components
        CodeBlock: ({ language, code }) => (
          <MyCodeHighlighter lang={language}>{code}</MyCodeHighlighter>
        ),
        Icon: ({ name }) => <MyIcon icon={name} />,
      }}
    />
  )
}
```

### Headless Custom Rendering

```tsx
import { useMessage } from '@v0-sdk/react'

function CustomHeadlessMessage({ content }) {
  const messageData = useMessage({ content })

  const renderElement = (element) => {
    switch (element.type) {
      case 'text':
        return <MyText>{element.data}</MyText>
      case 'code-project':
        return <MyCodeProject {...element.data} />
      case 'html':
        return <MyHtmlElement {...element.data} />
      default:
        return null
    }
  }

  return <MyContainer>{messageData.elements.map(renderElement)}</MyContainer>
}
```

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import type {
  MessageData,
  MessageElement,
  StreamingMessageData,
  IconData,
  CodeBlockData,
  // ... and many more
} from '@v0-sdk/react'
```

## Migration from Previous Versions

This version is backward compatible. Existing code will continue to work unchanged. To adopt headless patterns:

1. **Keep existing JSX components** for web/DOM environments
2. **Use headless hooks** for React Native, Ink, or custom renderers
3. **Gradually migrate** components as needed

## React Native Example

```tsx
import { useMessage, useIcon } from '@v0-sdk/react'
import { View, Text, ScrollView } from 'react-native'

function RNMessage({ content }) {
  const messageData = useMessage({ content })

  const renderElement = (element) => {
    if (element.type === 'text') {
      return <Text key={element.key}>{element.data}</Text>
    }

    if (element.type === 'html' && element.data.tagName === 'p') {
      return (
        <Text key={element.key} style={{ marginVertical: 8 }}>
          {element.children?.map(renderElement)}
        </Text>
      )
    }

    return <Text key={element.key}>[{element.type}]</Text>
  }

  return <ScrollView>{messageData.elements.map(renderElement)}</ScrollView>
}

function RNIcon({ name }) {
  const iconData = useIcon({ name })
  return <Text>{iconData.fallback}</Text>
}
```

## License

Apache-2.0
