'use client'
import React from 'react'
import { Message } from '@v0-sdk/react'
import { sampleMessages } from '@/lib/sample-data'
import { CodeBlock } from './code-block'
import { MathPart } from './math-part'
import { ThinkingSection } from './thinking-section'
import { TaskSection } from './task-section'
import { CodeProjectPart } from './code-project-part'

export default function MinimalPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
            Minimal Style
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A clean, minimal approach to displaying AI conversations
          </p>
        </header>

        <div className="space-y-8">
          {sampleMessages.map((message, index) => (
            <div key={message.id} className="group">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Message
                    content={message.content}
                    messageId={message.id}
                    role={message.role}
                    className="prose prose-gray dark:prose-invert max-w-none"
                    components={{
                      CodeBlock,
                      MathPart,
                      ThinkingSection,
                      TaskSection,
                      CodeProjectPart,

                      // Minimal HTML styling
                      p: {
                        className:
                          'mb-4 text-gray-800 dark:text-gray-200 leading-relaxed',
                      },
                      h1: {
                        className:
                          'mb-4 text-xl font-medium text-gray-900 dark:text-gray-100',
                      },
                      h2: {
                        className:
                          'mb-3 text-lg font-medium text-gray-900 dark:text-gray-100',
                      },
                      h3: {
                        className:
                          'mb-3 text-base font-medium text-gray-900 dark:text-gray-100',
                      },
                      ul: {
                        className:
                          'mb-4 space-y-1 text-gray-800 dark:text-gray-200',
                      },
                      ol: {
                        className:
                          'mb-4 space-y-1 text-gray-800 dark:text-gray-200',
                      },
                      li: { className: 'text-gray-800 dark:text-gray-200' },
                      blockquote: {
                        className:
                          'mb-4 border-l-2 border-gray-300 dark:border-gray-600 pl-4 text-gray-700 dark:text-gray-300',
                      },
                      code: {
                        className:
                          'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm font-mono',
                      },
                      a: {
                        className:
                          'text-blue-600 dark:text-blue-400 hover:underline',
                      },
                      strong: {
                        className:
                          'font-semibold text-gray-900 dark:text-gray-100',
                      },
                      em: {
                        className: 'italic text-gray-700 dark:text-gray-300',
                      },
                      hr: {
                        className: 'my-6 border-gray-300 dark:border-gray-600',
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Built with @v0-sdk/react
          </div>
        </footer>
      </div>
    </div>
  )
}
