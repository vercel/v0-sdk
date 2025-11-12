'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '../components/sidebar'
import { RequestPanel } from '../components/request-panel'
import { ResponsePanel } from '../components/response-panel'
import { parseOpenAPISpec } from '../lib/openapi-parser'
import type { APIEndpoint } from '../lib/openapi-parser'
import { createClient } from 'v0-sdk'

export default function Home() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>()
  const [response, setResponse] = useState<any>()
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const categories = parseOpenAPISpec()

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('v0_api_key')
    if (savedKey) setApiKey(savedKey)
  }, [])

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    localStorage.setItem('v0_api_key', value)
  }

  const executeRequest = async (params: Record<string, any>) => {
    if (!selectedEndpoint || !apiKey) return

    setIsLoading(true)
    setResponse(undefined)

    try {
      // Create v0 client with the provided API key
      const v0 = createClient({ apiKey })
      const requestParams = params

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
      
      // Try to extract status code from various possible locations
      const status = 
        error.status || 
        error.response?.status || 
        error.statusCode ||
        (error.cause?.status) ||
        500

      const statusText = 
        error.statusText || 
        error.response?.statusText ||
        (status >= 500 ? 'Server Error' : status >= 400 ? 'Client Error' : 'Error')

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
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                v0 API Playground
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Explore the v0 Platform API
              </p>
            </div>
            <div className="flex-shrink-0 w-96">
              <div className="flex items-start gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap pt-3">
                  API Key <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Enter your v0 API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Get your API key from{' '}
                    <a
                      href="https://v0.dev/chat/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      v0.dev/chat/settings/keys
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <Sidebar
            categories={categories}
            selectedEndpoint={selectedEndpoint}
            onSelectEndpoint={setSelectedEndpoint}
          />
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 border-r border-gray-200">
            <RequestPanel
              endpoint={selectedEndpoint}
              onExecute={executeRequest}
              isLoading={isLoading}
              hasApiKey={!!apiKey}
            />
          </div>
          <div className="w-1/2">
            <ResponsePanel response={response} isLoading={isLoading} />
          </div>
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
