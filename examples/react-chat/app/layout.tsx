import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './styles.css'

export const metadata: Metadata = {
  title: 'v0 + AI SDK chat',
  description: 'A minimal useChat integration for the v0 SDK',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
