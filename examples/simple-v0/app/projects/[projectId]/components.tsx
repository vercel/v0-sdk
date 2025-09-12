'use client'

import { useRouter } from 'next/navigation'

interface NewChatButtonProps {
  projectId: string
  showText?: string
}

export function NewChatButton({
  projectId,
  showText = 'New Chat',
}: NewChatButtonProps) {
  const router = useRouter()

  const handleNewChat = () => {
    router.push(`/chats/new?projectId=${projectId}`)
  }

  const isLargeButton = showText === 'Create Chat'

  return (
    <button
      onClick={handleNewChat}
      className={`bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
        isLargeButton ? 'px-6 py-3 mx-auto' : 'px-4 py-2'
      }`}
    >
      <svg
        className={isLargeButton ? 'w-5 h-5' : 'w-4 h-4'}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span>{showText}</span>
    </button>
  )
}
