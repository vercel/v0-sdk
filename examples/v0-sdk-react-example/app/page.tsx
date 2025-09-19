'use client'

import React from 'react'
import { Message } from '@v0-sdk/react'
import { sampleMessages } from '@/lib/sample-data'
import { CodeBlock } from '@/components/code-block'
import { MathPart } from '@/components/math-part'
import { ThinkingSection } from '@/components/thinking-section'
import { TaskSection } from '@/components/task-section'
import { CodeProjectPart } from '@/components/code-project-part'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-1">
          {sampleMessages.map((message, index) => (
            <div key={message.id}>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      message.role === 'user' ? 'bg-[#10A37F]' : 'bg-[#AB68FF]'
                    }`}
                  >
                    {message.role === 'user' ? 'U' : 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Message
                      content={message.content}
                      messageId={message.id}
                      role={message.role}
                      className="space-y-4"
                      components={{
                        CodeBlock,
                        MathPart,
                        ThinkingSection,
                        TaskSection,
                        CodeProjectPart,

                        // HTML element styling using simple className objects
                        p: {
                          className:
                            'mb-4 text-gray-800 dark:text-gray-200 leading-relaxed',
                        },
                        h1: {
                          className:
                            'mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100',
                        },
                        h2: {
                          className:
                            'mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100',
                        },
                        h3: {
                          className:
                            'mb-4 text-lg font-medium text-gray-900 dark:text-gray-100',
                        },
                        h4: {
                          className:
                            'mb-4 text-base font-medium text-gray-900 dark:text-gray-100',
                        },
                        h5: {
                          className:
                            'mb-4 text-sm font-medium text-gray-900 dark:text-gray-100',
                        },
                        h6: {
                          className:
                            'mb-4 text-xs font-medium text-gray-900 dark:text-gray-100',
                        },
                        ul: {
                          className:
                            'mb-4 space-y-1 text-gray-800 dark:text-gray-200 list-disc list-inside',
                        },
                        ol: {
                          className:
                            'mb-4 space-y-1 text-gray-800 dark:text-gray-200 list-decimal list-inside',
                        },
                        li: {
                          className: 'mb-1 text-gray-800 dark:text-gray-200',
                        },
                        blockquote: {
                          className:
                            'mb-4 border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300',
                        },
                        code: {
                          className:
                            'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm',
                        },
                        pre: {
                          className:
                            'mb-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-x-auto',
                        },
                        a: {
                          className:
                            'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline',
                        },
                        strong: {
                          className:
                            'font-semibold text-gray-900 dark:text-gray-100',
                        },
                        em: {
                          className: 'italic text-gray-700 dark:text-gray-300',
                        },
                        hr: {
                          className:
                            'my-6 border-gray-300 dark:border-gray-600',
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p>
            Built with{' '}
            <a
              href="https://github.com/vercel/v0-sdk"
              className="text-blue-600 dark:text-white hover:text-blue-800 dark:hover:text-gray-300 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @v0-sdk/react
            </a>{' '}
            and{' '}
            <a
              href="https://nextjs.org"
              className="text-blue-600 dark:text-white hover:text-blue-800 dark:hover:text-gray-300 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
