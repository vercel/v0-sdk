'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { Chat } from '../generated'
import { createChatId } from '../id'

// since chatId is async with crypto, we generate it on mount
// and we use it for the first message, ideally.
export function useNewChatId(chatId: Chat['id'] | undefined) {
  const [nextChatId, setNextChatId] = useState<string | undefined>(undefined)

  const nextChatIdPromiseRef = useRef<Promise<string> | undefined>(undefined)

  const generateNextChatId = useCallback(() => {
    if (!nextChatIdPromiseRef.current) {
      nextChatIdPromiseRef.current = createChatId()
        .then((id) => {
          setNextChatId(id)
          return id
        })
        .finally(() => {
          nextChatIdPromiseRef.current = undefined
        })
    }
    return nextChatIdPromiseRef.current
  }, [])

  useEffect(
    function generateNextChatId() {
      if (chatId || nextChatId) return

      generateNextChatId()
    },
    [chatId, nextChatId, generateNextChatId],
  )

  return { nextChatId, generateNextChatId }
}
