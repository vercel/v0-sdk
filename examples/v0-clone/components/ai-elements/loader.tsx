import { cn } from '@/lib/utils'
import { useState, type HTMLAttributes } from 'react'

type LoaderIconProps = {
  size?: number
}

const LoaderIcon = ({ size = 16 }: LoaderIconProps) => {
  const [imageFailed, setImageFailed] = useState(false)

  if (imageFailed) {
    return (
      <span
        aria-hidden="true"
        className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <img
      alt="Loading"
      draggable={false}
      height={size}
      onError={() => setImageFailed(true)}
      src="/busyroundywheeeee.webp"
      style={{ display: 'block' }}
      width={size}
    />
  )
}

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
