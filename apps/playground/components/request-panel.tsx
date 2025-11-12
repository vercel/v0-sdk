'use client'

import { useState, useEffect } from 'react'
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react'
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
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Reset params when endpoint changes
    if (endpoint) {
      const initialParams: Record<string, any> = {}
      const pathsToExpand = new Set<string>()

      // Helper function to collect all expandable paths
      const collectExpandablePaths = (
        schema: any,
        basePath: string = '',
        value: any = null
      ) => {
        if (schema?.type === 'object' && schema?.properties) {
          if (basePath) pathsToExpand.add(basePath)
          Object.entries(schema.properties).forEach(([key, propSchema]: [string, any]) => {
            const fieldPath = basePath ? `${basePath}.${key}` : key
            collectExpandablePaths(propSchema, fieldPath, value?.[key])
          })
        } else if (schema?.type === 'array' && schema?.items) {
          // For arrays, we'll expand items as they're added
          if (value && Array.isArray(value)) {
            value.forEach((_, index) => {
              const itemPath = `${basePath}[${index}]`
              pathsToExpand.add(itemPath)
              if (schema.items?.type === 'object') {
                collectExpandablePaths(schema.items, itemPath, value[index])
              }
            })
          }
        }
      }

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

        // Collect paths for this parameter
        collectExpandablePaths(param.schema, param.name, initialParams[param.name])
      })

      setParams(initialParams)
      setExpandedObjects(pathsToExpand)
    }
  }, [endpoint])

  const toggleObjectExpanded = (path: string) => {
    setExpandedObjects((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const updateNestedValue = (path: string, value: any) => {
    const keys = path.split('.')
    const newParams = { ...params }
    let current: any = newParams

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      const arrayMatch = key.match(/^(.+)\[(\d+)\]$/)
      
      if (arrayMatch) {
        const arrayKey = arrayMatch[1]
        const index = parseInt(arrayMatch[2])
        if (!current[arrayKey]) current[arrayKey] = []
        if (!current[arrayKey][index]) current[arrayKey][index] = {}
        current = current[arrayKey][index]
      } else {
        if (!current[key]) current[key] = {}
        current = current[key]
      }
    }

    const lastKey = keys[keys.length - 1]
    const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/)
    
    if (arrayMatch) {
      const arrayKey = arrayMatch[1]
      const index = parseInt(arrayMatch[2])
      if (!current[arrayKey]) current[arrayKey] = []
      current[arrayKey][index] = value
    } else {
      current[lastKey] = value
    }

    setParams(newParams)
  }

  const renderObjectFields = (
    objectSchema: any,
    path: string,
    currentValue: any = {}
  ): JSX.Element => {
    const properties = objectSchema?.properties || {}
    const required = objectSchema?.required || []

    return (
      <div className="space-y-3 pl-4 border-l-2 border-border">
        {Object.entries(properties).map(([key, schema]: [string, any]) => {
          const fieldPath = path ? `${path}.${key}` : key
          const fieldValue = currentValue?.[key] ?? ''
          const isRequired = required.includes(key)

          return (
            <div key={fieldPath}>
              <label className="block text-sm text-foreground mb-1">
                {key}
                {isRequired && <span className="text-destructive ml-1">*</span>}
                {schema.description && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {schema.description}
                  </span>
                )}
              </label>
              {renderFieldByType(schema, fieldPath, fieldValue)}
            </div>
          )
        })}
      </div>
    )
  }

  const renderFieldByType = (
    schema: any,
    path: string,
    value: any
  ): JSX.Element => {
    if (schema.type === 'object') {
      const isExpanded = expandedObjects.has(path)
      return (
        <div className="border border-input rounded-md">
          <button
            type="button"
            onClick={() => toggleObjectExpanded(path)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="font-medium">Object</span>
          </button>
          {isExpanded && (
            <div className="p-3 pt-0">
              {renderObjectFields(schema, path, value || {})}
            </div>
          )}
        </div>
      )
    }

    if (schema.type === 'array') {
      return renderArrayField(schema, path, value)
    }

    if (schema.type === 'boolean') {
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => updateNestedValue(path, e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
          />
        </label>
      )
    }

    if (schema.type === 'number' || schema.type === 'integer') {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => updateNestedValue(path, Number(e.target.value))}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )
    }

    if (schema.enum) {
      return (
        <Select
          value={value || ''}
          onValueChange={(val) => updateNestedValue(path, val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {schema.enum.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => updateNestedValue(path, e.target.value)}
        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      />
    )
  }

  const renderArrayField = (
    schema: any,
    path: string,
    value: any
  ): JSX.Element => {
    const arrayValue = Array.isArray(value) ? value : []
    const itemSchema = schema.items || { type: 'string' }

    const addArrayItem = () => {
      const newItem =
        itemSchema.type === 'object'
          ? {}
          : itemSchema.type === 'number'
            ? 0
            : itemSchema.type === 'boolean'
              ? false
              : ''
      const newArray = [...arrayValue, newItem]
      updateNestedValue(path, newArray)
      
      // Auto-expand the newly added item if it's an object
      if (itemSchema.type === 'object') {
        const newItemPath = `${path}[${arrayValue.length}]`
        setExpandedObjects((prev) => new Set(prev).add(newItemPath))
      }
    }

    const removeArrayItem = (index: number) => {
      const newArray = arrayValue.filter((_: any, i: number) => i !== index)
      updateNestedValue(path, newArray)
    }

    return (
      <div className="space-y-2">
        {arrayValue.map((item: any, index: number) => {
          const itemPath = `${path}[${index}]`
          const isExpanded = expandedObjects.has(itemPath)

          return (
            <div key={index} className="flex gap-2">
              <div className="flex-1 border border-input rounded-md">
                {itemSchema.type === 'object' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleObjectExpanded(itemPath)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span className="font-medium">Item {index + 1}</span>
                    </button>
                    {isExpanded && (
                      <div className="p-3 pt-0">
                        {renderObjectFields(itemSchema, itemPath, item)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-2">
                    {renderFieldByType(itemSchema, itemPath, item)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem(index)}
                className="p-2 border border-input bg-background text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                title="Remove item"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
        <button
          type="button"
          onClick={addArrayItem}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-input bg-background text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
    )
  }

  const renderInput = (param: any) => {
    const value = params[param.name] ?? ''
    
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

    // Use the new rendering system for all schema-based fields
    return renderFieldByType(param.schema || { type: 'string' }, param.name, value)
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
