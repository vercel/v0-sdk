'use client'
import React from 'react'
import { Message } from '@v0-sdk/react'
import { sampleMessages } from '@/lib/sample-data'
import { CodeBlock } from './code-block'
import { MathPart } from './math-part'
import { ThinkingSection } from './thinking-section'
import { TaskSection } from './task-section'
import { CodeProjectPart } from './code-project-part'

export default function NeobrutlismPage() {
  return (
    <div className="min-h-screen bg-yellow-300 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-2 h-full">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className={`border-2 border-black ${
                i % 3 === 0
                  ? 'bg-pink-500'
                  : i % 3 === 1
                    ? 'bg-cyan-400'
                    : 'bg-red-500'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <div className="inline-block bg-black border-8 border-black p-8 mb-8 shadow-[12px_12px_0px_0px_rgba(236,72,153,1)] transform rotate-2">
            <div className="bg-white border-4 border-black p-6 transform -rotate-1">
              <h1 className="text-6xl font-black text-black uppercase tracking-wider mb-2 transform skew-x-2">
                NEOBRUTALISM
              </h1>
              <div className="flex justify-center gap-2">
                <div className="w-4 h-4 bg-red-500 border-2 border-black"></div>
                <div className="w-4 h-4 bg-green-500 border-2 border-black"></div>
                <div className="w-4 h-4 bg-blue-500 border-2 border-black"></div>
              </div>
            </div>
          </div>
          <div className="bg-orange-400 border-4 border-black px-8 py-4 inline-block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
            <p className="text-black font-bold uppercase tracking-wide text-lg">
              🚀 BOLD • LOUD • UNAPOLOGETIC • AI CONVERSATIONS 🚀
            </p>
          </div>
        </header>

        <div className="space-y-12">
          {sampleMessages.map((message, index) => (
            <div key={message.id} className="group">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 mt-2">
                  <div
                    className={`w-16 h-16 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transform rotate-3 ${
                      message.role === 'user' ? 'bg-green-400' : 'bg-pink-400'
                    }`}
                  >
                    <div className="font-black text-2xl text-black">
                      {message.role === 'user' ? '😎' : '🤖'}
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white border-6 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
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

                        // Neobrutalism HTML styling
                        p: {
                          className:
                            'mb-6 text-black leading-relaxed text-lg font-medium',
                        },
                        h1: {
                          className:
                            'mb-6 text-4xl font-black text-black uppercase tracking-wide border-b-4 border-black pb-2',
                        },
                        h2: {
                          className:
                            'mb-5 text-3xl font-black text-black uppercase tracking-wide',
                        },
                        h3: {
                          className:
                            'mb-4 text-2xl font-bold text-black uppercase',
                        },
                        h4: {
                          className:
                            'mb-4 text-xl font-bold text-black uppercase',
                        },
                        ul: {
                          className: 'mb-6 space-y-3 text-black list-none',
                        },
                        ol: {
                          className:
                            'mb-6 space-y-3 text-black list-none counter-reset-list',
                        },
                        li: {
                          className:
                            'text-black font-medium relative pl-8 before:content-["→"] before:absolute before:left-0 before:font-black before:text-pink-500',
                        },
                        blockquote: {
                          className:
                            'mb-6 border-l-8 border-pink-500 bg-cyan-200 pl-8 py-6 text-black font-bold italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
                        },
                        code: {
                          className:
                            'bg-black text-green-400 px-2 py-1 font-mono font-bold border-2 border-green-400',
                        },
                        pre: {
                          className:
                            'mb-6 bg-black text-green-400 p-6 border-4 border-green-400 overflow-x-auto font-mono shadow-[6px_6px_0px_0px_rgba(0,255,0,1)]',
                        },
                        a: {
                          className:
                            'text-blue-600 font-bold underline decoration-4 decoration-blue-600 hover:bg-blue-600 hover:text-white px-1 transition-all duration-100',
                        },
                        strong: {
                          className:
                            'font-black text-black bg-yellow-300 px-1 border-2 border-black',
                        },
                        em: {
                          className:
                            'italic font-semibold text-black bg-pink-200 px-1',
                        },
                        hr: {
                          className:
                            'my-8 border-t-8 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]',
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
          <div className="bg-black border-4 border-white p-6 inline-block shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transform rotate-1">
            <div className="flex items-center gap-3 text-white font-black uppercase">
              <div className="w-6 h-6 bg-red-500 border-2 border-white"></div>
              <span>POWERED BY @V0-SDK/REACT</span>
              <div className="w-6 h-6 bg-green-500 border-2 border-white"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
