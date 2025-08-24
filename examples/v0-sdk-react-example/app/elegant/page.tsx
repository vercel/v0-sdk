'use client'
import React from 'react'
import { Message } from '@v0-sdk/react'
import { sampleMessages } from '@/lib/sample-data'
import { CodeBlock } from './code-block'
import { MathPart } from './math-part'
import { ThinkingSection } from './thinking-section'
import { TaskSection } from './task-section'
import { CodeProjectPart } from './code-project-part'

export default function ElegantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 bg-white rounded-full opacity-90"></div>
          </div>
          <h1 className="text-4xl font-light text-gray-800 dark:text-gray-100 mb-3">
            Elegant Style
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            A beautiful, refined approach to AI conversations
          </p>
        </header>

        <div className="space-y-12">
          {sampleMessages.map((message, index) => (
            <div key={message.id} className="group">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 mt-2">
                  <div
                    className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                        : 'bg-gradient-to-br from-purple-400 to-pink-500'
                    }`}
                  >
                    <div className="w-6 h-6 bg-white rounded-full opacity-90"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/30">
                    <Message
                      content={message.content}
                      messageId={message.id}
                      role={message.role}
                      className="space-y-6"
                      components={{
                        CodeBlock,
                        MathPart,
                        ThinkingSection,
                        TaskSection,
                        CodeProjectPart,

                        // Elegant HTML styling
                        p: {
                          className:
                            'mb-6 text-gray-700 dark:text-gray-200 leading-relaxed text-lg',
                        },
                        h1: {
                          className:
                            'mb-6 text-3xl font-light text-gray-800 dark:text-gray-100',
                        },
                        h2: {
                          className:
                            'mb-5 text-2xl font-light text-gray-800 dark:text-gray-100',
                        },
                        h3: {
                          className:
                            'mb-4 text-xl font-medium text-gray-800 dark:text-gray-100',
                        },
                        ul: {
                          className:
                            'mb-6 space-y-3 text-gray-700 dark:text-gray-200',
                        },
                        ol: {
                          className:
                            'mb-6 space-y-3 text-gray-700 dark:text-gray-200',
                        },
                        li: {
                          className: 'text-gray-700 dark:text-gray-200 pl-2',
                        },
                        blockquote: {
                          className:
                            'mb-6 border-l-4 border-purple-300 dark:border-purple-500 pl-6 py-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-r-lg italic text-gray-600 dark:text-gray-300',
                        },
                        code: {
                          className:
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-md text-sm font-medium',
                        },
                        pre: {
                          className:
                            'mb-6 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-700',
                        },
                        a: {
                          className:
                            'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline decoration-purple-300 hover:decoration-purple-500 transition-colors',
                        },
                        strong: {
                          className:
                            'font-semibold text-gray-800 dark:text-gray-100',
                        },
                        em: {
                          className: 'italic text-gray-600 dark:text-gray-300',
                        },
                        hr: {
                          className:
                            'my-8 border-purple-200 dark:border-purple-700',
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Crafted with @v0-sdk/react</span>
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
          </div>
        </footer>
      </div>
    </div>
  )
}
