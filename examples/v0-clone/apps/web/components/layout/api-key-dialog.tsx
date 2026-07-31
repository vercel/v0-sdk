// Demo only: remove browser-provided API key support before using this example in production.
'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePreviewProxyOrigin } from '@/components/preview/preview-proxy-provider'
import { configureApiKey, removeConfiguredApiKey } from '@/lib/api-key-client'
import { SettingsIcon, SpinnerIcon } from '@/lib/icons'

export function ApiKeyDialog({
  hasBrowserApiKey: initialHasBrowserApiKey,
  hasEnvironmentApiKey,
}: {
  hasBrowserApiKey: boolean
  hasEnvironmentApiKey: boolean
}) {
  const router = useRouter()
  const previewProxyOrigin = usePreviewProxyOrigin()
  const [open, setOpen] = useState(!initialHasBrowserApiKey && !hasEnvironmentApiKey)
  const [hasBrowserApiKey, setHasBrowserApiKey] = useState(initialHasBrowserApiKey)
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const isConfigured = hasBrowserApiKey || hasEnvironmentApiKey

  const saveApiKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = apiKey.trim()
    if (!value) return

    setError(null)
    setIsSaving(true)

    try {
      await configureApiKey({ apiKey: value, previewProxyOrigin })

      setApiKey('')
      setHasBrowserApiKey(true)
      setOpen(false)
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The v0 API key could not be saved.')
    } finally {
      setIsSaving(false)
    }
  }

  const removeApiKey = async () => {
    setError(null)
    setIsRemoving(true)

    try {
      await removeConfiguredApiKey(previewProxyOrigin)

      setHasBrowserApiKey(false)
      setOpen(false)
      window.location.assign('/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The saved API key could not be removed.')
      setIsRemoving(false)
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          type="button"
        >
          <SettingsIcon className="size-4" />
          <span className="flex-1 text-left">API key</span>
          <span
            aria-label={isConfigured ? 'Configured' : 'Required'}
            className={
              isConfigured
                ? 'size-1.5 rounded-full bg-green-500'
                : 'size-1.5 rounded-full bg-amber-500'
            }
          />
        </button>
      </DialogTrigger>
      <DialogContent>
        <form className="grid gap-4" onSubmit={saveApiKey}>
          <DialogHeader>
            <DialogTitle>v0 API key</DialogTitle>
            <DialogDescription>
              {hasEnvironmentApiKey
                ? 'This deployment uses V0_API_KEY. Remove that environment variable to use a browser-provided key.'
                : 'Saving stores the key on both app origins. The preview proxy adds itself as a trusted host.'}
            </DialogDescription>
          </DialogHeader>

          {!hasEnvironmentApiKey ? (
            <div className="grid gap-2">
              <Label htmlFor="v0-api-key">
                {hasBrowserApiKey ? 'Replace saved key' : 'API key'}
              </Label>
              <Input
                autoComplete="off"
                autoFocus
                disabled={isSaving || isRemoving}
                id="v0-api-key"
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="v1:..."
                spellCheck={false}
                type="password"
                value={apiKey}
              />
              <p className="text-xs text-muted-foreground">
                Create a key at{' '}
                <a
                  className="text-foreground underline underline-offset-2"
                  href="https://v0.app/chat/settings/keys"
                  rel="noreferrer"
                  target="_blank"
                >
                  v0.app/chat/settings/keys
                </a>
                .
              </p>
            </div>
          ) : null}

          {hasBrowserApiKey ? (
            <p className="text-sm text-muted-foreground">
              A browser-provided key is saved
              {hasEnvironmentApiKey ? ' but is not currently used' : ''}.
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {!hasEnvironmentApiKey || hasBrowserApiKey ? (
            <DialogFooter className="sm:justify-between">
              {hasBrowserApiKey ? (
                <Button
                  disabled={isSaving || isRemoving}
                  onClick={() => void removeApiKey()}
                  type="button"
                  variant="outline"
                >
                  {isRemoving ? <SpinnerIcon className="size-4 animate-spin" /> : null}
                  {isRemoving ? 'Removing…' : 'Remove saved key'}
                </Button>
              ) : (
                <span />
              )}
              {!hasEnvironmentApiKey ? (
                <Button disabled={!apiKey.trim() || isSaving || isRemoving} type="submit">
                  {isSaving ? <SpinnerIcon className="size-4 animate-spin" /> : null}
                  {isSaving ? 'Validating…' : hasBrowserApiKey ? 'Replace key' : 'Save key'}
                </Button>
              ) : null}
            </DialogFooter>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  )
}
