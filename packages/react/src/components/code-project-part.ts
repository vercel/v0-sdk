import React, { useState } from 'react'
import { CodeBlock } from './code-block'
import { Icon, IconProps } from './icon'

export interface CodeProjectPartProps {
  title?: string
  filename?: string
  code?: string
  language?: string
  collapsed?: boolean
  className?: string
  children?: React.ReactNode
  iconRenderer?: React.ComponentType<IconProps>
}

// Headless code project data
export interface CodeProjectData {
  title: string
  filename?: string
  code?: string
  language: string
  collapsed: boolean
  files: Array<{
    name: string
    path: string
    active: boolean
  }>
}

// Headless hook for code project
export function useCodeProject({
  title,
  filename,
  code,
  language = 'typescript',
  collapsed: initialCollapsed = true,
}: Omit<CodeProjectPartProps, 'className' | 'children' | 'iconRenderer'>): {
  data: CodeProjectData
  collapsed: boolean
  toggleCollapsed: () => void
} {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  // Mock file structure - in a real implementation this could be dynamic
  const files = [
    {
      name: filename || 'page.tsx',
      path: 'app/page.tsx',
      active: true,
    },
    {
      name: 'layout.tsx',
      path: 'app/layout.tsx',
      active: false,
    },
    {
      name: 'globals.css',
      path: 'app/globals.css',
      active: false,
    },
  ]

  return {
    data: {
      title: title || 'Code Project',
      filename,
      code,
      language,
      collapsed,
      files,
    },
    collapsed,
    toggleCollapsed: () => setCollapsed(!collapsed),
  }
}

/**
 * Generic code project block component
 * Renders a collapsible code project with basic structure - consumers provide styling
 *
 * For headless usage, use the useCodeProject hook instead.
 */
export function CodeProjectPart({
  title,
  filename,
  code,
  language = 'typescript',
  collapsed: initialCollapsed = true,
  className,
  children,
  iconRenderer,
}: CodeProjectPartProps) {
  const { data, collapsed, toggleCollapsed } = useCodeProject({
    title,
    filename,
    code,
    language,
    collapsed: initialCollapsed,
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
      'data-component': 'code-project-block',
    },
    React.createElement(
      'button',
      {
        onClick: toggleCollapsed,
        'data-expanded': !collapsed,
      },
      React.createElement(
        'div',
        { 'data-header': true },
        iconRenderer
          ? React.createElement(iconRenderer, { name: 'folder' })
          : React.createElement(Icon, { name: 'folder' }),
        React.createElement('span', { 'data-title': true }, data.title),
      ),
      React.createElement('span', { 'data-version': true }, 'v1'),
    ),
    !collapsed
      ? React.createElement(
          'div',
          { 'data-content': true },
          React.createElement(
            'div',
            { 'data-file-list': true },
            data.files.map((file, index) =>
              React.createElement(
                'div',
                {
                  key: index,
                  'data-file': true,
                  ...(file.active && { 'data-active': true }),
                },
                iconRenderer
                  ? React.createElement(iconRenderer, { name: 'file-text' })
                  : React.createElement(Icon, { name: 'file-text' }),
                React.createElement(
                  'span',
                  { 'data-filename': true },
                  file.name,
                ),
                React.createElement(
                  'span',
                  { 'data-filepath': true },
                  file.path,
                ),
              ),
            ),
          ),
          data.code
            ? React.createElement(CodeBlock, {
                language: data.language,
                code: data.code,
              })
            : null,
        )
      : null,
  )
}
