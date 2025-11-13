'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { Sidebar } from '../../components/sidebar'
import { RequestPanel } from '../../components/request-panel'
import { ResponsePanel } from '../../components/response-panel'
import { parseOpenAPISpec } from '../../lib/openapi-parser'
import { routeToOperationId } from '../../lib/route-utils'
import type { APIEndpoint } from '../../lib/openapi-parser'
import { createClient } from 'v0-sdk'
import {
  apiKeyAtom,
  userAtom,
  selectedEndpointAtom,
  responseAtom,
  isLoadingAtom,
} from '../../lib/atoms'

const V0_API_BASE_URL =
  process.env.NEXT_PUBLIC_V0_API_BASE_URL || 'https://api.v0.dev/'

export default function EndpointPage() {
  const params = useParams()
  const router = useRouter()
  const [response, setResponse] = useAtom(responseAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const [apiKey] = useAtom(apiKeyAtom)
  const [user, setUser] = useAtom(userAtom)
  const [selectedEndpoint, setSelectedEndpoint] = useAtom(selectedEndpointAtom)

  const categories = useMemo(() => parseOpenAPISpec(), [])

  // Load user when API key changes
  useEffect(() => {
    if (apiKey) {
      fetchUser(apiKey)
    } else {
      setUser(null)
    }
  }, [apiKey])

  // Find endpoint based on route params
  useEffect(() => {
    if (params.slug && Array.isArray(params.slug)) {
      const resource = params.slug.slice(0, -1).join('/')
      const action = params.slug[params.slug.length - 1]
      const operationId = routeToOperationId(resource, action)

      // Find the endpoint with matching operationId
      for (const category of categories) {
        const endpoint = category.endpoints.find((e) => e.id === operationId)
        if (endpoint) {
          setSelectedEndpoint(endpoint)
          return
        }
      }

      // If not found, redirect to home
      router.push('/')
    }
  }, [params.slug, categories, router])

  const fetchUser = async (key: string) => {
    try {
      const v0 = createClient({
        apiKey: key,
        baseUrl: V0_API_BASE_URL,
      })
      const userResponse = await v0.user.get()
      setUser(userResponse)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const executeRequest = async (requestParams: Record<string, any>) => {
    if (!selectedEndpoint || !apiKey) return

    setIsLoading(true)
    setResponse(undefined)

    try {
      const v0 = createClient({
        apiKey,
        baseUrl: V0_API_BASE_URL,
      })

      // Build the path with path parameters
      let path = selectedEndpoint.path
      const pathParams =
        selectedEndpoint.parameters?.filter((p) => p.in === 'path') || []
      pathParams.forEach((param) => {
        if (requestParams[param.name]) {
          path = path.replace(`{${param.name}}`, requestParams[param.name])
        }
      })

      // Collect query parameters
      const queryParams: Record<string, any> = {}
      const queryParamDefs =
        selectedEndpoint.parameters?.filter((p) => p.in === 'query') || []
      queryParamDefs.forEach((param) => {
        if (
          requestParams[param.name] !== undefined &&
          requestParams[param.name] !== ''
        ) {
          queryParams[param.name] = requestParams[param.name]
        }
      })

      // Collect body parameters
      const bodyParams: Record<string, any> = {}
      const bodyParamDefs =
        selectedEndpoint.parameters?.filter((p) => p.in === 'body') || []
      bodyParamDefs.forEach((param) => {
        if (
          requestParams[param.name] !== undefined &&
          requestParams[param.name] !== ''
        ) {
          bodyParams[param.name] = requestParams[param.name]
        }
      })

      // Map endpoint to SDK method
      const result = await executeEndpoint(v0, selectedEndpoint, {
        pathParams: Object.fromEntries(
          pathParams.map((p) => [p.name, requestParams[p.name]]),
        ),
        queryParams,
        bodyParams,
      })

      setResponse({
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
        },
      })
    } catch (error: any) {
      console.error('API Error:', error)

      const status =
        error.status ||
        error.response?.status ||
        error.statusCode ||
        error.cause?.status ||
        500

      const statusText =
        error.statusText ||
        error.response?.statusText ||
        (status >= 500
          ? 'Server Error'
          : status >= 400
            ? 'Client Error'
            : 'Error')

      setResponse({
        error: {
          message: error.message || 'An error occurred',
          details: error.response?.data || error.body || error.data || error,
        },
        status,
        statusText,
        headers: error.response?.headers || error.headers || {},
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <div className="w-80 flex-shrink-0 h-full">
        <Sidebar
          categories={categories}
          selectedEndpoint={selectedEndpoint}
          onSelectEndpoint={(endpoint) => {
            // Navigate to the endpoint route instead of selecting
            const parts = endpoint.id.split('.')
            const resource = parts.slice(0, -1).join('/')
            const action = parts[parts.length - 1]
              .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
              .toLowerCase()
            router.push(`/${resource}/${action}`)
          }}
          user={user}
        />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-border">
          <RequestPanel
            endpoint={selectedEndpoint}
            onExecute={executeRequest}
          />
        </div>
        <div className="w-1/2">
          <ResponsePanel />
        </div>
      </div>
    </div>
  )
}

async function executeEndpoint(
  v0: any,
  endpoint: APIEndpoint,
  params: {
    pathParams: Record<string, any>
    queryParams: Record<string, any>
    bodyParams: Record<string, any>
  },
) {
  const { pathParams, queryParams, bodyParams } = params
  const allParams = { ...pathParams, ...queryParams, ...bodyParams }

  // Map operation IDs to SDK methods
  const operationId = endpoint.id

  // Projects
  if (operationId === 'projects.create') {
    return v0.projects.create(bodyParams)
  }
  if (operationId === 'projects.find') {
    return v0.projects.find()
  }
  if (operationId === 'projects.getById') {
    return v0.projects.getById(pathParams)
  }
  if (operationId === 'projects.getByChatId') {
    return v0.projects.getByChatId(pathParams)
  }
  if (operationId === 'projects.update') {
    return v0.projects.update(allParams)
  }
  if (operationId === 'projects.assign') {
    return v0.projects.assign(allParams)
  }
  if (operationId === 'projects.createEnvVars') {
    return v0.projects.createEnvVars(allParams)
  }
  if (operationId === 'projects.delete') {
    return v0.projects.delete(pathParams)
  }
  if (operationId === 'projects.deleteEnvVars') {
    return v0.projects.deleteEnvVars(allParams)
  }
  if (operationId === 'projects.findEnvVars') {
    return v0.projects.findEnvVars(allParams)
  }
  if (operationId === 'projects.getEnvVar') {
    return v0.projects.getEnvVar(allParams)
  }
  if (operationId === 'projects.updateEnvVars') {
    return v0.projects.updateEnvVars(allParams)
  }

  // Chats
  if (operationId === 'chats.create') {
    return v0.chats.create(bodyParams)
  }
  if (operationId === 'chats.find') {
    return v0.chats.find(queryParams)
  }
  if (operationId === 'chats.init') {
    return v0.chats.init(bodyParams)
  }
  if (operationId === 'chats.delete') {
    return v0.chats.delete(pathParams)
  }
  if (operationId === 'chats.getById') {
    return v0.chats.getById(pathParams)
  }
  if (operationId === 'chats.update') {
    return v0.chats.update(allParams)
  }
  if (operationId === 'chats.favorite') {
    return v0.chats.favorite(allParams)
  }
  if (operationId === 'chats.fork') {
    return v0.chats.fork(allParams)
  }
  if (operationId === 'chats.sendMessage') {
    return v0.chats.sendMessage(allParams)
  }
  if (operationId === 'chats.findMessages') {
    return v0.chats.findMessages(allParams)
  }
  if (operationId === 'chats.getMessage') {
    return v0.chats.getMessage(allParams)
  }
  if (operationId === 'chats.findVersions') {
    return v0.chats.findVersions(allParams)
  }
  if (operationId === 'chats.getVersion') {
    return v0.chats.getVersion(allParams)
  }
  if (operationId === 'chats.updateVersion') {
    return v0.chats.updateVersion(allParams)
  }
  if (operationId === 'chats.resume') {
    return v0.chats.resume(allParams)
  }
  if (operationId === 'chats.downloadVersion') {
    return v0.chats.downloadVersion(allParams)
  }

  // Deployments
  if (operationId === 'deployments.create') {
    return v0.deployments.create(bodyParams)
  }
  if (operationId === 'deployments.find') {
    return v0.deployments.find(queryParams)
  }
  if (operationId === 'deployments.getById') {
    return v0.deployments.getById(pathParams)
  }
  if (operationId === 'deployments.delete') {
    return v0.deployments.delete(pathParams)
  }
  if (operationId === 'deployments.findLogs') {
    return v0.deployments.findLogs(allParams)
  }
  if (operationId === 'deployments.findErrors') {
    return v0.deployments.findErrors(pathParams)
  }

  // Integrations
  if (operationId === 'integrations.vercel.projects.create') {
    return v0.integrations.vercel.projects.create(bodyParams)
  }
  if (operationId === 'integrations.vercel.projects.find') {
    return v0.integrations.vercel.projects.find()
  }

  // Hooks
  if (operationId === 'hooks.find') {
    return v0.hooks.find()
  }
  if (operationId === 'hooks.create') {
    return v0.hooks.create(bodyParams)
  }
  if (operationId === 'hooks.getById') {
    return v0.hooks.getById(pathParams)
  }
  if (operationId === 'hooks.update') {
    return v0.hooks.update(allParams)
  }
  if (operationId === 'hooks.delete') {
    return v0.hooks.delete(pathParams)
  }

  // Rate Limits
  if (operationId === 'rateLimits.find') {
    return v0.rateLimits.find(queryParams)
  }

  // User
  if (operationId === 'user.get') {
    return v0.user.get()
  }
  if (operationId === 'user.getBilling') {
    return v0.user.getBilling(queryParams)
  }
  if (operationId === 'user.getPlan') {
    return v0.user.getPlan()
  }
  if (operationId === 'user.getScopes') {
    return v0.user.getScopes()
  }

  // Reports
  if (operationId === 'reports.getUsage') {
    return v0.reports.getUsage(queryParams)
  }

  throw new Error(`Unsupported operation: ${operationId}`)
}
