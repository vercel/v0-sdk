'use client'

import { useState, useEffect } from 'react'
import type { APIEndpoint } from '../lib/openapi-parser'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RequestPanelProps {
  endpoint?: APIEndpoint
  onExecute: (params: Record<string, any>) => void
  isLoading: boolean
  hasApiKey: boolean
}

export function RequestPanel({
  endpoint,
  onExecute,
  isLoading,
  hasApiKey,
}: RequestPanelProps) {
  const [params, setParams] = useState<Record<string, any>>({})

  useEffect(() => {
    // Reset params when endpoint changes
    if (endpoint) {
      const initialParams: Record<string, any> = {}
      endpoint.parameters?.forEach((param) => {
        if (param.schema?.default !== undefined) {
          initialParams[param.name] = param.schema.default
        } else if (param.schema?.type === 'boolean') {
          initialParams[param.name] = false
        } else if (param.schema?.type === 'array') {
          initialParams[param.name] = []
        } else if (param.schema?.type === 'object') {
          initialParams[param.name] = {}
        } else {
          initialParams[param.name] = ''
        }
      })
      setParams(initialParams)
    }
  }, [endpoint])

  const renderInput = (param: any) => {
    const value = params[param.name] ?? ''

    if (param.schema?.type === 'boolean') {
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) =>
              setParams({ ...params, [param.name]: e.target.checked })
            }
            className="rounded border-input text-primary focus:ring-ring"
          />
          <span className="text-sm text-muted-foreground">
            {param.schema.description || param.description}
          </span>
        </label>
      )
    }

    if (param.schema?.enum) {
      return (
        <Select
          value={value}
          onValueChange={(val) => setParams({ ...params, [param.name]: val })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {param.schema.enum.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (param.schema?.type === 'integer' || param.schema?.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) =>
            setParams({ ...params, [param.name]: Number(e.target.value) })
          }
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )
    }

    if (param.schema?.type === 'array' || param.schema?.type === 'object') {
      return (
        <textarea
          value={
            typeof value === 'string' ? value : JSON.stringify(value, null, 2)
          }
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              setParams({ ...params, [param.name]: parsed })
            } catch {
              setParams({ ...params, [param.name]: e.target.value })
            }
          }}
          rows={4}
          placeholder={`JSON ${param.schema?.type}`}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )
    }

    // Use textarea only for message and system fields
    if (param.name === 'message' || param.name === 'system') {
      return (
        <textarea
          value={value}
          onChange={(e) =>
            setParams({ ...params, [param.name]: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )
    }

    // Default to input field for strings
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      />
    )
  }

  if (!endpoint) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-muted-foreground">
            Select an endpoint from the sidebar to begin
          </p>
        </div>
      </div>
    )
  }

  const pathParams = endpoint.parameters?.filter((p) => p.in === 'path') || []
  const queryParams = endpoint.parameters?.filter((p) => p.in === 'query') || []
  const bodyParams = endpoint.parameters?.filter((p) => p.in === 'body') || []

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex-none p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`px-2 py-1 text-sm font-medium rounded ${
              endpoint.method === 'GET'
                ? 'text-success-foreground bg-success/10'
                : endpoint.method === 'POST'
                  ? 'text-info-foreground bg-info/10'
                  : endpoint.method === 'PATCH'
                    ? 'text-warning-foreground bg-warning/20'
                    : endpoint.method === 'PUT'
                      ? 'text-warning-foreground bg-warning/10'
                      : 'text-destructive-foreground bg-destructive/10'
            }`}
          >
            {endpoint.method}
          </span>
          <code className="text-sm text-foreground">{endpoint.path}</code>
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {endpoint.name}
        </h2>
        {endpoint.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {endpoint.description}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Path Parameters */}
          {pathParams.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Path Parameters
              </h3>
              <div className="space-y-3">
                {pathParams.map((param) => (
                  <div key={`path-${param.name}`}>
                    <label className="block text-sm text-foreground mb-1">
                      {param.name}
                      {param.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                    {renderInput(param)}
                    {param.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {param.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Parameters */}
          {queryParams.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Query Parameters
              </h3>
              <div className="space-y-3">
                {queryParams.map((param) => (
                  <div key={`query-${param.name}`}>
                    <label className="block text-sm text-foreground mb-1">
                      {param.name}
                      {param.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                    {renderInput(param)}
                    {param.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {param.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body Parameters */}
          {bodyParams.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Request Body
              </h3>
              <div className="space-y-3">
                {bodyParams.map((param) => (
                  <div key={`body-${param.name}`}>
                    <label className="block text-sm text-foreground mb-1">
                      {param.name}
                      {param.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                    {renderInput(param)}
                    {param.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {param.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-none p-4 border-t border-border">
        <button
          onClick={() => onExecute(params)}
          disabled={isLoading || !hasApiKey}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Executing...' : 'Send Request'}
        </button>
        {!hasApiKey && (
          <p className="mt-2 text-xs text-destructive text-center">
            Please enter your API key in the header above
          </p>
        )}
      </div>
    </div>
  )
}
