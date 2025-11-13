import openAPISpec from '../../../packages/v0-sdk/openapi.json'

export interface APIEndpoint {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description?: string
  category: string
  parameters?: {
    name: string
    in: 'path' | 'query' | 'header' | 'body'
    required: boolean
    schema: any
    description?: string
  }[]
  requestBody?: any
  responses?: any
}

export interface APICategory {
  id: string
  name: string
  endpoints: APIEndpoint[]
}

function parseParameters(operation: any, path: string): any[] {
  const parameters: any[] = []

  // Query and other parameters from operation
  if (operation.parameters) {
    operation.parameters.forEach((param: any) => {
      parameters.push({
        name: param.name,
        in: param.in,
        required: param.required || false,
        schema: param.schema,
        description: param.description,
      })
    })
  }

  // Path parameters - only add if not already defined in operation.parameters
  const pathParams = path.match(/\{([^}]+)\}/g)
  if (pathParams) {
    pathParams.forEach((param) => {
      const paramName = param.replace(/[{}]/g, '')
      // Check if this path parameter is already defined
      const existingParam = parameters.find(
        (p) => p.name === paramName && p.in === 'path',
      )
      if (!existingParam) {
        parameters.push({
          name: paramName,
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: `Path parameter: ${paramName}`,
        })
      }
    })
  }

  // Request body parameters
  if (operation.requestBody?.content?.['application/json']?.schema) {
    const schema = operation.requestBody.content['application/json'].schema
    if (schema.properties) {
      Object.entries(schema.properties).forEach(
        ([name, prop]: [string, any]) => {
          parameters.push({
            name,
            in: 'body',
            required: schema.required?.includes(name) || false,
            schema: prop,
            description: prop.description,
          })
        },
      )
    }
  }

  return parameters
}

function getCategoryFromTags(tags?: string[]): string {
  if (!tags || tags.length === 0) return 'Other'

  const categoryMap: Record<string, string> = {
    chats: 'Chats',
    projects: 'Projects',
    deployments: 'Deployments',
    hooks: 'Hooks',
    integrations: 'Integrations',
    'rate-limits': 'Rate Limits',
    user: 'User',
    reports: 'Reports',
  }

  return categoryMap[tags[0]] || tags[0]
}

function formatOperationName(operationId: string): string {
  const parts = operationId.split('.')
  if (parts.length > 1) {
    return parts[parts.length - 1]
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, (c) => c.toUpperCase())
  }
  return operationId
}

function sortEndpoints(endpoints: APIEndpoint[], categoryName: string): APIEndpoint[] {
  // Define custom sort order for each category
  const sortOrder: Record<string, string[]> = {
    'Projects': [
      'projects.create',
      'projects.find',
      'projects.getById',
      'projects.getByChatId',
      'projects.update',
      'projects.assign',
      'projects.createEnvVars',
      'projects.delete',
      'projects.deleteEnvVars',
      'projects.findEnvVars',
      'projects.getEnvVar',
      'projects.updateEnvVars',
    ],
    'Chats': [
      'chats.create',
      'chats.find',
      'chats.init',
      'chats.delete',
      'chats.getById',
      'chats.update',
      'chats.favorite',
      'chats.fork',
      'chats.sendMessage',
      'chats.findMessages',
      'chats.getMessage',
      'chats.findVersions',
      'chats.getVersion',
      'chats.updateVersion',
      'chats.resume',
      'chats.downloadVersion',
    ],
    'Deployments': [
      'deployments.create',
      'deployments.find',
      'deployments.getById',
      'deployments.delete',
      'deployments.findLogs',
      'deployments.findErrors',
    ],
    'Integrations': [
      'integrations.vercel.projects.create',
      'integrations.vercel.projects.find',
    ],
    'Hooks': [
      'hooks.find',
      'hooks.create',
      'hooks.getById',
      'hooks.update',
      'hooks.delete',
    ],
    'Rate Limits': [
      'rateLimits.find',
    ],
    'User': [
      'user.get',
      'user.getBilling',
      'user.getPlan',
      'user.getScopes',
    ],
    'Reports': [
      'reports.getUsage',
    ],
  }

  const order = sortOrder[categoryName]
  if (!order) return endpoints

  // Create a map of operationId to index
  const indexMap = new Map(order.map((id, index) => [id, index]))

  // Sort endpoints based on the order
  return [...endpoints].sort((a, b) => {
    const aIndex = indexMap.get(a.id) ?? Infinity
    const bIndex = indexMap.get(b.id) ?? Infinity
    return aIndex - bIndex
  })
}

export function parseOpenAPISpec(): APICategory[] {
  const categoryMap = new Map<string, APIEndpoint[]>()

  Object.entries(openAPISpec.paths).forEach(
    ([path, pathItem]: [string, any]) => {
      ;['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
        const operation = pathItem[method]
        if (operation) {
          const category = getCategoryFromTags(operation.tags)
          const endpoint: APIEndpoint = {
            id: operation.operationId || `${method}_${path}`,
            name:
              operation.summary || formatOperationName(operation.operationId),
            method: method.toUpperCase() as any,
            path,
            description: operation.description,
            category,
            parameters: parseParameters(operation, path),
            requestBody: operation.requestBody,
            responses: operation.responses,
          }

          if (!categoryMap.has(category)) {
            categoryMap.set(category, [])
          }
          categoryMap.get(category)!.push(endpoint)
        }
      })
    },
  )

  // Convert to array of categories
  const categories: APICategory[] = []
  const orderedCategories = [
    'Projects',
    'Chats',
    'Deployments',
    'Integrations',
    'Hooks',
    'Rate Limits',
    'User',
    'Reports',
  ]

  orderedCategories.forEach((categoryName) => {
    const endpoints = categoryMap.get(categoryName)
    if (endpoints) {
      categories.push({
        id: categoryName.toLowerCase().replace(/\s+/g, '-'),
        name: categoryName,
        endpoints: sortEndpoints(endpoints, categoryName),
      })
    }
  })

  // Add any remaining categories
  categoryMap.forEach((endpoints, categoryName) => {
    if (!orderedCategories.includes(categoryName)) {
      categories.push({
        id: categoryName.toLowerCase().replace(/\s+/g, '-'),
        name: categoryName,
        endpoints,
      })
    }
  })

  return categories
}
