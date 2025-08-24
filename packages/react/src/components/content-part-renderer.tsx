import React, { useState } from 'react'
import { ThinkingSection } from './thinking-section'
import { TaskSection } from './task-section'
import { IconProps } from './icon'

export interface ContentPartRendererProps {
  part: any
  iconRenderer?: React.ComponentType<IconProps>
  thinkingSectionRenderer?: React.ComponentType<{
    title?: string
    duration?: number
    thought?: string
    collapsed?: boolean
    className?: string
    children?: React.ReactNode
    brainIcon?: React.ReactNode
    chevronRightIcon?: React.ReactNode
    chevronDownIcon?: React.ReactNode
  }>
  taskSectionRenderer?: React.ComponentType<{
    title?: string
    type?: string
    parts?: any[]
    collapsed?: boolean
    className?: string
    children?: React.ReactNode
    taskIcon?: React.ReactNode
    chevronRightIcon?: React.ReactNode
    chevronDownIcon?: React.ReactNode
  }>
  // Individual icon props for direct icon usage
  brainIcon?: React.ReactNode
  chevronRightIcon?: React.ReactNode
  chevronDownIcon?: React.ReactNode
  searchIcon?: React.ReactNode
  folderIcon?: React.ReactNode
  settingsIcon?: React.ReactNode
  wrenchIcon?: React.ReactNode
}

export function ContentPartRenderer({
  part,
  iconRenderer,
  thinkingSectionRenderer,
  taskSectionRenderer,
  brainIcon,
  chevronRightIcon,
  chevronDownIcon,
  searchIcon,
  folderIcon,
  settingsIcon,
  wrenchIcon,
}: ContentPartRendererProps) {
  if (!part) return null

  const { type, parts = [], ...metadata } = part

  switch (type) {
    case 'task-thinking-v1': {
      const thinkingPart = parts.find((p: any) => p.type === 'thinking-end')
      const ThinkingComponent = thinkingSectionRenderer || ThinkingSection
      const [collapsed, setCollapsed] = useState(true)

      return (
        <ThinkingComponent
          title="Thought"
          duration={thinkingPart?.duration}
          thought={thinkingPart?.thought}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          brainIcon={brainIcon}
          chevronRightIcon={chevronRightIcon}
          chevronDownIcon={chevronDownIcon}
        />
      )
    }

    case 'task-search-web-v1': {
      const TaskComponent = taskSectionRenderer || TaskSection
      const [collapsed, setCollapsed] = useState(true)

      return (
        <TaskComponent
          title={metadata.taskNameComplete || metadata.taskNameActive}
          type={type}
          parts={parts}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          taskIcon={searchIcon}
          chevronRightIcon={chevronRightIcon}
          chevronDownIcon={chevronDownIcon}
        />
      )
    }

    case 'task-search-repo-v1': {
      const TaskComponent = taskSectionRenderer || TaskSection
      const [collapsed, setCollapsed] = useState(true)

      return (
        <TaskComponent
          title={metadata.taskNameComplete || metadata.taskNameActive}
          type={type}
          parts={parts}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          taskIcon={folderIcon}
          chevronRightIcon={chevronRightIcon}
          chevronDownIcon={chevronDownIcon}
        />
      )
    }

    case 'task-diagnostics-v1': {
      const TaskComponent = taskSectionRenderer || TaskSection
      const [collapsed, setCollapsed] = useState(true)

      return (
        <TaskComponent
          title={metadata.taskNameComplete || metadata.taskNameActive}
          type={type}
          parts={parts}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          taskIcon={settingsIcon}
          chevronRightIcon={chevronRightIcon}
          chevronDownIcon={chevronDownIcon}
        />
      )
    }

    case 'task-start-v1':
      // Usually just indicates task start - can be hidden or show as status
      return null

    default:
      return <div data-unknown-part-type={type}>Unknown part type: {type}</div>
  }
}
