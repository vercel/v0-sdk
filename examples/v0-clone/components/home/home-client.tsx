'use client'

import { useChat } from '@ai-sdk/react'
import { V0Transport, type V0UIMessage } from '@v0-sdk/react'
import {
  useCreateChatFromFiles,
  useCreateChatFromRepo,
  useCreateChatFromZip,
} from '@v0-sdk/react/swr'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { PromptBox } from '@/components/prompt-box'
import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { ConversationView } from '@/components/chat/conversation-view'
import { SidebarToggleButton } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings } from '@/lib/hooks/useSettings'
import { FileIcon, PlusIcon } from '@/lib/icons'

export function HomeClient() {
  const router = useRouter()
  const { settings, updateSettings } = useSettings()
  const filesInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const stopRef = useRef<() => void>(() => undefined)
  const [actionError, setActionError] = useState<string | null>(null)
  const [repoDialogOpen, setRepoDialogOpen] = useState(false)
  const createFromFiles = useCreateChatFromFiles('/api/chats/import/files')
  const createFromZip = useCreateChatFromZip('/api/chats/import/zip')
  const createFromRepo = useCreateChatFromRepo('/api/chats/import/repo')
  const transport = useMemo(
    () =>
      new V0Transport({
        urls: {
          create: '/api/chats',
          send: (id) => `/api/chats/${encodeURIComponent(id)}/messages`,
          resume: (id) => `/api/chats/${encodeURIComponent(id)}/resume`,
        },
        onChatCreated: (chatId) => {
          stopRef.current()
          router.push(`/chats/${chatId}`)
          router.refresh()
        },
      }),
    [router],
  )
  const {
    clearError,
    error: chatError,
    messages,
    sendMessage,
    status,
    stop,
  } = useChat<V0UIMessage>({ transport })
  const chatIsCreating = status === 'submitted' || status === 'streaming'
  const isImporting =
    createFromFiles.isMutating || createFromZip.isMutating || createFromRepo.isMutating
  const isCreating = chatIsCreating || isImporting
  const error = actionError ?? chatError?.message

  useEffect(() => {
    stopRef.current = stop
  }, [stop])

  const createFromPrompt = async (message: string) => {
    setActionError(null)
    clearError()

    await sendMessage(
      { text: message },
      {
        body: {
          modelConfiguration: {
            modelId: settings.model,
            imageGenerations: false,
          },
        },
      },
    )
  }

  const createImportedChat = async (create: () => Promise<{ chat: { id: string } }>) => {
    setActionError(null)
    clearError()

    try {
      const result = await create()
      router.push(`/chats/${result.chat.id}`)
      router.refresh()
      return true
    } catch (error) {
      setActionError(errorMessage(error))
      return false
    }
  }

  const importFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (selectedFiles.length === 0) return

    await createImportedChat(async () =>
      createFromFiles.trigger({
        files: await Promise.all(
          selectedFiles.map(async (file) => ({
            name: file.webkitRelativePath || file.name,
            content: await file.text(),
          })),
        ),
        privacy: 'private',
      }),
    )
  }

  const importZip = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    await createImportedChat(async () =>
      createFromZip.trigger({
        privacy: 'private',
        url: await readFileAsDataUrl(file),
      }),
    )
  }

  const importRepo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const url = String(formData.get('url') ?? '').trim()
    const branch = String(formData.get('branch') ?? '').trim()
    if (!url) return

    const created = await createImportedChat(() =>
      createFromRepo.trigger({
        privacy: 'private',
        repo: {
          url,
          branch: branch || undefined,
        },
      }),
    )
    if (created) setRepoDialogOpen(false)
  }

  const prompt = (
    <>
      <PromptBox
        attachmentMenu={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <PromptInputButton aria-label="Import existing code" disabled={isCreating}>
                <PlusIcon className="size-4" />
              </PromptInputButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => filesInputRef.current?.click()}>
                <FileIcon className="size-4" />
                Import files
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => zipInputRef.current?.click()}>
                <FileIcon className="size-4" />
                Import ZIP
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRepoDialogOpen(true)}>
                <FileIcon className="size-4" />
                Import GitHub repository
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        autoFocus
        isSubmitting={isCreating}
        model={settings.model}
        onModelChange={(model) => updateSettings({ model })}
        onSubmit={createFromPrompt}
        placeholder="Describe what you want to build..."
      />
      {error ? <p className="mt-2 px-1 text-sm text-destructive">{error}</p> : null}
    </>
  )

  return (
    <>
      <div className="flex h-full flex-col px-4">
        <SidebarToggleButton className="mt-2 self-start" />
        <input className="hidden" multiple onChange={importFiles} ref={filesInputRef} type="file" />
        <input
          accept=".zip,application/zip"
          className="hidden"
          onChange={importZip}
          ref={zipInputRef}
          type="file"
        />
        {messages.length > 0 ? (
          <>
            <ConversationView isStreaming={chatIsCreating} messages={messages} />
            <div className="mx-auto w-full max-w-2xl shrink-0 pb-4">{prompt}</div>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="w-full max-w-2xl -translate-y-[8%]">
              <h1 className="mb-8 text-center text-4xl font-semibold tracking-tight text-foreground">
                What do you want to create?
              </h1>
              {prompt}
            </div>
          </div>
        )}
      </div>

      <Dialog onOpenChange={setRepoDialogOpen} open={repoDialogOpen}>
        <DialogContent>
          <form className="grid gap-4" onSubmit={importRepo}>
            <DialogHeader>
              <DialogTitle>Import GitHub repository</DialogTitle>
              <DialogDescription>
                Start a new chat from a public repository or a private repository connected through
                Vercel.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                autoFocus
                disabled={isCreating}
                id="repo-url"
                name="url"
                placeholder="https://github.com/vercel/next.js"
                required
                type="url"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repo-branch">Branch</Label>
              <Input
                disabled={isCreating}
                id="repo-branch"
                name="branch"
                placeholder="Default branch"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={isCreating} type="submit">
                {isCreating ? 'Importing…' : 'Import repository'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to create chat.'
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
