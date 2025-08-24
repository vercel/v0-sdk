import type { MessageBinaryFormat } from '@v0-sdk/react'

// Sample data representing what the v0 Platform API would return
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
]
