'use client'

import { use, useState } from 'react'
import type { Files, Message } from 'v0'
import { Loader } from '@/components/ai-elements/loader'
import { Button } from '@/components/ui/button'
import { FileIcon, SpinnerIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'

type ChatFile = Files['files'][number]
type FileUpdate = { path: string; content: string | null }

export type ChatFilesResult = { files: Files['files'] } | { error: string }

export type UpdateFilesAction = (
  files: FileUpdate[],
) => Promise<{ success: true; files: Files['files']; messages: Message[] } | { error: string }>

export function CodeEditorLoading() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader size={16} /> Loading files…
    </div>
  )
}

export function CodeEditorPane({
  files,
  filesPromise,
  isPreviewReady,
  onMessagesChange,
  updateFilesAction,
}: {
  files?: Files['files']
  filesPromise: Promise<ChatFilesResult>
  isPreviewReady: boolean
  onMessagesChange: (messages: Message[]) => void
  updateFilesAction: UpdateFilesAction
}) {
  const initialResult = use(filesPromise)
  const result = files ? { files } : initialResult

  if ('error' in result) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-destructive">
        {result.error}
      </div>
    )
  }

  return (
    <CodeEditor
      files={result.files}
      isPreviewReady={isPreviewReady}
      onMessagesChange={onMessagesChange}
      updateFilesAction={updateFilesAction}
    />
  )
}

function CodeEditor({
  files: initialFiles,
  isPreviewReady,
  onMessagesChange,
  updateFilesAction,
}: {
  files: ChatFile[]
  isPreviewReady: boolean
  onMessagesChange: (messages: Message[]) => void
  updateFilesAction: UpdateFilesAction
}) {
  const [files, setFiles] = useState(initialFiles)
  const [savedFiles, setSavedFiles] = useState(initialFiles)
  const [selectedPath, setSelectedPath] = useState(
    initialFiles.find((file) => file.encoding === 'utf8')?.path ?? initialFiles[0]?.path ?? null,
  )
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
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
    setIsSaving(true)

    try {
      const result = await updateFilesAction(
        changedFiles.map(({ path, content }) => ({ path, content })),
      )

      if ('error' in result) {
        setStatus(result.error)
        return
      }

      if (!Array.isArray(result.files) || !Array.isArray(result.messages)) {
        setStatus('Files saved, but failed to refresh.')
        return
      }

      setFiles(result.files)
      setSavedFiles(result.files)
      setSelectedPath((current) =>
        result.files.some((file) => file.path === current)
          ? current
          : (result.files.find((file) => file.encoding === 'utf8')?.path ??
            result.files[0]?.path ??
            null),
      )
      onMessagesChange(result.messages)
      setStatus('Saved')
    } catch {
      setStatus('Failed to save files.')
    } finally {
      setIsSaving(false)
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
