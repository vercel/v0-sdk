'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Calendar, Clock, Plus } from 'lucide-react'
import { AppHeader } from '@/components/shared/app-header'
import useSWR from 'swr'

interface V0Project {
  id: string
  object: 'project'
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  chats?: V0Chat[]
}

interface V0Chat {
  id: string
  object: 'chat'
  name?: string
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  createdAt: string
  updatedAt: string
}

export function ProjectDetailClient() {
  const params = useParams()
  const projectId = params.projectId as string

  const {
    data: project,
    error,
    isLoading: isLoadingProject,
  } = useSWR<V0Project>(projectId ? `/api/projects/${projectId}` : null)

  const getFirstUserMessage = (chat: V0Chat) => {
    const firstUserMessage = chat.messages?.find((msg) => msg.role === 'user')
    return firstUserMessage?.content || 'No messages'
  }

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="text-gray-600 dark:text-gray-300">
            Loading project...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-6 max-w-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading project
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.message || 'Failed to load project'}
              </p>
              <div className="mt-4">
                <Link
                  href="/projects"
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                >
                  ← Back to projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {project && (
          <>
            {/* Project Info */}
            <div className="rounded-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Created{' '}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        Updated{' '}
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Link>
              </div>
            </div>

            {/* Chats Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Chats ({project.chats?.length || 0})
                </h2>
              </div>

              {!project.chats || project.chats.length === 0 ? (
                <div className="text-center py-12 rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No chats in this project
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating your first chat for this project.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.chats.map((chat) => (
                    <Link
                      key={chat.id}
                      href={`/chats/${chat.id}`}
                      className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                            {chat.name || getFirstUserMessage(chat)}
                          </h3>
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{chat.messages?.length || 0} messages</span>
                            <span className="mx-2">•</span>
                            <span>
                              Updated{' '}
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
