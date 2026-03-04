'use client'

import { Agentation } from 'agentation'
import { Leva } from 'leva'

export function DevTools() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      <Leva collapsed={false} />
      <Agentation />
    </>
  )
}
