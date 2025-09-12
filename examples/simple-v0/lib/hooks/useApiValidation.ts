'use client'

import { useState, useEffect } from 'react'

interface ApiValidationResult {
  isValidating: boolean
  isValid: boolean | null
  showApiKeyError: boolean
  user: any | null
}

export function useApiValidation(): ApiValidationResult {
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [showApiKeyError, setShowApiKeyError] = useState(false)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    const validateApiKey = async () => {
      try {
        setIsValidating(true)

        const response = await fetch('/api/validate', {
          method: 'GET',
          cache: 'no-store', // Always check fresh, don't cache API key validation
        })

        if (response.ok) {
          const data = await response.json()
          if (data.valid) {
            setIsValid(true)
            setShowApiKeyError(false)
            setUser(data.user || null)
          } else {
            setIsValid(false)
            setShowApiKeyError(true)
          }
        } else if (response.status === 401) {
          // API key is missing or invalid
          setIsValid(false)
          setShowApiKeyError(true)
        } else {
          // Other errors (network, server issues, etc.)
          // Don't show API key error for these, just mark as invalid
          setIsValid(false)
          setShowApiKeyError(false)
        }
      } catch (error) {
        // Network or other errors - don't show API key error
        setIsValid(false)
        setShowApiKeyError(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateApiKey()
  }, [])

  return {
    isValidating,
    isValid,
    showApiKeyError,
    user,
  }
}
