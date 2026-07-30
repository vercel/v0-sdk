'use client'

import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'
import { memo } from 'react'
import { Streamdown } from 'streamdown'

type ResponseProps = ComponentProps<typeof Streamdown>

export const Response = memo(({ className, ...props }: ResponseProps) => (
  <Streamdown
    className={cn(
      'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
      '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6',
      '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6',
      '[&_li]:pl-1 [&_li]:marker:text-muted-foreground/40',
      className,
    )}
    {...props}
  />
))

Response.displayName = 'Response'
