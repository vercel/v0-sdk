'use client'
import React from 'react'
import { Message } from '@v0-sdk/react'
import { sampleMessages } from '@/lib/sample-data'
import { CodeBlock } from './code-block'
import { MathPart } from './math-part'
import { ThinkingSection } from './thinking-section'
import { TaskSection } from './task-section'
import { CodeProjectPart } from './code-project-part'

export default function TerminalPage() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Terminal header */}
        <div className="mb-8 border border-green-400 rounded bg-black">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-400 text-black">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 font-bold">v0-sdk-terminal</span>
          </div>
          <div className="p-4">
            <div className="mb-2">
              <span className="text-green-300">user@v0-sdk:~$</span>{' '}
              <span className="text-white">./run-ai-chat</span>
            </div>
            <div className="text-green-300">
              [INFO] Initializing @v0-sdk/react terminal interface...
            </div>
            <div className="text-green-300">
              [INFO] Connection established. Ready for input.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {sampleMessages.map((message, index) => (
            <div
              key={message.id}
              className={`border-l-4 pl-4 ${
                message.role === 'user' ? 'border-blue-400' : 'border-green-400'
              }`}
            >
              <Message
                content={message.content}
                messageId={message.id}
                role={message.role}
                className="space-y-3"
                components={{
                  CodeBlock,
                  MathPart,
                  ThinkingSection,
                  TaskSection,
                  CodeProjectPart,

                  // Terminal-style HTML elements
                  p: { className: 'mb-3 text-green-100 leading-relaxed' },
                  h1: {
                    className:
                      'mb-3 text-xl font-bold text-green-300 border-b border-green-600 pb-1',
                  },
                  h2: {
                    className: 'mb-3 text-lg font-bold text-green-300',
                  },
                  h3: {
                    className: 'mb-2 text-base font-bold text-green-300',
                  },
                  ul: {
                    className: 'mb-3 space-y-1 text-green-100 list-none',
                  },
                  ol: {
                    className: 'mb-3 space-y-1 text-green-100 list-none',
                  },
                  li: {
                    className:
                      'text-green-100 before:content-["→"] before:text-green-400 before:mr-2',
                  },
                  blockquote: {
                    className:
                      'mb-3 border-l-4 border-yellow-400 pl-4 text-yellow-200 bg-yellow-900/20 py-2',
                  },
                  code: {
                    className:
                      'bg-gray-900 text-yellow-300 px-2 py-1 rounded border border-gray-700 font-mono text-sm',
                  },
                  pre: {
                    className:
                      'mb-3 bg-gray-900 text-green-100 p-4 rounded border border-gray-700 overflow-x-auto font-mono text-sm',
                  },
                  a: {
                    className:
                      'text-cyan-400 hover:text-cyan-300 underline decoration-dotted',
                  },
                  strong: { className: 'font-bold text-green-300' },
                  em: { className: 'italic text-green-200' },
                  hr: { className: 'my-4 border-green-600' },
                }}
              />
            </div>
          ))}
        </div>

        {/* Terminal footer */}
        <footer className="mt-12 border-t border-green-600 pt-6">
          <div className="text-center space-y-2">
            <div className="text-green-300">
              <span className="text-green-400">[SYSTEM]</span> Session active.
            </div>
            <div className="text-xs text-green-600">
              Powered by{' '}
              <a
                href="https://github.com/vercel/v0-sdk"
                className="text-cyan-400 hover:text-cyan-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                @v0-sdk/react
              </a>
              {' | '}
              <span className="text-green-500">●</span> Online
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
