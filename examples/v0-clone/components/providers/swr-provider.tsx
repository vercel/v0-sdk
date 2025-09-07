'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

interface FetchError extends Error {
  info?: any
  status?: number
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) =>
          fetch(url).then((res) => {
            if (!res.ok) {
              const error = new Error(
                'An error occurred while fetching the data.',
              ) as FetchError
              error.info = res.json()
              error.status = res.status
              throw error
            }
            return res.json()
          }),
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
