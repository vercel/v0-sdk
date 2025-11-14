import type { APIEndpoint } from './openapi-parser'

interface GenerateCodeOptions {
  endpoint: APIEndpoint
  params: Record<string, any>
  apiKey?: string
}

/**
 * Generate v0 SDK code from endpoint and parameters
 */
export function generateSDKCode({
  endpoint,
  params,
}: GenerateCodeOptions): string {
  const lines: string[] = []

  // Import statement
  lines.push("import { v0 } from 'v0-sdk'")
  lines.push('')

  // Determine the method call based on the operationId
  const operationId = endpoint.id
  const methodChain = operationId.split('.')

  // Build the call with parameters
  const pathParams = endpoint.parameters?.filter((p) => p.in === 'path') || []
  const queryParams = endpoint.parameters?.filter((p) => p.in === 'query') || []
  const bodyParams = endpoint.parameters?.filter((p) => p.in === 'body') || []

  // Build method chain
  let methodCall = 'const result = await v0'
  methodChain.forEach((part, index) => {
    if (index === methodChain.length - 1) {
      // Last part is the method call
      methodCall += `.${part}(`
    } else {
      // Intermediate parts are just properties
      methodCall += `.${part}`
    }
  })

  // Add parameters
  const args: string[] = []

  // For path parameters, check if they need to be in the object or separate
  // Most v0 SDK methods take all params as a single object
  const allParams: string[] = []

  pathParams.forEach((param) => {
    const value = params[param.name]
    if (value !== undefined && value !== '') {
      allParams.push(`  ${param.name}: ${formatValue(value, param.schema)}`)
    }
  })

  bodyParams.forEach((param) => {
    const value = params[param.name]
    if (value !== undefined && value !== '') {
      allParams.push(`  ${param.name}: ${formatValue(value, param.schema)}`)
    }
  })

  queryParams.forEach((param) => {
    const value = params[param.name]
    if (value !== undefined && value !== '') {
      allParams.push(`  ${param.name}: ${formatValue(value, param.schema)}`)
    }
  })

  if (allParams.length > 0) {
    methodCall += `{\n${allParams.join(',\n')}\n}`
  }

  methodCall += ')'

  lines.push(methodCall)

  return lines.join('\n')
}

/**
 * Generate cURL command from endpoint and parameters
 */
export function generateCurlCode({
  endpoint,
  params,
}: GenerateCodeOptions): string {
  const lines: string[] = []

  // Build URL
  let url = `https://api.v0.dev${endpoint.path}`

  // Replace path parameters
  const pathParams = endpoint.parameters?.filter((p) => p.in === 'path') || []
  pathParams.forEach((param) => {
    const value = params[param.name]
    if (value !== undefined && value !== '') {
      url = url.replace(`{${param.name}}`, String(value))
    }
  })

  // Add query parameters
  const queryParams = endpoint.parameters?.filter((p) => p.in === 'query') || []
  const queryParts: string[] = []
  queryParams.forEach((param) => {
    const value = params[param.name]
    if (value !== undefined && value !== '') {
      queryParts.push(`${param.name}=${encodeURIComponent(String(value))}`)
    }
  })

  if (queryParts.length > 0) {
    url += '?' + queryParts.join('&')
  }

  // Start curl command
  lines.push(`curl -X ${endpoint.method} '${url}' \\`)

  // Add headers
  lines.push("  -H 'Content-Type: application/json' \\")

  // Never include actual API key - always use placeholder
  lines.push("  -H 'Authorization: Bearer YOUR_API_KEY' \\")

  // Add body if needed
  const bodyParams = endpoint.parameters?.filter((p) => p.in === 'body') || []
  if (
    bodyParams.length > 0 &&
    (endpoint.method === 'POST' ||
      endpoint.method === 'PUT' ||
      endpoint.method === 'PATCH')
  ) {
    const body: Record<string, any> = {}
    bodyParams.forEach((param) => {
      const value = params[param.name]
      if (value !== undefined && value !== '') {
        body[param.name] = value
      }
    })

    if (Object.keys(body).length > 0) {
      lines.push(`  -d '${JSON.stringify(body, null, 2)}'`)
    }
  } else {
    // Remove trailing backslash from last line
    const lastLine = lines[lines.length - 1]
    lines[lines.length - 1] = lastLine.replace(' \\', '')
  }

  return lines.join('\n')
}

/**
 * Format a value for SDK code generation
 */
function formatValue(value: any, schema?: any): string {
  if (value === null || value === undefined) {
    return 'undefined'
  }

  if (schema?.type === 'string' || typeof value === 'string') {
    // Escape single quotes and backslashes in strings
    const escaped = String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    return `'${escaped}'`
  }

  if (schema?.type === 'boolean' || typeof value === 'boolean') {
    return String(value)
  }

  if (
    schema?.type === 'number' ||
    schema?.type === 'integer' ||
    typeof value === 'number'
  ) {
    return String(value)
  }

  if (schema?.type === 'array' || Array.isArray(value)) {
    if (Array.isArray(value) && value.length === 0) {
      return '[]'
    }
    return JSON.stringify(value, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : `  ${line}`))
      .join('\n')
  }

  if (schema?.type === 'object' || typeof value === 'object') {
    return JSON.stringify(value, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : `  ${line}`))
      .join('\n')
  }

  return `'${value}'`
}
