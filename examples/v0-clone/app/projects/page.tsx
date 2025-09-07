'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Monitor, FolderOpen, Github } from 'lucide-react'

interface VercelProject {
  id: string
  object: 'vercel_project'
  name: string
}

interface ProjectsResponse {
  object: 'list'
  data: VercelProject[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<VercelProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/projects')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Failed to fetch projects')
        }

        const data: ProjectsResponse = await response.json()
        setProjects(data.data || [])
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="border-b border-border dark:border-input">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
              >
                ← v0 Clone
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Vercel Projects
              </h1>
              <Link
                href="https://github.com/vercel/v0-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="View v0 SDK on GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading projects...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading projects
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your Vercel Projects
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {projects.length === 0
                  ? 'No Vercel projects found. Make sure your Vercel integration is configured.'
                  : `Found ${projects.length} project${projects.length !== 1 ? 's' : ''} in your Vercel account.`}
              </p>
            </div>

            {projects.length > 0 && (
              <div className="shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-border dark:divide-input">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {project.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {project.id}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              Vercel Project
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {projects.length === 0 && !error && (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No projects found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by connecting your Vercel account or creating a
                  new project.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
