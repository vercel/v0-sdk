'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ChatStatus } from 'ai'
import {
  ArrowUpIcon,
  ImageIcon,
  Loader2Icon,
  MicIcon,
  MicOffIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import type {
  ComponentProps,
  HTMLAttributes,
  KeyboardEventHandler,
} from 'react'
import { Children, useCallback, useEffect, useRef, useState } from 'react'

// Utility function to convert file to data URL
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Utility function to create image attachment
export const createImageAttachment = async (
  file: File,
): Promise<ImageAttachment> => {
  const dataUrl = await fileToDataUrl(file)
  return {
    id: Math.random().toString(36).substr(2, 9),
    file,
    dataUrl,
    preview: dataUrl,
  }
}

// SessionStorage utilities for prompt persistence
const PROMPT_STORAGE_KEY = 'v0-prompt-data'

export interface StoredPromptData {
  message: string
  attachments: Array<{
    id: string
    fileName: string
    dataUrl: string
    preview: string
  }>
}

export const savePromptToStorage = (
  message: string,
  attachments: ImageAttachment[],
) => {
  try {
    const data: StoredPromptData = {
      message,
      attachments: attachments.map((att) => ({
        id: att.id,
        fileName: att.file.name,
        dataUrl: att.dataUrl,
        preview: att.preview,
      })),
    }
    sessionStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save prompt to sessionStorage:', error)
  }
}

export const loadPromptFromStorage = (): StoredPromptData | null => {
  try {
    const stored = sessionStorage.getItem(PROMPT_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Failed to load prompt from sessionStorage:', error)
  }
  return null
}

export const clearPromptFromStorage = () => {
  try {
    sessionStorage.removeItem(PROMPT_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear prompt from sessionStorage:', error)
  }
}

export const createImageAttachmentFromStored = (
  stored: StoredPromptData['attachments'][0],
): ImageAttachment => {
  // Create a mock File object from stored data
  const mockFile = new File([''], stored.fileName, { type: 'image/*' })
  return {
    id: stored.id,
    file: mockFile,
    dataUrl: stored.dataUrl,
    preview: stored.preview,
  }
}

export type PromptInputProps = HTMLAttributes<HTMLFormElement> & {
  onImageDrop?: (files: File[]) => void
  isDragOver?: boolean
}

export const PromptInput = ({
  className,
  onImageDrop,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  ...props
}: PromptInputProps) => {
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onDragOver?.(e)
    },
    [onDragOver],
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onDragLeave?.(e)
    },
    [onDragLeave],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/'),
      )

      if (files.length > 0) {
        onImageDrop?.(files)
      }

      onDrop?.(e)
    },
    [onImageDrop, onDrop],
  )

  return (
    <form
      className={cn(
        'w-full divide-y overflow-hidden rounded-xl border bg-background shadow-sm transition-colors',
        isDragOver && 'border-primary bg-primary/5',
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    />
  )
}

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number
  maxHeight?: number
}

export const PromptInputTextarea = ({
  onChange,
  className,
  placeholder = 'What would you like to know?',
  minHeight = 48,
  maxHeight = 164,
  ...props
}: PromptInputTextareaProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter') {
      // Don't submit if IME composition is in progress
      if (e.nativeEvent.isComposing) {
        return
      }

      if (e.shiftKey) {
        // Allow newline
        return
      }

      // Submit on Enter (without Shift)
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <Textarea
      className={cn(
        'w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0',
        'field-sizing-content max-h-[6lh] bg-transparent dark:bg-transparent',
        'focus-visible:ring-0',
        className,
      )}
      name="message"
      onChange={(e) => {
        onChange?.(e)
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  )
}

export type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>

export const PromptInputToolbar = ({
  className,
  ...props
}: PromptInputToolbarProps) => (
  <div
    className={cn('flex items-center justify-between p-1', className)}
    {...props}
  />
)

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div
    className={cn(
      'flex items-center gap-1',
      '[&_button:first-child]:rounded-bl-xl',
      className,
    )}
    {...props}
  />
)

export type PromptInputButtonProps = ComponentProps<typeof Button>

export const PromptInputButton = ({
  variant = 'ghost',
  className,
  size,
  ...props
}: PromptInputButtonProps) => {
  const newSize =
    (size ?? Children.count(props.children) > 1) ? 'default' : 'icon'

  return (
    <Button
      className={cn(
        'shrink-0 gap-1.5 rounded-lg',
        variant === 'ghost' && 'text-muted-foreground',
        newSize === 'default' && 'px-3',
        className,
      )}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  )
}

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus
}

export const PromptInputSubmit = ({
  className,
  variant = 'default',
  size = 'icon',
  status,
  children,
  ...props
}: PromptInputSubmitProps) => {
  let Icon = <ArrowUpIcon className="size-4" />

  if (status === 'submitted') {
    Icon = <Loader2Icon className="size-4 animate-spin" />
  } else if (status === 'streaming') {
    Icon = <SquareIcon className="size-4" />
  } else if (status === 'error') {
    Icon = <XIcon className="size-4" />
  }

  return (
    <Button
      className={cn('gap-1.5 rounded-lg', className)}
      size={size}
      type="submit"
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </Button>
  )
}

export type PromptInputModelSelectProps = ComponentProps<typeof Select>

export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => (
  <Select {...props} />
)

export type PromptInputModelSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>

export const PromptInputModelSelectTrigger = ({
  className,
  ...props
}: PromptInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      'border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors',
      'hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
      className,
    )}
    {...props}
  />
)

export type PromptInputModelSelectContentProps = ComponentProps<
  typeof SelectContent
>

export const PromptInputModelSelectContent = ({
  className,
  ...props
}: PromptInputModelSelectContentProps) => (
  <SelectContent className={cn(className)} {...props} />
)

export type PromptInputModelSelectItemProps = ComponentProps<typeof SelectItem>

export const PromptInputModelSelectItem = ({
  className,
  ...props
}: PromptInputModelSelectItemProps) => (
  <SelectItem className={cn(className)} {...props} />
)

export type PromptInputModelSelectValueProps = ComponentProps<
  typeof SelectValue
>

export const PromptInputModelSelectValue = ({
  className,
  ...props
}: PromptInputModelSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
)

export type PromptInputMicButtonProps = ComponentProps<typeof Button> & {
  onTranscript?: (transcript: string) => void
  onError?: (error: string) => void
}

export const PromptInputMicButton = ({
  className,
  onTranscript,
  onError,
  ...props
}: PromptInputMicButtonProps) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isCleaningUpRef = useRef(false)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        if (!isCleaningUpRef.current) {
          setIsListening(true)
        }
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!isCleaningUpRef.current) {
          const transcript = event.results[0][0].transcript
          onTranscript?.(transcript)
          setIsListening(false)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Don't report "aborted" errors as they're usually from cleanup or natural timeout
        if (event.error !== 'aborted' && !isCleaningUpRef.current) {
          console.error('Speech recognition error:', event.error)
          onError?.(event.error)
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        if (!isCleaningUpRef.current) {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      isCleaningUpRef.current = true
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    }
  }, [onTranscript, onError])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || isCleaningUpRef.current) return

    if (isListening) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.warn('Error stopping speech recognition:', error)
        setIsListening(false)
      }
    } else {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        onError?.('Failed to start speech recognition')
      }
    }
  }, [isListening, onError])

  if (!isSupported) {
    return null
  }

  return (
    <PromptInputButton
      className={cn(
        'transition-colors',
        isListening &&
          'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
        className,
      )}
      onClick={toggleListening}
      {...props}
    >
      {isListening ? (
        <MicOffIcon className="size-4 text-red-600 dark:text-red-400" />
      ) : (
        <MicIcon className="size-4" />
      )}
    </PromptInputButton>
  )
}

export type PromptInputImageButtonProps = ComponentProps<typeof Button> & {
  onImageSelect?: (files: File[]) => void
}

export const PromptInputImageButton = ({
  className,
  onImageSelect,
  ...props
}: PromptInputImageButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith('image/'),
      )

      if (files.length > 0) {
        onImageSelect?.(files)
      }

      // Reset the input so the same file can be selected again
      if (e.target) {
        e.target.value = ''
      }
    },
    [onImageSelect],
  )

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <PromptInputButton
        className={cn(className)}
        onClick={handleClick}
        {...props}
      >
        <ImageIcon className="size-4" />
      </PromptInputButton>
    </>
  )
}

export type ImageAttachment = {
  id: string
  file: File
  dataUrl: string
  preview: string
}

export type PromptInputImagePreviewProps = {
  attachments: ImageAttachment[]
  onRemove?: (id: string) => void
  className?: string
}

export const PromptInputImagePreview = ({
  attachments,
  onRemove,
  className,
}: PromptInputImagePreviewProps) => {
  if (attachments.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2 p-2', className)}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative group rounded-lg overflow-hidden border bg-muted"
        >
          <img
            src={attachment.preview}
            alt={attachment.file.name}
            className="w-16 h-16 object-cover"
          />
          {onRemove && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <XIcon className="size-3" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
            {attachment.file.name}
          </div>
        </div>
      ))}
    </div>
  )
}
