'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import { useAtom } from 'jotai'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import { responseAtom, isLoadingAtom } from '../lib/atoms'

// Register the JSON language
hljs.registerLanguage('json', json)

export function ResponsePanel() {
  const [response] = useAtom(responseAtom)
  const [isLoading] = useAtom(isLoadingAtom)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current && response && activeTab === 'body') {
      hljs.highlightElement(codeRef.current)
    }
  }, [response, activeTab])

  const copyToClipboard = () => {
    if (response?.data) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Executing request...</p>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-muted-foreground">Response will appear here</p>
        </div>
      </div>
    )
  }

  const hasError = response.error || (response.status && response.status >= 400)
  const displayData = response.error || response.data

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex-none border-b border-border">
        <div className="flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3">
          <div className="flex items-center gap-2 lg:gap-4">
            <span
              className={`px-2 py-1 text-xs lg:text-sm font-medium rounded ${
                hasError
                  ? 'text-destructive-foreground bg-destructive/10'
                  : 'text-success-foreground bg-success/10'
              }`}
            >
              {response.status || 'Error'} {response.statusText || ''}
            </span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm text-foreground hover:bg-muted rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="flex border-t border-border">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'body'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'headers'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Headers
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 lg:p-4 bg-background">
        {activeTab === 'body' && (
          <pre className="text-xs lg:text-sm font-mono">
            <code ref={codeRef} className="language-json block text-foreground">
              {JSON.stringify(displayData, null, 2)}
            </code>
          </pre>
        )}
        {activeTab === 'headers' && response.headers && (
          <div className="space-y-1.5 lg:space-y-2 font-mono">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-1.5 lg:gap-2 text-xs lg:text-sm flex-col sm:flex-row">
                <span className="font-medium text-foreground break-all">{key}:</span>
                <span className="text-muted-foreground break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
