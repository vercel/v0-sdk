'use client'

import {
  getPendingV0Task,
  type MessagesResolveStreamData,
  type V0PendingTask,
  type V0UIMessage,
} from '@v0-sdk/react'
import { useCreateProject } from '@v0-sdk/react/swr'
import { useState, type ReactNode } from 'react'
import { Response } from '@/components/ai-elements/response'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export type ResolveTask = MessagesResolveStreamData['body']['task']

type QuestionsData = Extract<V0PendingTask, { type: 'questions' }>['data']
type PlanData = Extract<V0PendingTask, { type: 'plan' }>['data']
type IntegrationData = Extract<V0PendingTask, { type: 'integration' }>['data']
type Permission = Extract<V0PendingTask, { type: 'permissions' }>['permissions'][number]
type ConfirmedStepsTask = Extract<ResolveTask, { type: 'confirmed-steps' }>
type McpPreset = NonNullable<ConfirmedStepsTask['connectedMcpPresetNames']>[number]

const MCP_PRESETS = [
  'Linear',
  'Notion',
  'Context7',
  'Sentry',
  'Zapier',
  'Glean',
  'Hex',
  'Sanity',
  'Granola',
  'PostHog',
  'Contentful',
  'Slack',
] as const satisfies readonly McpPreset[]

export function TaskResolution({
  message,
  disabled = false,
  onResolve,
  onRejectPermission,
  vercelProjectId,
}: {
  message: V0UIMessage
  disabled?: boolean
  onResolve: (task: ResolveTask) => void | Promise<void>
  onRejectPermission: () => void | Promise<void>
  vercelProjectId?: string
}) {
  const task = getPendingV0Task(message)
  if (!task) return null

  switch (task.type) {
    case 'questions':
      return <QuestionsTask data={task.data} disabled={disabled} onResolve={onResolve} />
    case 'plan':
      return <PlanTask data={task.data} disabled={disabled} onResolve={onResolve} />
    case 'integration':
      return (
        <IntegrationTask
          data={task.data}
          disabled={disabled}
          initialVercelProjectId={vercelProjectId}
          message={message}
          onResolve={onResolve}
        />
      )
    case 'permissions':
      return (
        <PermissionsTask
          disabled={disabled}
          onReject={onRejectPermission}
          onResolve={onResolve}
          permissions={task.permissions}
        />
      )
  }
}

function QuestionsTask({
  data,
  disabled,
  onResolve,
}: {
  data: QuestionsData
  disabled: boolean
  onResolve: (task: ResolveTask) => void | Promise<void>
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [customText, setCustomText] = useState<Record<string, string>>({})
  const canSubmit =
    data.questions.length > 0 &&
    data.questions.every(
      (question) =>
        (selected[question.id]?.length ?? 0) > 0 || Boolean(customText[question.id]?.trim()),
    )

  const selectOption = (question: QuestionsData['questions'][number], label: string) => {
    setSelected((current) => {
      if (!question.multiSelect) {
        return { ...current, [question.id]: [label] }
      }

      const values = current[question.id] ?? []
      return {
        ...current,
        [question.id]: values.includes(label)
          ? values.filter((value) => value !== label)
          : [...values, label],
      }
    })
  }

  const submit = () =>
    onResolve({
      type: 'answered-questions',
      answers: data.questions.map((question) => ({
        questionId: question.id,
        questionText: question.question,
        selectedLabels: selected[question.id] ?? [],
        ...(customText[question.id]?.trim() ? { customText: customText[question.id].trim() } : {}),
      })),
    })

  return (
    <TaskCard description="Answer each question so v0 can continue." title="Questions">
      <div className="grid gap-4">
        {data.questions.map((question) => (
          <fieldset className="grid gap-2" disabled={disabled} key={question.id}>
            <legend className="font-medium">{question.header}</legend>
            <p className="text-muted-foreground">{question.question}</p>
            <div className="grid gap-1.5">
              {question.options.map((option) => {
                const checked = Boolean(selected[question.id]?.includes(option.label))

                return (
                  <label
                    className="flex cursor-pointer gap-2 rounded-md border border-border px-2.5 py-2 hover:bg-muted/50"
                    key={option.id}
                  >
                    <input
                      checked={checked}
                      className="mt-0.5"
                      name={question.id}
                      onChange={() => selectOption(question, option.label)}
                      type={question.multiSelect ? 'checkbox' : 'radio'}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium">{option.label}</span>
                      {option.description ? (
                        <span className="block text-muted-foreground">{option.description}</span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>
            <Textarea
              className="min-h-16 text-xs"
              disabled={disabled}
              onChange={(event) =>
                setCustomText((current) => ({
                  ...current,
                  [question.id]: event.target.value,
                }))
              }
              placeholder="Other or additional context"
              value={customText[question.id] ?? ''}
            />
          </fieldset>
        ))}
        <Button
          className="justify-self-start"
          disabled={disabled || !canSubmit}
          onClick={submit}
          size="sm"
          type="button"
        >
          Submit answers
        </Button>
      </div>
    </TaskCard>
  )
}

function PlanTask({
  data,
  disabled,
  onResolve,
}: {
  data: PlanData
  disabled: boolean
  onResolve: (task: ResolveTask) => void | Promise<void>
}) {
  const [feedback, setFeedback] = useState('')
  const trimmedFeedback = feedback.trim()

  const respond = (status: Extract<ResolveTask, { type: 'plan-exit-response' }>['status']) =>
    onResolve({
      type: 'plan-exit-response',
      status,
      content:
        trimmedFeedback ||
        (status === 'approved' ? 'Proceed with this plan.' : 'Do not proceed with this plan.'),
    })

  return (
    <TaskCard description={data.summary ?? `Proposed changes for ${data.path}`} title="Review plan">
      <div className="max-h-72 overflow-y-auto rounded-md border border-border bg-background p-3">
        <Response>{data.plan}</Response>
      </div>
      <Textarea
        className="min-h-20 text-xs"
        disabled={disabled}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Feedback or requested changes"
        value={feedback}
      />
      <div className="flex flex-wrap gap-2">
        <Button disabled={disabled} onClick={() => respond('approved')} size="sm" type="button">
          Approve
        </Button>
        <Button
          disabled={disabled || !trimmedFeedback}
          onClick={() => respond('request-changes')}
          size="sm"
          type="button"
          variant="outline"
        >
          Request changes
        </Button>
        <Button
          disabled={disabled}
          onClick={() => respond('rejected')}
          size="sm"
          type="button"
          variant="ghost"
        >
          Reject
        </Button>
      </div>
    </TaskCard>
  )
}

function IntegrationTask({
  data,
  disabled,
  initialVercelProjectId,
  message,
  onResolve,
}: {
  data: IntegrationData
  disabled: boolean
  initialVercelProjectId?: string
  message: V0UIMessage
  onResolve: (task: ResolveTask) => void | Promise<void>
}) {
  const [vercelProjectId, setVercelProjectId] = useState(initialVercelProjectId)
  const [projectError, setProjectError] = useState<string | null>(null)
  const chatId = message.metadata?.chatId
  const createProjectMutation = useCreateProject(
    `/api/chats/${encodeURIComponent(chatId ?? 'missing')}/project`,
  )
  const isCreatingProject = createProjectMutation.isMutating
  const requested = [...data.requestedIntegrations, ...data.requestedMcpPresets]
  const needsProject = data.requestedIntegrations.length > 0 && !vercelProjectId

  const createProject = async () => {
    setProjectError(null)

    if (!chatId) {
      setProjectError('Unable to find the chat for this integration request.')
      return
    }

    try {
      const result = await createProjectMutation.trigger({})
      setVercelProjectId(result.vercelProjectId)
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Failed to create Vercel project.')
    }
  }

  const resolve = (connected: boolean) =>
    onResolve({
      type: 'confirmed-steps',
      connectedIntegrationNames: connected ? data.requestedIntegrations : [],
      connectedMcpPresetNames: connected ? data.requestedMcpPresets.filter(isMcpPreset) : [],
      appliedScripts: [],
      addedEnvVars: [],
    })

  return (
    <TaskCard
      description="Connect the requested services outside this app, then confirm to continue."
      title="Connect services"
    >
      {requested.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5">
          {requested.map((name, index) => (
            <li key={`${name}-${index}`}>{name}</li>
          ))}
        </ul>
      ) : null}
      {data.requestedIntegrations.length > 0 ? (
        vercelProjectId ? (
          <p className="text-muted-foreground">
            Vercel project ready: <span className="font-mono">{vercelProjectId}</span>
          </p>
        ) : (
          <div className="grid justify-items-start gap-1.5">
            <Button
              disabled={disabled || isCreatingProject}
              onClick={createProject}
              size="sm"
              type="button"
              variant="outline"
            >
              {isCreatingProject ? 'Creating project…' : 'Create Vercel project'}
            </Button>
            {projectError ? <p className="text-destructive">{projectError}</p> : null}
          </div>
        )
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={disabled || needsProject}
          onClick={() => resolve(true)}
          size="sm"
          type="button"
        >
          I connected these
        </Button>
        <Button
          disabled={disabled}
          onClick={() => resolve(false)}
          size="sm"
          type="button"
          variant="outline"
        >
          Skip
        </Button>
      </div>
    </TaskCard>
  )
}

function PermissionsTask({
  permissions,
  disabled,
  onResolve,
  onReject,
}: {
  permissions: Permission[]
  disabled: boolean
  onResolve: (task: ResolveTask) => void | Promise<void>
  onReject: () => void | Promise<void>
}) {
  const allow = () =>
    onResolve({
      type: 'confirmed-permissions',
      permissions: permissions.map((permission) => ({
        type: permission.type,
        toolName: permission.toolName,
        input: permission.input,
        taskNameActive: permission.taskNameActive,
        taskNameComplete: permission.taskNameComplete,
        userMessage: permission.userMessage,
      })),
    })

  return (
    <TaskCard
      description="Review the requested tool access before allowing it."
      title="Permission required"
    >
      <div className="grid gap-2">
        {permissions.map((permission, index) => (
          <div
            className="rounded-md border border-border bg-background p-2.5"
            key={`${permission.toolName}-${index}`}
          >
            <p className="font-medium">{permission.toolName}</p>
            {permission.userMessage ? (
              <p className="mt-1 text-muted-foreground">{permission.userMessage}</p>
            ) : null}
            {permission.input !== undefined ? (
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[11px] text-muted-foreground">
                {formatValue(permission.input)}
              </pre>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button disabled={disabled} onClick={allow} size="sm" type="button">
          Allow
        </Button>
        <Button disabled={disabled} onClick={onReject} size="sm" type="button" variant="outline">
          Deny
        </Button>
      </div>
    </TaskCard>
  )
}

function TaskCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

function isMcpPreset(value: string): value is McpPreset {
  return (MCP_PRESETS as readonly string[]).includes(value)
}

function formatValue(value: unknown) {
  if (typeof value === 'string') return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
