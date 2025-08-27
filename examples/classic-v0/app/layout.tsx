import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Provider } from 'jotai'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Classic v0 - AI-Powered UI Generation',
  description:
    'A classic v0 interface clone built with v0-sdk for generating UI components with AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
