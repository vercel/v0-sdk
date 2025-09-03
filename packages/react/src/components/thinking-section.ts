import React, { useState } from 'react'
import { Icon, IconProps } from './icon'

export interface ThinkingSectionProps {
  title?: string
  duration?: number
  thought?: string
  collapsed?: boolean
  onCollapse?: () => void
  className?: string
  children?: React.ReactNode
  iconRenderer?: React.ComponentType<IconProps>
  brainIcon?: React.ReactNode
  chevronRightIcon?: React.ReactNode
  chevronDownIcon?: React.ReactNode
}

// Headless thinking section data
export interface ThinkingSectionData {
  title: string
  duration?: number
  thought?: string
  collapsed: boolean
  paragraphs: string[]
  formattedDuration?: string
}

// Headless hook for thinking section
export function useThinkingSection({
  title,
  duration,
  thought,
  collapsed: initialCollapsed = true,
  onCollapse,
}: Omit<
  ThinkingSectionProps,
  | 'className'
  | 'children'
  | 'iconRenderer'
  | 'brainIcon'
  | 'chevronRightIcon'
  | 'chevronDownIcon'
>): {
  data: ThinkingSectionData
  collapsed: boolean
  handleCollapse: () => void
} {
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed)
  const collapsed = onCollapse ? initialCollapsed : internalCollapsed
  const handleCollapse =
    onCollapse || (() => setInternalCollapsed(!internalCollapsed))

  const paragraphs = thought ? thought.split('\n\n') : []
  const formattedDuration = duration ? `${Math.round(duration)}s` : undefined

  return {
    data: {
      title: title || 'Thinking',
      duration,
      thought,
      collapsed,
      paragraphs,
      formattedDuration,
    },
    collapsed,
    handleCollapse,
  }
}

/**
 * Generic thinking section component
 * Renders a collapsible section with basic structure - consumers provide styling
 *
 * For headless usage, use the useThinkingSection hook instead.
 */
export function ThinkingSection({
  title,
  duration,
  thought,
  collapsed: initialCollapsed = true,
  onCollapse,
  className,
  children,
  iconRenderer,
  brainIcon,
  chevronRightIcon,
  chevronDownIcon,
}: ThinkingSectionProps) {
  const { data, collapsed, handleCollapse } = useThinkingSection({
    title,
    duration,
    thought,
    collapsed: initialCollapsed,
    onCollapse,
  })

  // If children provided, use that (allows complete customization)
  if (children) {
    return React.createElement(React.Fragment, {}, children)
  }

  // Uses React.createElement for maximum compatibility across environments
  return React.createElement(
    'div',
    {
      className,
      'data-component': 'thinking-section',
    },
    React.createElement(
      'button',
      {
        onClick: handleCollapse,
        'data-expanded': !collapsed,
        'data-button': true,
      },
      React.createElement(
        'div',
        { 'data-icon-container': true },
        collapsed
          ? React.createElement(
              React.Fragment,
              {},
              brainIcon ||
                (iconRenderer
                  ? React.createElement(iconRenderer, { name: 'brain' })
                  : React.createElement(Icon, { name: 'brain' })),
              chevronRightIcon ||
                (iconRenderer
                  ? React.createElement(iconRenderer, { name: 'chevron-right' })
                  : React.createElement(Icon, { name: 'chevron-right' })),
            )
          : chevronDownIcon ||
              (iconRenderer
                ? React.createElement(iconRenderer, { name: 'chevron-down' })
                : React.createElement(Icon, { name: 'chevron-down' })),
      ),
      React.createElement(
        'span',
        { 'data-title': true },
        data.title +
          (data.formattedDuration ? ` for ${data.formattedDuration}` : ''),
      ),
    ),
    !collapsed && data.thought
      ? React.createElement(
          'div',
          { 'data-content': true },
          React.createElement(
            'div',
            { 'data-thought-container': true },
            data.paragraphs.map((paragraph, index) =>
              React.createElement(
                'div',
                { key: index, 'data-paragraph': true },
                paragraph,
              ),
            ),
          ),
        )
      : null,
  )
}
