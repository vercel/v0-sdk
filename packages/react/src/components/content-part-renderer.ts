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
    onCollapse?: () => void
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
    onCollapse?: () => void
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

// Headless content part data
export interface ContentPartData {
  type: string
  parts: any[]
  metadata: Record<string, any>
  componentType: 'thinking' | 'task' | 'unknown' | null
  title?: string
  iconName?: IconProps['name']
  thinkingData?: {
    duration?: number
    thought?: string
  }
}

// Headless hook for content part
export function useContentPart(part: any): ContentPartData {
  if (!part) {
    return {
      type: '',
      parts: [],
      metadata: {},
      componentType: null,
    }
  }

  const { type, parts = [], ...metadata } = part

  let componentType: ContentPartData['componentType'] = 'unknown'
  let title: string | undefined
  let iconName: IconProps['name'] | undefined
  let thinkingData: ContentPartData['thinkingData']

  switch (type) {
    case 'task-thinking-v1':
      componentType = 'thinking'
      title = 'Thought'
      const thinkingPart = parts.find((p: any) => p.type === 'thinking-end')
      thinkingData = {
        duration: thinkingPart?.duration,
        thought: thinkingPart?.thought,
      }
      break

    case 'task-search-web-v1':
      componentType = 'task'
      title = metadata.taskNameComplete || metadata.taskNameActive
      iconName = 'search'
      break

    case 'task-search-repo-v1':
      componentType = 'task'
      title = metadata.taskNameComplete || metadata.taskNameActive
      iconName = 'folder'
      break

    case 'task-diagnostics-v1':
      componentType = 'task'
      title = metadata.taskNameComplete || metadata.taskNameActive
      iconName = 'settings'
      break

    case 'task-read-file-v1':
      componentType = 'task'
      title =
        metadata.taskNameComplete || metadata.taskNameActive || 'Reading file'
      iconName = 'folder'
      break

    case 'task-coding-v1':
      componentType = 'task'
      title = metadata.taskNameComplete || metadata.taskNameActive || 'Coding'
      iconName = 'wrench'
      break

    case 'task-start-v1':
      componentType = null // Usually just indicates task start - can be hidden
      break

    case 'task-generate-design-inspiration-v1':
      componentType = 'task'
      title =
        metadata.taskNameComplete ||
        metadata.taskNameActive ||
        'Generating Design Inspiration'
      iconName = 'wrench'
      break

    // Handle any other task-*-v1 patterns that might be added in the future
    default:
      // Check if it's a task type we haven't explicitly handled yet
      if (
        type &&
        typeof type === 'string' &&
        type.startsWith('task-') &&
        type.endsWith('-v1')
      ) {
        componentType = 'task'
        // Generate a readable title from the task type
        const taskName = type
          .replace('task-', '')
          .replace('-v1', '')
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        title = metadata.taskNameComplete || metadata.taskNameActive || taskName
        iconName = 'wrench' // Default icon for unknown task types
      } else {
        componentType = 'unknown'
      }
      break
  }

  return {
    type,
    parts,
    metadata,
    componentType,
    title,
    iconName,
    thinkingData,
  }
}

/**
 * Content part renderer that handles different types of v0 API content parts
 *
 * For headless usage, use the useContentPart hook instead.
 */
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
  const contentData = useContentPart(part)

  if (!contentData.componentType) {
    return null
  }

  if (contentData.componentType === 'thinking') {
    const ThinkingComponent = thinkingSectionRenderer || ThinkingSection
    const [collapsed, setCollapsed] = useState(true)

    return React.createElement(ThinkingComponent, {
      title: contentData.title,
      duration: contentData.thinkingData?.duration,
      thought: contentData.thinkingData?.thought,
      collapsed,
      onCollapse: () => setCollapsed(!collapsed),
      brainIcon,
      chevronRightIcon,
      chevronDownIcon,
    })
  }

  if (contentData.componentType === 'task') {
    const TaskComponent = taskSectionRenderer || TaskSection
    const [collapsed, setCollapsed] = useState(true)

    // Map icon names to icon components
    let taskIcon: React.ReactNode
    switch (contentData.iconName) {
      case 'search':
        taskIcon = searchIcon
        break
      case 'folder':
        taskIcon = folderIcon
        break
      case 'settings':
        taskIcon = settingsIcon
        break
      case 'wrench':
        taskIcon = wrenchIcon
        break
      default:
        taskIcon = undefined
        break
    }

    return React.createElement(TaskComponent, {
      title: contentData.title,
      type: contentData.type,
      parts: contentData.parts,
      collapsed,
      onCollapse: () => setCollapsed(!collapsed),
      taskIcon,
      chevronRightIcon,
      chevronDownIcon,
    })
  }

  if (contentData.componentType === 'unknown') {
    return React.createElement(
      'div',
      { 'data-unknown-part-type': contentData.type },
      `Unknown part type: ${contentData.type}`,
    )
  }

  return null
}
