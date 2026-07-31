import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from 'next-themes'
import { ApiKeyDialog } from '@/components/layout/api-key-dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/app-shell'
import { PreviewProxyProvider } from '@/components/preview/preview-proxy-provider'
import { getPreviewProxyOrigin } from '@/lib/preview-proxy'
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
  const sidebarChats = await getSidebarChats()
  const previewProxyOrigin = getPreviewProxyOrigin()

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
          <PreviewProxyProvider origin={previewProxyOrigin}>
            <TooltipProvider delayDuration={300}>
              <AppShell
                apiKeyDialog={
                  <Suspense fallback={null}>
                    <SidebarApiKeyDialog />
                  </Suspense>
                }
                sidebarChats={sidebarChats}
              >
                {children}
              </AppShell>
            </TooltipProvider>
          </PreviewProxyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

async function SidebarApiKeyDialog() {
  const apiKeyStatus = await getV0ApiKeyStatus()

  return <ApiKeyDialog {...apiKeyStatus} />
}
