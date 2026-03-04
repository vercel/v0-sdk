import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type LoaderIconProps = {
  size?: number
}

const LoaderIcon = ({ size = 16 }: LoaderIconProps) => (
  <img
    alt="Loading"
    height={size}
    src="/busyroundywheeeee.webp"
    style={{ display: 'block' }}
    width={size}
  />
)

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: number
}

export const Loader = ({ className, size = 16, ...props }: LoaderProps) => (
  <div
    className={cn('inline-flex items-center justify-center', className)}
    {...props}
  >
    <LoaderIcon size={size} />
  </div>
)
