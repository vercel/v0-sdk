'use client'

import { MessageContent } from '@v0-sdk/react'
import { sampleMessages } from '@/lib/sampleData'
import 'katex/dist/katex.min.css'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#212121]">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            @v0-sdk/react Example
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            This example demonstrates how to use the @v0-sdk/react package to
            render content from the v0 Platform API. The messages below show
            various content types including markdown, code blocks, and
            mathematical expressions.
          </p>
        </header>

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
                    <div className="font-medium text-white mb-2 capitalize">
                      {message.role}
                    </div>
                    <MessageContent
                      content={message.content}
                      messageId={message.id}
                      role={message.role}
                      className="prose prose-sm max-w-none prose-invert"
                      styles={{
                        elements: {
                          p: 'mb-4 text-gray-100 leading-relaxed',
                          h1: 'mb-4 text-2xl font-bold text-white',
                          h2: 'mb-4 text-xl font-semibold text-white',
                          h3: 'mb-4 text-lg font-medium text-white',
                          h4: 'mb-4 text-base font-medium text-white',
                          h5: 'mb-4 text-sm font-medium text-white',
                          h6: 'mb-4 text-xs font-medium text-white',
                          ul: 'mb-4 space-y-1 text-gray-100',
                          ol: 'mb-4 space-y-1 text-gray-100',
                          li: 'mb-1 text-gray-100',
                          blockquote:
                            'mb-4 border-l-4 border-gray-600 pl-4 italic text-gray-300',
                          hr: 'my-6 border-gray-600',
                          code: 'bg-[#2D2D2D] text-[#E5E5E5] px-1.5 py-0.5 rounded text-sm',
                          a: 'text-[#00D4FF] hover:text-[#00B8E6] underline',
                          strong: 'font-semibold text-white',
                          em: 'italic text-gray-200',
                        },
                        markdownContainer: 'space-y-3',
                        codeBlockContainer: 'mb-2',
                        mathContainer: 'mb-2',
                        thinkingContainer: 'mb-2',
                        taskContainer: 'mb-2',
                        codeProjectContainer: 'mb-16',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center text-gray-400">
          <p>
            Built with{' '}
            <a
              href="https://github.com/vercel/v0"
              className="text-[#00D4FF] hover:text-[#00B8E6] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @v0-sdk/react
            </a>{' '}
            and{' '}
            <a
              href="https://nextjs.org"
              className="text-[#00D4FF] hover:text-[#00B8E6] hover:underline"
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
