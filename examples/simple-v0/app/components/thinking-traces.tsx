import type { GenerationActivity } from '@/lib/generation-stream'

interface ThinkingTracesProps {
  activities: GenerationActivity[]
  isLoading: boolean
  isOpen: boolean
  onToggle: () => void
}

export default function ThinkingTraces({
  activities,
  isLoading,
  isOpen,
  onToggle,
}: ThinkingTracesProps) {
  if (!isLoading && activities.length === 0 && !isOpen) return null

  const visibleActivities = activities.slice(-6)
  const hasActiveActivity = activities.some((activity) => activity.status === 'active')

  if (!isOpen) {
    return (
      <div className="fixed inset-x-0 bottom-52 sm:bottom-60 z-20 px-3 sm:px-6 pointer-events-none">
        <div className="mx-auto flex max-w-3xl justify-end">
          <button
            type="button"
            onClick={onToggle}
            className="pointer-events-auto rounded-full border border-border/60 bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-xl transition hover:bg-card"
          >
            Show thinking traces
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-x-0 bottom-52 sm:bottom-60 z-20 px-3 sm:px-6 pointer-events-none">
      <div className="mx-auto max-w-3xl pointer-events-auto rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Thinking traces</h2>
            <p className="text-xs text-muted-foreground">
              Streaming from v0 as the app is generated
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                Live
              </div>
            )}
            <button
              type="button"
              onClick={onToggle}
              className="rounded-full px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Hide
            </button>
          </div>
        </div>

        <div className="max-h-[30dvh] overflow-y-auto px-4 py-3 space-y-3" aria-live="polite">
          {visibleActivities.length === 0 ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {isLoading ? (
                <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 border-t-foreground animate-spin" />
              ) : null}
              {isLoading ? 'Connecting to the v0 stream...' : 'No thinking traces captured yet.'}
            </div>
          ) : (
            visibleActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3 text-sm">
                <ActivityStatus activity={activity} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{activity.label}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {activity.type}
                    </span>
                  </div>

                  {activity.text && (
                    <div className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                      {activity.text}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {hasActiveActivity && visibleActivities.length > 0 && (
            <div className="pl-7 text-xs text-muted-foreground">Still working...</div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivityStatus({ activity }: { activity: GenerationActivity }) {
  if (activity.status === 'active') {
    return (
      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
    )
  }

  return (
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
      ✓
    </span>
  )
}
