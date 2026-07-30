'use client'

import type { ReactNode } from 'react'
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { Loader } from '@/components/ai-elements/loader'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { AVAILABLE_MODELS, MODEL_LABELS, type ModelType } from '@/lib/hooks/useSettings'
import { PlusIcon, ArrowUpIcon, ChevronDownIcon, StopIcon, V0LogoIcon } from '@/lib/icons'

export function PromptBox({
  onSubmit,
  onStop,
  isSubmitting = false,
  isStopping = false,
  isStreaming = false,
  placeholder = 'Describe what you want to build...',
  model,
  onModelChange,
  autoFocus = false,
  compact = false,
  className,
  attachmentMenu,
}: {
  onSubmit?: (text: string) => void | Promise<void>
  onStop?: () => void | Promise<void>
  isSubmitting?: boolean
  isStopping?: boolean
  isStreaming?: boolean
  placeholder?: string
  model: ModelType
  onModelChange: (model: ModelType) => void
  autoFocus?: boolean
  compact?: boolean
  className?: string
  attachmentMenu?: ReactNode
}) {
  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim()
    if (!text || !onSubmit || isSubmitting) return
    return onSubmit(text)
  }

  return (
    <PromptInput
      className={cn('rounded-2xl border-border bg-card shadow-sm', className)}
      onSubmit={handleSubmit}
    >
      <PromptInputBody>
        <PromptInputTextarea
          autoFocus={autoFocus}
          className={cn(
            'min-h-[52px] bg-transparent px-4 pt-3.5 text-base',
            compact && 'min-h-[44px] px-3 pt-3 text-sm',
          )}
          disabled={isSubmitting}
          placeholder={placeholder}
        />
      </PromptInputBody>
      <PromptInputFooter className="px-2 pb-2">
        <PromptInputTools>
          {attachmentMenu ?? (
            <PromptInputButton aria-label="Add attachment" disabled>
              <PlusIcon className="size-4" />
            </PromptInputButton>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <PromptInputButton className="gap-1.5" disabled={isSubmitting}>
                <V0LogoIcon className="size-4" />
                <span>{MODEL_LABELS[model]}</span>
                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
              </PromptInputButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {AVAILABLE_MODELS.map((m) => (
                <DropdownMenuItem key={m} onClick={() => onModelChange(m)}>
                  <V0LogoIcon className="size-4" />
                  {MODEL_LABELS[m]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </PromptInputTools>

        <PromptInputTools>
          <PromptInputSubmit
            aria-label={isStreaming ? 'Stop generating' : 'Send message'}
            className="size-8 rounded-lg"
            disabled={isStreaming ? !onStop || isStopping : !onSubmit || isSubmitting}
            onClick={isStreaming ? () => onStop?.() : undefined}
            type={isStreaming ? 'button' : 'submit'}
          >
            {isStopping || (isSubmitting && !isStreaming) ? (
              <Loader size={16} />
            ) : isStreaming ? (
              <StopIcon className="size-4" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </PromptInputSubmit>
        </PromptInputTools>
      </PromptInputFooter>
    </PromptInput>
  )
}
