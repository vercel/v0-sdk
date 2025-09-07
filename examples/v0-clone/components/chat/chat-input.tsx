import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'

interface ChatInputProps {
  message: string
  setMessage: (message: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  showSuggestions: boolean
}

export function ChatInput({
  message,
  setMessage,
  onSubmit,
  isLoading,
  showSuggestions,
}: ChatInputProps) {
  return (
    <div className="border-t border-border dark:border-input p-4">
      {showSuggestions && (
        <Suggestions>
          <Suggestion
            onClick={() => setMessage('How do I use PPR in Next.js?')}
            suggestion="How do I use PPR in Next.js?"
          />
          <Suggestion
            onClick={() =>
              setMessage('Create a responsive navbar with Tailwind CSS')
            }
            suggestion="Create a responsive navbar with Tailwind CSS"
          />
          <Suggestion
            onClick={() => setMessage('Build a todo app with React')}
            suggestion="Build a todo app with React"
          />
          <Suggestion
            onClick={() => setMessage('Make a landing page for a coffee shop')}
            suggestion="Make a landing page for a coffee shop"
          />
        </Suggestions>
      )}
      <div className="flex gap-2">
        <PromptInput
          onSubmit={onSubmit}
          className="mt-4 w-full max-w-2xl mx-auto relative"
        >
          <PromptInputTextarea
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="pr-12 min-h-[60px]"
            placeholder="Continue the conversation..."
          />
          <PromptInputSubmit
            className="absolute bottom-1 right-1"
            disabled={!message}
            status={isLoading ? 'streaming' : 'ready'}
          />
        </PromptInput>
      </div>
    </div>
  )
}
