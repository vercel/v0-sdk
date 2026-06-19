'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  title?: string
  updatedAt?: string
}

interface ChatDropdownProps {
  currentChatId: string
  chats: Chat[]
  onChatChange?: (chatId: string) => void
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

export function ChatDropdown({ currentChatId, chats, onChatChange }: ChatDropdownProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const prevChatsLengthRef = useRef(chats.length)
  const isMobile = useIsMobile()

  const currentChat = chats.find((chat) => chat.id === currentChatId)

  useEffect(() => {
    if (prevChatsLengthRef.current !== chats.length && open) {
      setOpen(true)
    }
    prevChatsLengthRef.current = chats.length
  }, [chats, open])

  const handleChatSelect = async (chatId: string) => {
    setOpen(false)

    if (chatId === 'new-from-scratch') {
      onChatChange?.('new')
      return
    }

    if (chatId === 'new-from-latest') {
      await handleForkLatestChat()
      return
    }

    if (chatId !== currentChatId) {
      router.push(`/chats/${chatId}`)
    }

    onChatChange?.(chatId)
  }

  const handleForkLatestChat = async () => {
    const latestChat = [...chats].sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
    )[0]

    if (!latestChat) return

    try {
      const response = await fetch('/api/chats/fork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: latestChat.id,
        }),
      })

      if (response.ok) {
        const forkedChat = await response.json()
        router.push(`/chats/${forkedChat.id}`)
      }
    } catch (error) {
      // Silently handle fork errors
    }
  }

  const getChatTitle = (chat: Chat) => {
    return chat.title || 'Untitled Chat'
  }

  const triggerButton = (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1 justify-start max-w-[160px]"
      role="combobox"
      aria-expanded={open}
    >
      <span className="text-sm text-gray-900 dark:text-white truncate">
        {currentChat ? getChatTitle(currentChat) : 'New Chat'}
      </span>
      <ChevronDownIcon className="h-4 w-4 text-gray-600 dark:text-white flex-shrink-0" />
    </Button>
  )

  const commandContent = (
    <Command>
      <CommandInput placeholder="Search chats..." />
      <CommandList className="max-h-[200px]">
        <CommandEmpty>No chats found.</CommandEmpty>
        <CommandGroup>
          <CommandItem
            value="new-from-scratch"
            onSelect={() => handleChatSelect('new-from-scratch')}
            className={cn('justify-between', currentChatId === 'new' && 'bg-accent')}
          >
            <span>+ New Chat</span>
            {currentChatId === 'new' && <CheckIcon className="h-4 w-4" />}
          </CommandItem>
          {chats.length > 0 && (
            <CommandItem
              value="new-from-latest"
              onSelect={() => handleChatSelect('new-from-latest')}
              className="justify-between"
            >
              <span>+ Fork Latest</span>
            </CommandItem>
          )}
          {chats.length > 0 && <CommandSeparator />}
          {chats.map((chat) => (
            <CommandItem
              key={chat.id}
              value={getChatTitle(chat)}
              onSelect={() => handleChatSelect(chat.id)}
              className={cn('justify-between', chat.id === currentChatId && 'bg-accent')}
            >
              <span>{getChatTitle(chat)}</span>
              {chat.id === currentChatId && <CheckIcon className="h-4 w-4" />}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select Chat</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">{commandContent}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        {commandContent}
      </PopoverContent>
    </Popover>
  )
}
