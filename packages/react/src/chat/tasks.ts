import type { V0UIMessage } from './messages'

type MessagePart = V0UIMessage['parts'][number]
type AgentActionPart = Extract<MessagePart, { type: 'data-v0-agent-action' }>
type AgentActionData = NonNullable<AgentActionPart['data']['data']>
type QuestionsData = Extract<AgentActionData, { questions: unknown }>
type PlanData = Extract<AgentActionData, { plan: unknown }>
type IntegrationData = Extract<AgentActionData, { requestedIntegrations: unknown }>
type ToolCallPart = Extract<MessagePart, { type: 'data-v0-tool-call' }>
type Permission = NonNullable<ToolCallPart['data']['suggestedPermissions']>[number]

export type V0PendingTask =
  | { type: 'questions'; data: QuestionsData }
  | { type: 'plan'; data: PlanData }
  | { type: 'integration'; data: IntegrationData }
  | { type: 'permissions'; permissions: Permission[] }

/** Returns the most recent user-resolvable task carried by a v0 message. */
export function getPendingV0Task(message: V0UIMessage): V0PendingTask | null {
  for (let index = message.parts.length - 1; index >= 0; index -= 1) {
    const part = message.parts[index]
    if (!part) continue

    if (part.type === 'data-v0-tool-call') {
      const toolCall = part as ToolCallPart
      if (!toolCall.data.suggestedPermissions?.length) continue

      return {
        type: 'permissions',
        permissions: toolCall.data.suggestedPermissions,
      }
    }

    if (part.type !== 'data-v0-agent-action') continue
    const action = part as AgentActionPart
    if (!action.data.data) continue

    if (action.data.name === 'ask_user_questions' && 'questions' in action.data.data) {
      return { type: 'questions', data: action.data.data }
    }

    if (action.data.name === 'exit_plan_mode' && 'plan' in action.data.data) {
      return { type: 'plan', data: action.data.data }
    }

    if (
      action.data.name === 'get_or_request_integration' &&
      'requestedIntegrations' in action.data.data
    ) {
      return { type: 'integration', data: action.data.data }
    }
  }

  return null
}
