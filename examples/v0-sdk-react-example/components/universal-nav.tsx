'use client'
import React from 'react'
import { usePathname } from 'next/navigation'

export function UniversalNav() {
  const pathname = usePathname()

  const styles = [
    { name: 'Main', path: '/', description: 'Modern dark theme' },
    { name: 'Minimal', path: '/minimal', description: 'Clean & simple' },
    { name: 'Terminal', path: '/terminal', description: 'Hacker aesthetic' },
    { name: 'Elegant', path: '/elegant', description: 'Beautiful & refined' },
    {
      name: 'Neobrutalism',
      path: '/neobrutalism',
      description: 'Bold & unapologetic',
    },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              @v0-sdk/react Example
            </h1>
          </div>

          <div className="flex gap-1">
            {styles.map((style) => {
              const isActive = pathname === style.path
              return (
                <a
                  key={style.path}
                  href={style.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={style.description}
                >
                  {style.name}
                </a>
              )
            })}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-4xl">
          This example demonstrates how to use the @v0-sdk/react package to
          render content from the v0 Platform API.
        </p>
      </div>
    </header>
  )
}
