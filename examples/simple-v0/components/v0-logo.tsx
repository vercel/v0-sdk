import React from 'react'
import { cn } from '@/lib/utils'

interface V0LogoProps {
  className?: string
  size?: number
}

export const V0Logo: React.FC<V0LogoProps> = ({ className, size = 24 }) => {
  return (
    <svg
      className={cn('', className)}
      width={size}
      height={(size * 339) / 678} // Maintain aspect ratio
      viewBox="0 0 678 339"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0)">
        <path
          d="M396.5,0h161.5c65.5,0,118.6,53.1,118.6,118.6v154h-66.3V118.6c0-1.6,0-3.1-.2-4.7l-161.5,158.7c.5,0,1.1,0,1.6,0h160v62.6h-160c-65.5,0-120-53.6-120-119.1V62.5h66.3v153.6c0,3,.2,5.9.7,8.7l165-162.2c-1.4-.1-2.8-.2-4.2-.2h-161.5V0Z"
          fill="currentColor"
        />
        <path
          d="M233.4,323.7L0,62.5h93.9l137,153.3V62.5h70v235.4c0,35.5-43.9,52.3-67.5,25.8Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="678" height="339" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default V0Logo
