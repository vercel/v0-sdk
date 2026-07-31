'use client'

import { createContext, useContext, type ReactNode } from 'react'

const PreviewProxyContext = createContext<string | null>(null)

export function PreviewProxyProvider({
  children,
  origin,
}: {
  children: ReactNode
  origin: string
}) {
  return <PreviewProxyContext value={origin}>{children}</PreviewProxyContext>
}

export function usePreviewProxyOrigin() {
  const origin = useContext(PreviewProxyContext)

  if (!origin) throw new Error('PreviewProxyProvider is missing.')

  return origin
}
