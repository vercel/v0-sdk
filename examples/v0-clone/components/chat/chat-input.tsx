import {
  PromptInput,
  PromptInputImageButton,
  PromptInputImagePreview,
  PromptInputMicButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  createImageAttachment,
  createImageAttachmentFromStored,
  savePromptToStorage,
  loadPromptFromStorage,
  clearPromptFromStorage,
  type ImageAttachment,
} from '@/components/ai-elements/prompt-input'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { useState, useCallback, useEffect } from 'react'

interface ChatInputProps {
  message: string
  setMessage: (message: string) => void
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    attachments?: Array<{ url: string }>,
  ) => void
  isLoading: boolean
  showSuggestions: boolean
  attachments?: ImageAttachment[]
  onAttachmentsChange?: (attachments: ImageAttachment[]) => void
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}

export function ChatInput({
  message,
  setMessage,
  onSubmit,
  isLoading,
  showSuggestions,
  attachments = [],
  onAttachmentsChange,
  textareaRef,
}: ChatInputProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const hasMessage = message.trim().length > 0

  const handleImageFiles = useCallback(
    async (files: File[]) => {
      if (!onAttachmentsChange) return

      try {
        const newAttachments = await Promise.all(
          files.map((file) => createImageAttachment(file)),
        )
        onAttachmentsChange([...attachments, ...newAttachments])
      } catch (error) {
        console.error('Error processing image files:', error)
      }
    },
    [attachments, onAttachmentsChange],
  )

  const handleRemoveAttachment = useCallback(
    (id: string) => {
      if (!onAttachmentsChange) return
      onAttachmentsChange(attachments.filter((att) => att.id !== id))
    },
    [attachments, onAttachmentsChange],
  )

  const handleDragOver = useCallback(() => {
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(() => {
    setIsDragOver(false)
  }, [])

  // Save to sessionStorage when message or attachments change
  useEffect(() => {
    if (message.trim() || attachments.length > 0) {
      savePromptToStorage(message, attachments)
    } else {
      // Clear sessionStorage if both message and attachments are empty
      clearPromptFromStorage()
    }
  }, [message, attachments])

  // Restore from sessionStorage on mount (only if no existing data)
  useEffect(() => {
    if (!message && attachments.length === 0) {
      const storedData = loadPromptFromStorage()
      if (storedData) {
        setMessage(storedData.message)
        if (storedData.attachments.length > 0 && onAttachmentsChange) {
          const restoredAttachments = storedData.attachments.map(
            createImageAttachmentFromStored,
          )
          onAttachmentsChange(restoredAttachments)
        }
      }
    }
  }, [message, attachments, setMessage, onAttachmentsChange])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      // Clear sessionStorage immediately upon submission
      clearPromptFromStorage()

      const attachmentUrls = attachments.map((att) => ({ url: att.dataUrl }))
      onSubmit(e, attachmentUrls.length > 0 ? attachmentUrls : undefined)
    },
    [onSubmit, attachments],
  )

  const toolButtonClassName =
    '!rounded-[99999px] !border-0 !bg-transparent p-0 shadow-none hover:!bg-transparent disabled:opacity-100 [&>svg]:hidden'
  const toolbarButtonSystemClassName =
    '[&_button]:h-[35px] [&_button]:min-h-0 [&_button]:rounded-[99999px] [&_button:first-child]:rounded-[99999px]'
  const toolbarToolsClassName = `gap-1 ${toolbarButtonSystemClassName}`

  return (
    <div className="px-4 pb-4">
      <div className="flex w-full items-start justify-center py-6">
        <PromptInput
          onSubmit={handleSubmit}
          className="relative w-full !divide-y-0 !rounded-[24px] !border-[5px] !border-[#E9E9E9] !bg-[#F4F4F4] !px-4 !pt-4 !pb-3 !shadow-none"
          onImageDrop={handleImageFiles}
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <PromptInputImagePreview
            attachments={attachments}
            onRemove={handleRemoveAttachment}
          />
          <PromptInputTextarea
            ref={textareaRef}
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="min-h-[58px] !p-0 text-[18px] leading-[28px] placeholder:text-[#B0B0B0]"
            placeholder="Message..."
            disabled={isLoading}
          />
          <PromptInputToolbar className="mt-[10px] w-full items-start p-0">
            <PromptInputTools
              className={`w-[134px] ${toolbarToolsClassName} [&_button]:w-[49px] [&_button]:min-w-0`}
            >
              <PromptInputImageButton
                className={toolButtonClassName}
                disabled={isLoading}
                onImageSelect={handleImageFiles}
                style={{
                  backgroundImage:
                    "url('/icons/prompt-input-image-button.svg')",
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 100%',
                }}
              />
              <PromptInputMicButton
                className={toolButtonClassName}
                disabled={isLoading}
                onTranscript={(transcript) => {
                  setMessage(message + (message ? ' ' : '') + transcript)
                }}
                onError={(error) => {
                  console.error('Speech recognition error:', error)
                }}
                style={{
                  backgroundImage:
                    "url('/icons/prompt-input-mic-button.svg')",
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 100%',
                }}
              />
            </PromptInputTools>
            <PromptInputTools
              className={`w-[49px] ${toolbarToolsClassName} [&_button]:w-[49px] [&_button]:min-w-0`}
            >
              <PromptInputSubmit
                className={`!border-[4px] !border-[#E9E9E9] !text-white !shadow-none transition-colors disabled:!opacity-100 ${
                  hasMessage
                    ? '!bg-[#9B9B9B] hover:!bg-[#9B9B9B]'
                    : '!bg-[#BEBEBE] hover:!bg-[#BEBEBE]'
                }`}
                disabled={!hasMessage || isLoading}
                status={isLoading ? 'streaming' : 'ready'}
                size="icon"
                variant="ghost"
              />
            </PromptInputTools>
          </PromptInputToolbar>
        </PromptInput>
      </div>
      {showSuggestions && (
        <div className="max-w-2xl mx-auto mt-2">
          <Suggestions>
            <Suggestion
              onClick={() => {
                setMessage('Landing page')
                // Submit after setting message
                setTimeout(() => {
                  const form = textareaRef?.current?.form
                  if (form) {
                    form.requestSubmit()
                  }
                }, 0)
              }}
              suggestion="Landing page"
            />
            <Suggestion
              onClick={() => {
                setMessage('Todo app')
                // Submit after setting message
                setTimeout(() => {
                  const form = textareaRef?.current?.form
                  if (form) {
                    form.requestSubmit()
                  }
                }, 0)
              }}
              suggestion="Todo app"
            />
            <Suggestion
              onClick={() => {
                setMessage('Dashboard')
                // Submit after setting message
                setTimeout(() => {
                  const form = textareaRef?.current?.form
                  if (form) {
                    form.requestSubmit()
                  }
                }, 0)
              }}
              suggestion="Dashboard"
            />
            <Suggestion
              onClick={() => {
                setMessage('Blog')
                // Submit after setting message
                setTimeout(() => {
                  const form = textareaRef?.current?.form
                  if (form) {
                    form.requestSubmit()
                  }
                }, 0)
              }}
              suggestion="Blog"
            />
            <Suggestion
              onClick={() => {
                setMessage('E-commerce')
                // Submit after setting message
                setTimeout(() => {
                  const form = textareaRef?.current?.form
                  if (form) {
                    form.requestSubmit()
                  }
                }, 0)
              }}
              suggestion="E-commerce"
            />
            <Suggestion
              onClick={() => {
                setMessage('Portfolio')
                // Submit after setting message
                setTimeout(() => {
                  const form = textareaRef?.current?.form
                  if (form) {
                    form.requestSubmit()
                  }
                }, 0)
              }}
              suggestion="Portfolio"
            />
            <Suggestion
              onClick={() => {
                setMessage('Chat app')
                // Submit after setting message
                setTimeout(() => {
                  const form = textareaRef?.current?.form
                  if (form) {
                    form.requestSubmit()
                  }
                }, 0)
              }}
              suggestion="Chat app"
            />
            <Suggestion
              onClick={() => {
                setMessage('Calculator')
                // Submit after setting message
                setTimeout(() => {
                  const form = textareaRef?.current?.form
                  if (form) {
                    form.requestSubmit()
                  }
                }, 0)
              }}
              suggestion="Calculator"
            />
          </Suggestions>
        </div>
      )}
    </div>
  )
}
