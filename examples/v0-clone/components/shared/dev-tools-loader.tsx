'use client'

import dynamic from 'next/dynamic'

const DevTools = dynamic(
  () =>
    import('@/components/shared/dev-tools').then((module) => module.DevTools),
  { ssr: false },
)

export function DevToolsLoader() {
  return <DevTools />
}
