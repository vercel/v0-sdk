import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { APIEndpoint } from './openapi-parser'

// API Key stored in localStorage
export const apiKeyAtom = atomWithStorage<string>('v0_api_key', '')

// User state
export const userAtom = atom<any>(null)

// Selected endpoint
export const selectedEndpointAtom = atom<APIEndpoint | undefined>(undefined)

// Response state
export const responseAtom = atom<
  | {
      data?: any
      error?: any
      status?: number
      statusText?: string
      headers?: Record<string, string>
    }
  | undefined
>(undefined)

// Loading state
export const isLoadingAtom = atom<boolean>(false)

// Sidebar expanded categories stored in localStorage
export const expandedCategoriesAtom = atomWithStorage<string[]>(
  'sidebar_expanded_categories',
  [],
)

// Derived atom to check if API key exists
export const hasApiKeyAtom = atom((get) => {
  const apiKey = get(apiKeyAtom)
  return !!apiKey
})
