'use client'

import { Agentation } from 'agentation'
import { Leva } from 'leva'

export function DevTools() {
  const devToolsEnabled =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true'

  if (!devToolsEnabled) {
    return null
  }

  return (
    <>
      <Leva collapsed />
      <Agentation />
    </>
  )
}
