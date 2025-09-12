import type { MessageBinaryFormat } from '@v0-sdk/react'

// Sample data representing what the v0 Platform API would return
// Showcasing all possible task/tool types that could be exposed via experimental_content
export const sampleMessages = [
  {
    id: 'msg-1',
    role: 'user' as const,
    content: [
      [
        0,
        [
          [
            'p',
            {},
            'Can you help me find the current weather in San Francisco and create a React component to display it?',
          ],
        ],
      ],
    ] as MessageBinaryFormat,
  },
  {
    id: 'msg-2',
    role: 'assistant' as const,
    content: [
      [
        0,
        [
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'task-thinking-v1',
                id: 'thinking-0',
                parts: [
                  {
                    type: 'thinking-end',
                    duration: 3.0058823529411764,
                    thought:
                      'The user wants me to get live weather data for San Francisco and display it in a static component. This involves:\n\n- First, I need to search the web to find current weather information for San Francisco\n- Then create a static component that displays this weather data\n\nSince they want a "static component", I assume they mean a component that displays the current weather data I fetch, rather than a dynamic component that fetches data on the client side.\n\nLet me start by searching for current SF weather data.',
                  },
                ],
                createdAt: 0,
                finishedAt: 0,
                lastPartSentAt: 0,
              },
              id: 'thinking-0',
            },
          ],
          [
            'p',
            {},
            [
              'text',
              {},
              "I'll get the current weather for San Francisco and create a static component to display it.",
            ],
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: 1755835583229,
                finishedAt: 1755835583229,
                lastPartSentAt: 1755835583229,
                id: '1N4i4ehBjNVeIja2',
                type: 'task-start-v1',
                parts: [
                  {
                    type: 'launch-tasks',
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: 1755835585875,
                finishedAt: 1755835591941,
                lastPartSentAt: 1755835591916,
                taskNameActive: 'Getting SF weather data',
                taskNameComplete: 'Retrieved SF weather data',
                id: 'ILV8gNzU9IEUdt9p',
                type: 'task-search-web-v1',
                parts: [
                  {
                    type: 'starting-web-search',
                    query:
                      'current weather San Francisco temperature conditions today',
                  },
                  {
                    type: 'got-results',
                    count: 5,
                  },
                  {
                    type: 'finished-web-search',
                    answer:
                      'The current temperature in San Francisco, CA is 76°F and it is partly cloudy or sunny. The RealFeel® temperature is 82°F.',
                    citations: [
                      {
                        url: 'https://www.accuweather.com/en/us/san-francisco/94103/current-weather/347629',
                        favicon: null,
                        image:
                          'https://xurtccytrzafbfk3.public.blob.vercel-storage.com/agent-assets/e3917da5f10231e0f6689323171807a9acc869165dfd40f138757aa363d8aa4c.png',
                        title: 'Current Weather - San Francisco, CA',
                        publishedDate: '2025-08-01T00:00:00.000Z',
                      },
                      {
                        url: 'https://weather.com/weather/today/l/USCA0987:1:US',
                        favicon: null,
                        image:
                          'https://xurtccytrzafbfk3.public.blob.vercel-storage.com/agent-assets/4e77bfa3c4902b663b7a88dfa70eb51f35fd114381a202ea1eb78dffc7844a5a.png',
                        title:
                          'Weather Forecast and Conditions for San Francisco, CA',
                        publishedDate: '2024-02-21T22:14:55.000Z',
                      },
                    ],
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: 1755835591999,
                finishedAt: 1755835592047,
                lastPartSentAt: 1755835592026,
                taskNameActive: 'Checking codebase structure',
                taskNameComplete: 'Analyzed codebase structure',
                id: 'f6b8bnm5c8G47wI2',
                type: 'task-search-repo-v1',
                parts: [
                  {
                    type: 'starting-repo-search',
                    query: 'Give me an overview of the codebase',
                  },
                  {
                    type: 'select-files',
                    filePaths: ['app/layout.tsx', 'app/globals.css'],
                  },
                ],
              },
            },
          ],
          [
            'Codeblock',
            {
              lang: 'typescriptreact',
              meta: {
                type: 'code-project',
                id: 'sf-weather',
                taskNameActive: 'Creating weather component',
                taskNameComplete: 'Created weather component',
                project: 'sf-weather',
              },
              closed: true,
            },
            '[V0_FILE]tsx:file="app/page.tsx"\n... shell ...',
          ],
          [
            'p',
            {},
            [
              'text',
              {},
              "I've created a clean, static weather component displaying the current San Francisco weather data. The component shows the temperature (76°F), feels-like temperature (82°F), and partly cloudy conditions in an attractive card layout with weather icons. The design uses a subtle blue gradient background and responsive styling that works well in both light and dark modes.",
            ],
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: 1755835602848,
                finishedAt: 1755835615076,
                lastPartSentAt: 1755835615051,
                id: 'xMm6bAMjKAU9X4uF',
                type: 'task-diagnostics-v1',
                parts: [
                  {
                    type: 'fetching-diagnostics',
                  },
                  {
                    type: 'diagnostics-passed',
                  },
                ],
              },
            },
          ],
        ],
      ],
    ] as MessageBinaryFormat,
  },
  {
    id: 'msg-3',
    role: 'user' as const,
    content: [
      [
        0,
        [
          [
            'p',
            {},
            'That looks great! Can you also show me how to add some mathematical formulas?',
          ],
        ],
      ],
    ] as MessageBinaryFormat,
  },
  {
    id: 'msg-4',
    role: 'assistant' as const,
    content: [
      [
        0,
        [
          [
            'p',
            {},
            'Absolutely! Here are some mathematical formulas using LaTeX notation:',
          ],
          [
            'p',
            {},
            "Here's Euler's identity, often called the most beautiful equation in mathematics:",
          ],
        ],
      ],
      [3, 'e^{i\\pi} + 1 = 0'],
      [0, [['p', {}, "And here's the integral of a Gaussian function:"]]],
      [3, '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}'],
      [
        0,
        [
          [
            'p',
            {},
            'You can also have inline math like this: The quadratic formula is ',
          ],
        ],
      ],
      [2, 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'],
      [
        0,
        [['p', {}, ' which is very useful for solving quadratic equations.']],
      ],
    ] as MessageBinaryFormat,
  },
  {
    id: 'msg-5',
    role: 'user' as const,
    content: [
      [0, [['p', {}, 'Can you show me the weather component code?']]],
    ] as MessageBinaryFormat,
  },
  {
    id: 'msg-6',
    role: 'assistant' as const,
    content: [
      [0, [['p', {}, "Here's the weather component I created:"]]],
      [
        1,
        'tsx',
        `import React from 'react'

export default function WeatherComponent() {
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg text-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">San Francisco</h1>
          <p className="text-blue-100 text-sm">Partly Cloudy</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light">76°F</div>
          <div className="text-blue-200 text-sm">Feels like 82°F</div>
        </div>
      </div>
      
      <div className="flex items-center justify-center py-4">
        <svg className="w-16 h-16 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-blue-200">Humidity</p>
          <p className="font-semibold">65%</p>
        </div>
        <div>
          <p className="text-blue-200">Wind</p>
          <p className="font-semibold">8 mph</p>
        </div>
        <div>
          <p className="text-blue-200">UV Index</p>
          <p className="font-semibold">6</p>
        </div>
      </div>
    </div>
  )
}`,
      ],
      [
        0,
        [
          [
            'p',
            {},
            'This component displays the current San Francisco weather data with a beautiful gradient background and weather icons.',
          ],
        ],
      ],
    ] as MessageBinaryFormat,
  },
  {
    id: 'msg-7',
    role: 'user' as const,
    content: [
      [
        0,
        [
          [
            'p',
            {},
            'Can you show me examples of all the other task types and content parts that the v0 platform API can expose?',
          ],
        ],
      ],
    ] as MessageBinaryFormat,
  },
  {
    id: 'msg-8',
    role: 'assistant' as const,
    content: [
      [
        0,
        [
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'turn-start',
                id: 'turn-start-1',
                timestamp: Date.now(),
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'task-thinking-v1',
                id: 'thinking-showcase',
                parts: [
                  {
                    type: 'thinking-end',
                    duration: 2.5,
                    thought:
                      'I need to showcase all the different task types that the v0 platform API can expose. This includes file operations, web searches, shell commands, todo management, code generation, and more. Let me demonstrate each one with realistic examples.',
                  },
                ],
                createdAt: Date.now(),
                finishedAt: Date.now() + 2500,
                lastPartSentAt: Date.now() + 2500,
              },
              id: 'thinking-showcase',
            },
          ],
          [
            'p',
            {},
            "I'll demonstrate all the different task types and content parts available in the v0 platform API.",
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 2000,
                lastPartSentAt: Date.now() + 2000,
                taskNameActive: 'Reading multiple files',
                taskNameComplete: 'Read project files',
                id: 'read-files-task',
                type: 'task-read-files-v1',
                parts: [
                  {
                    type: 'starting-read-files',
                    files: ['src/index.ts', 'package.json', 'README.md'],
                  },
                  {
                    type: 'reading-file',
                    file: 'src/index.ts',
                    progress: 1,
                    total: 3,
                  },
                  {
                    type: 'reading-file',
                    file: 'package.json',
                    progress: 2,
                    total: 3,
                  },
                  {
                    type: 'reading-file',
                    file: 'README.md',
                    progress: 3,
                    total: 3,
                  },
                  {
                    type: 'files-read-complete',
                    filesRead: 3,
                    totalLines: 245,
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 1500,
                lastPartSentAt: Date.now() + 1500,
                taskNameActive: 'Reading single file with search',
                taskNameComplete: 'Found matching patterns',
                id: 'read-file-task',
                type: 'task-read-file-v1',
                parts: [
                  {
                    type: 'starting-file-read',
                    file: 'src/components/Button.tsx',
                    searchPattern: 'interface.*Props',
                  },
                  {
                    type: 'file-read-progress',
                    bytesRead: 1024,
                    totalBytes: 2048,
                  },
                  {
                    type: 'search-matches-found',
                    matches: [
                      { line: 5, text: 'interface ButtonProps {' },
                      { line: 12, text: 'interface IconProps {' },
                    ],
                  },
                  {
                    type: 'file-read-complete',
                    file: 'src/components/Button.tsx',
                    matchCount: 2,
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 5000,
                lastPartSentAt: Date.now() + 5000,
                taskNameActive: 'Running some commands',
                taskNameComplete: 'Ran some commands',
                id: 'shell-command-task',
                type: 'task-run-shell-command-v1',
                parts: [
                  {
                    type: 'starting-shell-command',
                    command: 'npm run build',
                    workingDirectory: '/project/root',
                  },
                  {
                    type: 'finished-shell-command',
                    command: 'npm run build',
                    stdout:
                      '> my-app@1.0.0 build\n> next build\n\n   Creating an optimized production build ...\n✓ Compiled successfully\n',
                    stderr: '',
                    exitCode: 0,
                    duration: 4.2,
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 1000,
                lastPartSentAt: Date.now() + 1000,
                taskNameActive: 'Managing todos',
                taskNameComplete: 'Updated todo list',
                id: 'manage-todos-task',
                type: 'task-manage-todos-v1',
                parts: [
                  {
                    type: 'creating-todo-list',
                    title: 'Project Setup Tasks',
                  },
                  {
                    type: 'adding-todo-item',
                    item: {
                      id: 'todo-1',
                      text: 'Set up TypeScript configuration',
                      status: 'completed',
                      priority: 'high',
                    },
                  },
                  {
                    type: 'adding-todo-item',
                    item: {
                      id: 'todo-2',
                      text: 'Install dependencies',
                      status: 'in-progress',
                      priority: 'high',
                    },
                  },
                  {
                    type: 'adding-todo-item',
                    item: {
                      id: 'todo-3',
                      text: 'Write unit tests',
                      status: 'pending',
                      priority: 'medium',
                    },
                  },
                  {
                    type: 'todo-list-updated',
                    totalItems: 3,
                    completedItems: 1,
                    inProgressItems: 1,
                    pendingItems: 1,
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 3000,
                lastPartSentAt: Date.now() + 3000,
                taskNameActive: 'Generating code',
                taskNameComplete: 'Created React component',
                id: 'coding-task',
                type: 'task-coding-v1',
                parts: [
                  {
                    type: 'analyzing-requirements',
                    requirements: [
                      'Create a responsive navigation component',
                      'Include mobile menu functionality',
                      'Support dark/light theme',
                    ],
                  },
                  {
                    type: 'generating-code',
                    filename: 'components/Navigation.tsx',
                    language: 'typescript',
                    progress: 0.3,
                  },
                  {
                    type: 'generating-code',
                    filename: 'components/Navigation.tsx',
                    language: 'typescript',
                    progress: 0.7,
                  },
                  {
                    type: 'code-generation-complete',
                    filename: 'components/Navigation.tsx',
                    linesGenerated: 156,
                    features: [
                      'Responsive design',
                      'Mobile menu',
                      'Theme toggle',
                      'Accessibility features',
                    ],
                  },
                  {
                    type: 'running-linter',
                    tool: 'eslint',
                  },
                  {
                    type: 'linting-complete',
                    issues: 0,
                    warnings: 2,
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 2500,
                lastPartSentAt: Date.now() + 2500,
                taskNameActive: 'Fetching from web',
                taskNameComplete: 'Fetched dog API data',
                id: 'fetch-web-task',
                type: 'task-fetch-from-web-v1',
                parts: [
                  {
                    type: 'starting-fetch-from-web',
                    url: 'https://dogapi.dog/api/v2/breeds',
                  },
                  {
                    type: 'finished-fetch-from-web',
                    url: 'https://dogapi.dog/api/v2/breeds',
                    domain: 'dogapi.dog',
                    title: 'dogapi.dog',
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 4000,
                lastPartSentAt: Date.now() + 4000,
                taskNameActive: 'Inspecting website',
                taskNameComplete: 'Captured screenshot and analyzed',
                id: 'inspect-site-task',
                type: 'task-inspect-site-v1',
                parts: [
                  {
                    type: 'starting-site-inspection',
                    url: 'https://example.com',
                    viewport: { width: 1920, height: 1080 },
                  },
                  {
                    type: 'loading-page',
                    progress: 0.2,
                    status: 'DNS resolved',
                  },
                  {
                    type: 'loading-page',
                    progress: 0.5,
                    status: 'Connected to server',
                  },
                  {
                    type: 'loading-page',
                    progress: 0.8,
                    status: 'Content loaded',
                  },
                  {
                    type: 'page-loaded',
                    loadTime: 1.2,
                    finalUrl: 'https://example.com/',
                  },
                  {
                    type: 'taking-screenshot',
                    format: 'png',
                    quality: 90,
                  },
                  {
                    type: 'screenshot-captured',
                    filename: 'screenshot-1234567890.png',
                    dimensions: { width: 1920, height: 1080 },
                    fileSize: 245760,
                  },
                  {
                    type: 'analyzing-page-structure',
                    elements: {
                      headings: 5,
                      links: 23,
                      images: 8,
                      forms: 1,
                    },
                  },
                  {
                    type: 'inspection-complete',
                    accessibility: {
                      score: 85,
                      issues: ['Missing alt text on 2 images'],
                    },
                    performance: {
                      loadTime: 1.2,
                      firstContentfulPaint: 0.8,
                    },
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 2000,
                lastPartSentAt: Date.now() + 2000,
                taskNameActive: 'Generating design inspiration',
                taskNameComplete: 'Created design variations',
                id: 'design-inspiration-task',
                type: 'task-generate-design-inspiration-v1',
                parts: [
                  {
                    type: 'analyzing-design-brief',
                    brief: 'Modern dashboard for analytics platform',
                    requirements: [
                      'Clean layout',
                      'Data visualization',
                      'Mobile responsive',
                    ],
                  },
                  {
                    type: 'generating-color-palette',
                    palettes: [
                      {
                        name: 'Ocean Blue',
                        colors: ['#0066CC', '#4A90E2', '#7BB3F0', '#B8D4F0'],
                      },
                      {
                        name: 'Forest Green',
                        colors: ['#2D5A27', '#4A7C59', '#68A085', '#A4C3B2'],
                      },
                    ],
                  },
                  {
                    type: 'generating-typography',
                    combinations: [
                      {
                        name: 'Modern Sans',
                        heading: 'Inter',
                        body: 'System UI',
                      },
                      {
                        name: 'Professional',
                        heading: 'Roboto',
                        body: 'Open Sans',
                      },
                    ],
                  },
                  {
                    type: 'generating-layout-variants',
                    variants: [
                      {
                        name: 'Sidebar Navigation',
                        description: 'Fixed sidebar with main content area',
                      },
                      {
                        name: 'Top Navigation',
                        description: 'Header navigation with card-based layout',
                      },
                    ],
                  },
                  {
                    type: 'design-inspiration-complete',
                    totalVariations: 4,
                    themes: ['Light', 'Dark'],
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 1500,
                lastPartSentAt: Date.now() + 1500,
                taskNameActive: 'Checking integrations',
                taskNameComplete: 'Integration check complete',
                id: 'integration-task',
                type: 'task-get-or-request-integration-v1',
                parts: [
                  {
                    type: 'starting-integration-status-check',
                  },
                  {
                    type: 'finished-integration-status-check',
                    integrations: [
                      {
                        name: 'vercel-postgres',
                        instanceName: 'Database',
                        status: 'connected',
                        schema: {
                          tableCount: 3,
                          tables: [
                            {
                              name: 'users',
                              columns: [
                                { name: 'id', type: 'uuid' },
                                { name: 'email', type: 'text' },
                                { name: 'created_at', type: 'timestamp' },
                              ],
                            },
                          ],
                        },
                      },
                    ],
                    envVars: ['DATABASE_URL', 'POSTGRES_URL'],
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                createdAt: Date.now(),
                finishedAt: Date.now() + 500,
                lastPartSentAt: Date.now() + 500,
                taskNameActive: 'Agent stopped',
                taskNameComplete: 'Agent stopped due to timeout',
                id: 'stopped-task',
                type: 'task-stopped-v1',
                parts: [
                  {
                    type: 'agent-timeout',
                  },
                ],
              },
            },
          ],
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'task-repaired-parser-content-v1',
                id: 'parser-repair-task',
                createdAt: Date.now(),
                finishedAt: Date.now() + 800,
                lastPartSentAt: Date.now() + 800,
                parts: [
                  {
                    type: 'parser-error-detected',
                    originalContent: '{"incomplete": json',
                    error: 'Unexpected end of JSON input',
                    position: { line: 1, column: 19 },
                  },
                  {
                    type: 'attempting-repair',
                    strategy: 'json-completion',
                  },
                  {
                    type: 'repair-successful',
                    repairedContent: '{"incomplete": "json"}',
                    confidence: 0.95,
                  },
                ],
              },
            },
          ],
        ],
      ],
      [0, [['p', {}, 'Here are some examples of other content types:']]],
      [
        0,
        [
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'mdx',
                id: 'mdx-content',
                content: `# Interactive Documentation

This is an example of **MDX content** that can include:

- Rich markdown formatting
- Interactive React components
- Code examples with syntax highlighting

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

You can also embed math: $E = mc^2$

And create interactive elements that respond to user input.`,
              },
            },
          ],
        ],
      ],
      [
        0,
        [
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'parse-error',
                id: 'parse-error-example',
                error: {
                  message: 'Unexpected token in JSON at position 42',
                  type: 'SyntaxError',
                  position: 42,
                  context: 'While parsing API response',
                },
                originalContent: '{"data": {"items": [1, 2, 3,]}}',
                timestamp: Date.now(),
              },
            },
          ],
        ],
      ],
      [
        0,
        [
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'turn-reset',
                id: 'turn-reset-1',
                reason: 'user-requested',
                timestamp: Date.now(),
              },
            },
          ],
        ],
      ],
      [
        0,
        [
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'turn-finish',
                id: 'turn-finish-1',
                duration: 15.7,
                tokensGenerated: 1247,
                tasksCompleted: 8,
                timestamp: Date.now(),
              },
            },
          ],
        ],
      ],
      [
        0,
        [
          [
            'p',
            {},
            'This showcases all the different task types and content parts that the v0 platform API can expose through the experimental_content field. Each task type has its own specific part structure that provides detailed information about the progress and results of different operations.',
          ],
        ],
      ],
      [
        0,
        [
          [
            'AssistantMessageContentPart',
            {
              part: {
                type: 'agent-finish',
                id: 'agent-finish-1',
                summary:
                  'Successfully demonstrated all v0 platform API task types',
                totalDuration: 45.2,
                tasksExecuted: 12,
                tokensGenerated: 3456,
                timestamp: Date.now(),
              },
            },
          ],
        ],
      ],
    ] as MessageBinaryFormat,
  },
]
