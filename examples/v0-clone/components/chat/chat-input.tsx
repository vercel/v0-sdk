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

  return (
    <div className="px-4 md:pb-4">
      <div className="flex gap-2">
        <PromptInput
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mx-auto relative"
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
            className="min-h-[60px]"
            placeholder="Continue the conversation..."
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputImageButton onImageSelect={handleImageFiles} />
            </PromptInputTools>
            <PromptInputTools>
              <PromptInputMicButton
                onTranscript={(transcript) => {
                  setMessage(message + (message ? ' ' : '') + transcript)
                }}
                onError={(error) => {
                  console.error('Speech recognition error:', error)
                }}
              />
              <PromptInputSubmit
                disabled={!message}
                status={isLoading ? 'streaming' : 'ready'}
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
