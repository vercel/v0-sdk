'use client'

import { useState } from 'react'
import { RefreshCw, ExternalLink, Key } from 'lucide-react'

export default function ApiKeyError() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    // Wait a bit to allow user to set the API key
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          API Key Required
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          To use this app, you need to configure your v0 API key. You can get
          one from v0.dev and set it as an environment variable.
        </p>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">
            Setup Instructions:
          </h3>
          <ol className="text-sm text-gray-700 space-y-1">
            <li>
              1. Get your API key from{' '}
              <span className="font-mono bg-gray-200 px-1 rounded">
                v0.dev/settings
              </span>
            </li>
            <li>
              2. Create a{' '}
              <span className="font-mono bg-gray-200 px-1 rounded">
                .env.local
              </span>{' '}
              file
            </li>
            <li>
              3. Add:{' '}
              <span className="font-mono bg-gray-200 px-1 rounded">
                V0_API_KEY=your_key_here
              </span>
            </li>
            <li>4. Restart the development server</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                I've Added the API Key
              </>
            )}
          </button>

          <a
            href="https://v0.dev/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Get API Key from v0.dev
          </a>
        </div>

        {/* Additional Help */}
        <p className="text-xs text-gray-500 mt-6">
          Need help? Check the README.md file for detailed setup instructions.
        </p>
      </div>
    </div>
  )
}
