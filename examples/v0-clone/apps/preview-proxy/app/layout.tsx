import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'v0 Preview Proxy',
  description: 'Isolated preview proxy for the v0 clone example.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
