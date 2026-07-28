'use client'

import type { Files } from '@v0-sdk/react'
import { useFiles, useMessages, useUpdateChatFiles } from '@v0-sdk/react/swr'
import { use, useState } from 'react'
import { Loader } from '@/components/ai-elements/loader'
import { Button } from '@/components/ui/button'
import { FileIcon, SpinnerIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'

type ChatFile = Files['files'][number]
export type ChatFilesResult = { files: Files['files'] } | { error: string }

export function CodeEditorLoading() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader size={16} /> Loading files…
    </div>
  )
}

export function CodeEditorPane({
  chatId,
  filesPromise,
  isPreviewReady,
}: {
  chatId: string
  filesPromise: Promise<ChatFilesResult>
  isPreviewReady: boolean
}) {
  const result = use(filesPromise)

  if ('error' in result) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-destructive">
        {result.error}
      </div>
    )
  }

  return <CodeEditor chatId={chatId} files={result.files} isPreviewReady={isPreviewReady} />
}

function CodeEditor({
  chatId,
  files: initialFiles,
  isPreviewReady,
}: {
  chatId: string
  files: ChatFile[]
  isPreviewReady: boolean
}) {
  const filesUrl = `/api/chats/${encodeURIComponent(chatId)}/files`
  const messagesUrl = `/api/chats/${encodeURIComponent(chatId)}/messages`
  const filesQuery = useFiles(filesUrl, {
    fallbackData: { files: initialFiles },
    revalidateOnMount: false,
  })
  const messagesQuery = useMessages(messagesUrl, { limit: 100 }, { revalidateOnMount: false })
  const updateFiles = useUpdateChatFiles(filesUrl)
  const cachedFiles = filesQuery.data?.files ?? initialFiles
  const [files, setFiles] = useState(cachedFiles)
  const [savedFiles, setSavedFiles] = useState(cachedFiles)
  const [selectedPath, setSelectedPath] = useState(
    cachedFiles.find((file) => file.encoding === 'utf8')?.path ?? cachedFiles[0]?.path ?? null,
  )
  const [status, setStatus] = useState<string | null>(null)
  const isSaving = updateFiles.isMutating
  const selectedFile = files.find((file) => file.path === selectedPath)
  const changedFiles = files.filter((file) => {
    if (file.encoding !== 'utf8') return false
    return savedFiles.find((saved) => saved.path === file.path)?.content !== file.content
  })

  const updateSelectedFile = (content: string) => {
    setStatus(null)
    setFiles((current) =>
      current.map((file) => (file.path === selectedPath ? { ...file, content } : file)),
    )
  }

  const save = async () => {
    if (changedFiles.length === 0 || !isPreviewReady) return

    setStatus(null)

    try {
      await updateFiles.trigger({
        files: changedFiles.map(({ path, content }) => ({ path, content })),
      })
      const [filesResult, messagesResult] = await Promise.all([
        filesQuery.mutate(),
        messagesQuery.mutate(),
      ])

      if (!filesResult || !messagesResult) {
        setStatus('Files saved, but failed to refresh.')
        return
      }

      setFiles(filesResult.files)
      setSavedFiles(filesResult.files)
      setSelectedPath((current) =>
        filesResult.files.some((file) => file.path === current)
          ? current
          : (filesResult.files.find((file) => file.encoding === 'utf8')?.path ??
            filesResult.files[0]?.path ??
            null),
      )
      setStatus('Saved')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save files.')
    }
  }

  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No files yet.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 bg-background">
      <aside className="w-52 shrink-0 overflow-y-auto border-r border-border p-2">
        {files.map((file) => (
          <button
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground',
              file.path === selectedPath && 'bg-accent text-foreground',
            )}
            key={file.path}
            onClick={() => setSelectedPath(file.path)}
            title={file.path}
            type="button"
          >
            <FileIcon className="size-3.5 shrink-0" />
            <span className="truncate">{file.path}</span>
          </button>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border px-3">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {selectedFile?.path}
          </span>
          {status ? (
            <span
              className={cn(
                'text-xs',
                status === 'Saved' ? 'text-muted-foreground' : 'text-destructive',
              )}
            >
              {status}
            </span>
          ) : null}
          <Button
            disabled={changedFiles.length === 0 || isSaving || !isPreviewReady}
            onClick={save}
            size="xs"
            title={isPreviewReady ? undefined : 'Preview is still loading'}
          >
            {isSaving ? <SpinnerIcon className="size-3 animate-spin" /> : null}
            {isSaving ? 'Saving' : 'Save'}
          </Button>
        </div>

        {selectedFile?.encoding === 'utf8' ? (
          <textarea
            aria-label={`Edit ${selectedFile.path}`}
            className="min-h-0 flex-1 resize-none bg-background p-4 font-mono text-xs leading-5 text-foreground outline-none"
            disabled={isSaving}
            onChange={(event) => updateSelectedFile(event.target.value)}
            spellCheck={false}
            value={selectedFile.content}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Binary files cannot be edited.
          </div>
        )}
      </div>
    </div>
  )
}
