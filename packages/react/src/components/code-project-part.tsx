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

/**
 * Generic code project block component
 * Renders a collapsible code project with basic structure - consumers provide styling
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
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  // If children provided, use that (allows complete customization)
  if (children) {
    return <>{children}</>
  }

  return (
    <div className={className} data-component="code-project-block">
      <button
        onClick={() => setCollapsed(!collapsed)}
        data-expanded={!collapsed}
      >
        <div data-header>
          {iconRenderer ? (
            React.createElement(iconRenderer, { name: 'folder' })
          ) : (
            <Icon name="folder" />
          )}
          <span data-title>{title || 'Code Project'}</span>
        </div>
        <span data-version>v1</span>
      </button>
      {!collapsed && (
        <div data-content>
          <div data-file-list>
            <div data-file data-active>
              {iconRenderer ? (
                React.createElement(iconRenderer, { name: 'file-text' })
              ) : (
                <Icon name="file-text" />
              )}
              <span data-filename>{filename}</span>
              <span data-filepath>app/page.tsx</span>
            </div>
            {/* Additional files could be added here */}
            <div data-file>
              {iconRenderer ? (
                React.createElement(iconRenderer, { name: 'file-text' })
              ) : (
                <Icon name="file-text" />
              )}
              <span data-filename>layout.tsx</span>
              <span data-filepath>app/layout.tsx</span>
            </div>
            <div data-file>
              {iconRenderer ? (
                React.createElement(iconRenderer, { name: 'file-text' })
              ) : (
                <Icon name="file-text" />
              )}
              <span data-filename>globals.css</span>
              <span data-filepath>app/globals.css</span>
            </div>
          </div>
          {code && <CodeBlock language={language} code={code} />}
        </div>
      )}
    </div>
  )
}
