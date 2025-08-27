'use client'

import { forwardRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, CornerDownLeft } from 'lucide-react'

// Modern loading spinner component
const ModernSpinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 rounded-full border-2 border-gray-300 opacity-20"></div>
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"></div>
  </div>
)

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  user?: User | null
  autoFocus?: boolean
  className?: string
}

// Helper function to get user initials
const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const PromptInput = forwardRef<HTMLInputElement, PromptInputProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder = 'Type your message...',
      disabled = false,
      loading = false,
      user,
      autoFocus = false,
      className = '',
    },
    ref,
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSubmit(e as any)
      }
    }

    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <form onSubmit={onSubmit} className="relative">
          <div
            className="flex items-center bg-black rounded-full pl-4 pr-4 py-2"
            style={{
              boxShadow:
                '0 15px 20px -4px rgba(0, 0, 0, 0.4), 0 6px 8px -3px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Avatar */}
            <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
              {user?.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              )}
              <AvatarFallback className="bg-gray-600 text-white">
                {user ? (
                  getUserInitials(user.name)
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="absolute left-14 top-1/2 transform -translate-y-1/2 w-px h-12 bg-gray-800"></div>
            <div className="w-3 flex-shrink-0"></div>
            <input
              ref={ref}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
              disabled={disabled}
              autoFocus={autoFocus}
              onKeyDown={handleKeyDown}
            />

            <button
              type="submit"
              disabled={!value.trim() || disabled || loading}
              className="ml-3 flex-shrink-0 p-1 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <ModernSpinner className="h-4 w-4 text-white" />
              ) : (
                <CornerDownLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    )
  },
)

PromptInput.displayName = 'PromptInput'
