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
  discriminatedUnion?: {
    discriminator: string
    variants: {
      [key: string]: {
        name: string
        in: 'path' | 'query' | 'header' | 'body'
        required: boolean
        schema: any
        description?: string
      }[]
    }
  }
}

export interface APICategory {
  id: string
  name: string
  endpoints: APIEndpoint[]
}

function parseParameters(
  operation: any,
  path: string,
): {
  parameters: any[]
  discriminatedUnion?: {
    discriminator: string
    variants: { [key: string]: any[] }
  }
} {
  const parameters: any[] = []
  let discriminatedUnion: any = undefined

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
    const result = extractPropertiesFromSchema(schema)

    result.properties.forEach(({ name, prop, required }) => {
      parameters.push({
        name,
        in: 'body',
        required,
        schema: prop,
        description: prop.description,
      })
    })

    discriminatedUnion = result.discriminatedUnion
  }

  return { parameters, discriminatedUnion }
}

// Helper function to extract properties from complex schemas (allOf, anyOf, oneOf)
function extractPropertiesFromSchema(
  schema: any,
  parentRequired: string[] = [],
): {
  properties: Array<{ name: string; prop: any; required: boolean }>
  discriminatedUnion?: {
    discriminator: string
    variants: { [key: string]: any[] }
  }
} {
  const properties: Array<{ name: string; prop: any; required: boolean }> = []
  let discriminatedUnion: any = undefined

  // Handle direct properties
  if (schema.properties) {
    const required = schema.required || parentRequired
    Object.entries(schema.properties).forEach(([name, prop]: [string, any]) => {
      properties.push({
        name,
        prop,
        required: required.includes(name),
      })
    })
  }

  // Handle allOf - merge all schemas
  if (schema.allOf && Array.isArray(schema.allOf)) {
    schema.allOf.forEach((subSchema: any) => {
      const result = extractPropertiesFromSchema(subSchema, parentRequired)
      properties.push(...result.properties)
      // Check if any subSchema contains a discriminated union
      if (result.discriminatedUnion) {
        discriminatedUnion = result.discriminatedUnion
      }
    })
  }

  // Handle anyOf - check for discriminated union pattern
  if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    // Check if this is a discriminated union (all variants have a 'type' field with 'const')
    const isDiscriminatedUnion = schema.anyOf.every(
      (variant: any) =>
        variant.properties?.type?.const !== undefined ||
        variant.properties?.type?.enum !== undefined,
    )

    if (isDiscriminatedUnion) {
      // Extract the discriminator field and variants
      const discriminatorField = 'type'
      const variants: { [key: string]: any[] } = {}
      const enumValues: string[] = []

      schema.anyOf.forEach((variant: any) => {
        const typeValue =
          variant.properties?.type?.const !== undefined
            ? variant.properties?.type?.const
            : variant.properties?.type?.enum?.[0]
        if (typeValue !== undefined) {
          enumValues.push(typeValue)
          // Extract all properties except the discriminator
          const variantProps: any[] = []
          Object.entries(variant.properties || {}).forEach(
            ([name, prop]: [string, any]) => {
              if (name !== discriminatorField) {
                variantProps.push({
                  name,
                  in: 'body',
                  required: variant.required?.includes(name) || false,
                  schema: prop,
                  description: prop.description,
                })
              }
            },
          )
          variants[typeValue] = variantProps
        }
      })

      // Add the discriminator field as a regular property with enum
      const typeDescription =
        schema.anyOf[0]?.properties?.type?.description ||
        'Specifies the type of initialization'
      properties.push({
        name: discriminatorField,
        prop: {
          type: 'string',
          enum: enumValues,
          description: typeDescription,
        },
        required: true,
      })

      discriminatedUnion = {
        discriminator: discriminatorField,
        variants,
      }
    } else {
      // Regular anyOf - use first option
      const result = extractPropertiesFromSchema(
        schema.anyOf[0],
        parentRequired,
      )
      properties.push(...result.properties)
      if (result.discriminatedUnion) {
        discriminatedUnion = result.discriminatedUnion
      }
    }
  }

  // Handle oneOf - take the first schema as the default option
  if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    const result = extractPropertiesFromSchema(schema.oneOf[0], parentRequired)
    properties.push(...result.properties)
    if (result.discriminatedUnion) {
      discriminatedUnion = result.discriminatedUnion
    }
  }

  return { properties, discriminatedUnion }
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
    rateLimits: 'Rate Limits',
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

function sortEndpoints(
  endpoints: APIEndpoint[],
  categoryName: string,
): APIEndpoint[] {
  // Define custom sort order for each category
  const sortOrder: Record<string, string[]> = {
    Projects: [
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
    Chats: [
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
    Deployments: [
      'deployments.create',
      'deployments.find',
      'deployments.getById',
      'deployments.delete',
      'deployments.findLogs',
      'deployments.findErrors',
    ],
    Integrations: [
      'integrations.vercel.projects.create',
      'integrations.vercel.projects.find',
    ],
    Hooks: [
      'hooks.find',
      'hooks.create',
      'hooks.getById',
      'hooks.update',
      'hooks.delete',
    ],
    'Rate Limits': ['rateLimits.find'],
    User: ['user.get', 'user.getBilling', 'user.getPlan', 'user.getScopes'],
    Reports: ['reports.getUsage'],
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
          const { parameters, discriminatedUnion } = parseParameters(
            operation,
            path,
          )
          const endpoint: APIEndpoint = {
            id: operation.operationId || `${method}_${path}`,
            name:
              operation.summary || formatOperationName(operation.operationId),
            method: method.toUpperCase() as any,
            path,
            description: operation.description,
            category,
            parameters,
            requestBody: operation.requestBody,
            responses: operation.responses,
            discriminatedUnion,
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
