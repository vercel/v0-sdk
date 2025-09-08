'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MissingEnvVar } from '@/lib/env-check'

interface EnvSetupProps {
  missingVars: MissingEnvVar[]
}

export function EnvSetup({ missingVars }: EnvSetupProps) {
  const [copied, setCopied] = useState(false)

  const envFileContent = missingVars
    .map((envVar) => {
      if (envVar.example) {
        return `${envVar.name}=${envVar.example}`
      } else {
        return `${envVar.name}=`
      }
    })
    .join('\n')

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(envFileContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Setup Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add these environment variables to your{' '}
              <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                .env
              </code>{' '}
              file:
            </p>
          </div>

          <div className="bg-[oklch(0.922_0_0)] dark:bg-[oklch(1_0_0_/_15%)] rounded-lg p-6 mb-6">
            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-all">
              {envFileContent}
            </pre>
          </div>

          <div className="text-center space-y-4">
            <Button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              After adding the variables, restart your server
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
