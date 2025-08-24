import React from 'react'
import { V0MessageRendererStyles } from '../types'
import { ThinkingSection } from './ThinkingSection'
import { TaskSection } from './TaskSection'

interface AssistantMessageContentPartProps {
  part: any
  styles?: V0MessageRendererStyles
}

export function AssistantMessageContentPart({
  part,
  styles,
}: AssistantMessageContentPartProps) {
  if (!part) return null

  const { type, parts = [], ...metadata } = part

  switch (type) {
    case 'task-thinking-v1':
      const thinkingPart = parts.find((p: any) => p.type === 'thinking-end')
      return (
        <ThinkingSection
          title="Thought"
          duration={thinkingPart?.duration}
          thought={thinkingPart?.thought}
          collapsed={true}
          className={styles?.thinkingContainer}
        />
      )

    case 'task-search-web-v1':
      return (
        <TaskSection
          title={metadata.taskNameComplete || metadata.taskNameActive}
          type={type}
          parts={parts}
          collapsed={true}
          className={styles?.taskContainer}
        />
      )

    case 'task-search-repo-v1':
      return (
        <TaskSection
          title={metadata.taskNameComplete || metadata.taskNameActive}
          type={type}
          parts={parts}
          collapsed={true}
          className={styles?.taskContainer}
        />
      )

    case 'task-diagnostics-v1':
      return (
        <TaskSection
          title={metadata.taskNameComplete || metadata.taskNameActive}
          type={type}
          parts={parts}
          collapsed={true}
          className={styles?.taskContainer}
        />
      )

    case 'task-start-v1':
      // Usually just indicates task start - can be hidden or show as status
      return null

    default:
      return (
        <div className="text-xs text-gray-400 p-2 bg-[#2D2D2D] border border-gray-600 rounded">
          Unknown part type: {type}
        </div>
      )
  }
}
