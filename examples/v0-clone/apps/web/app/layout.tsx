import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/app-shell'
import { getSidebarChats } from '@/lib/sidebar-chats'
import { getV0ApiKeyStatus } from '@/lib/v0-client'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'v0 clone',
  description: 'A v0.app clone built with AI Elements and Geist.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarChats, apiKeyStatus] = await Promise.all([getSidebarChats(), getV0ApiKeyStatus()])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <TooltipProvider delayDuration={300}>
            <AppShell apiKeyStatus={apiKeyStatus} sidebarChats={sidebarChats}>
              {children}
            </AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
