'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: string
  name?: string
}

interface ProjectsListProps {
  projects: Project[]
}

export function NewProjectButton() {
  return (
    <Link
      href="/projects/new"
      className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <span>New Project</span>
    </Link>
  )
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const router = useRouter()

  const handleNewChat = () => {
    router.push('/chats/new')
  }

  const getProjectTitle = (project: Project) => {
    if (project.name) return project.name
    return 'Untitled Project'
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">✨</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          No projects yet
        </h2>
        <p className="text-gray-600 mb-6">Create your first AI-generated app</p>
        <button
          onClick={handleNewChat}
          className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Create Project</span>
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group block"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-black transition-colors">
                {getProjectTitle(project)}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
