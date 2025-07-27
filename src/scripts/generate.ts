import fs from 'node:fs'
import path from 'node:path'

interface Parameter {
  name: string
  in: 'path' | 'query' | 'header'
  required?: boolean
  schema: any
}

interface RequestBodyProperty {
  name: string
  required: boolean
  schema: any
  deprecated?: boolean
}

interface Operation {
  operationId: string
  method: string
  route: string
  params: Parameter[]
  bodyProps: RequestBodyProperty[]
  requestBodySchema?: any
  responseSchema?: any
}

async function fetchOpenApiSpec(): Promise<any> {
  console.log('Fetching latest OpenAPI spec from local server...')
  const response = await fetch(
    'http://localhost:3002/api-proxy/v1/openapi.json',
  )

  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`,
    )
  }

  const spec = await response.json()

  // Save the spec to openapi.json for reference
  fs.writeFileSync('openapi.json', JSON.stringify(spec, null, 2))
  console.log('OpenAPI spec saved to openapi.json')

  return spec
}

function generateSdk(openApiSpec: any, outputPath: string) {
  const paths = openApiSpec.paths
  const operations: Operation[] = []

  // Collect all operations
  for (const [route, methods] of Object.entries(paths)) {
    for (const [method, operationRaw] of Object.entries(
      methods as Record<string, any>,
    )) {
      const operation = operationRaw as {
        operationId?: string
        requestBody?: any
        parameters?: Parameter[]
        responses?: any
      }

      if (method === 'parameters' || !operation.operationId) continue

      const methodUpper = method.toUpperCase()

      // Extract parameters from the operation and route-level parameters
      const routeParams = (methods as any).parameters || []
      const opParams = operation.parameters || []
      const allParams = [...routeParams, ...opParams]

      // Extract request body properties
      const requestBodyProps = extractRequestBodyProperties(
        operation.requestBody,
      )

      // Extract request body schema
      const requestBodySchema =
        operation.requestBody?.content?.['application/json']?.schema

      // Extract response schema
      const responseSchema = extractResponseSchema(operation.responses)

      operations.push({
        operationId: operation.operationId,
        method: methodUpper,
        route,
        params: allParams,
        bodyProps: requestBodyProps,
        requestBodySchema,
        responseSchema,
      })
    }
  }

  // Generate TypeScript interfaces
  const interfaces = generateInterfaces(
    operations,
    openApiSpec.components?.schemas || {},
  )

  // Build nested structure
  const nestedStructure = buildNestedStructure(operations)

  // Generate the SDK code with createClient function
  const sdk = `import { createFetcher } from "./core";

${interfaces}

export interface V0ClientConfig {
  apiKey?: string;
  baseUrl?: string;
}

export function createClient(config: V0ClientConfig = {}) {
  const fetcher = createFetcher(config);
  
  return ${generateNestedObject(nestedStructure, '', 1, true)};
}

// Default client for backward compatibility
export const v0 = createClient();`

  fs.writeFileSync(path.join(outputPath, 'v0.ts'), sdk)
  console.log(`SDK written to ${outputPath}/v0.ts`)
}

function buildNestedStructure(operations: Operation[]): any {
  const structure: any = {}

  for (const operation of operations) {
    const segments = operation.operationId.split('.')
    let current = structure

    // Navigate/create nested structure
    for (let i = 0; i < segments.length - 1; i++) {
      let segment = segments[i]

      // Handle path parameters by removing curly braces and converting to camelCase
      if (segment.includes('{') && segment.includes('}')) {
        segment = segment.replace(/[{}]/g, '')
        // Convert to camelCase for property names
        segment = segment.charAt(0).toLowerCase() + segment.slice(1)
      }

      if (!current[segment]) {
        current[segment] = {}
      }
      current = current[segment]
    }

    // Add the final method
    const methodName = segments[segments.length - 1]
    current[methodName] = operation
  }

  return structure
}

function generateNestedObject(
  obj: any,
  _:string,
  depth: number = 0,
  isRoot: boolean = false,
): string {
  const indent = '  '.repeat(depth)
  const entries: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && 'operationId' in value) {
      // This is an operation
      const operation = value as Operation
      const paramInterface = generateParameterInterface(
        operation.params,
        operation.bodyProps,
        operation.requestBodySchema,
        operation.operationId,
      )
      const returnType = generateReturnType(
        operation.responseSchema,
        operation.operationId,
      )
      const functionBody = generateFunctionBody(
        operation.route,
        operation.method,
        operation.params,
        operation.bodyProps,
        operation.requestBodySchema,
      )

      entries.push(`${indent}  async ${key}(${paramInterface}): Promise<${returnType}> {
${indent}    ${functionBody.split('\n').join(`\n${indent}    `)}
${indent}  }`)
    } else {
      // This is a nested object
      entries.push(`${indent}  ${key}: {
${generateNestedObject(value, key, depth + 1, false)}
${indent}  }`)
    }
  }

  if (isRoot) {
    return `{
${entries.join(',\n\n')}
  }`
  } else {
    return entries.join(',\n\n')
  }
}

function extractRequestBodyProperties(
  requestBody?: any,
): RequestBodyProperty[] {
  if (!requestBody?.content?.['application/json']?.schema) {
    return []
  }

  const schema = requestBody.content['application/json'].schema

  // For schemas with allOf containing anyOf (discriminated unions),
  // we don't extract individual properties but let the schema generation handle it
  if (schema.allOf) {
    const hasAnyOfWithinAllOf = schema.allOf.some(
      (subSchema: any) => subSchema.anyOf,
    )
    if (hasAnyOfWithinAllOf) {
      // Return empty - this will be handled as a schema reference in the type generation
      return []
    }
  }

  // Helper function to extract properties from a schema
  function extractPropertiesFromSchema(schemaObj: any): RequestBodyProperty[] {
    const props: RequestBodyProperty[] = []

    if (schemaObj.properties) {
      const required = schemaObj.required || []
      for (const [name, propSchema] of Object.entries(schemaObj.properties)) {
        props.push({
          name,
          required: required.includes(name),
          schema: propSchema,
          deprecated: (propSchema as any)?.deprecated === true,
        })
      }
    }

    return props
  }

  // Handle allOf schemas by flattening all properties (simple case)
  if (schema.allOf) {
    const allProps: RequestBodyProperty[] = []
    for (const subSchema of schema.allOf) {
      allProps.push(...extractPropertiesFromSchema(subSchema))
    }
    return allProps
  }

  // Handle direct properties
  return extractPropertiesFromSchema(schema)
}

function extractResponseSchema(responses?: any): any {
  if (!responses?.['200']?.content?.['application/json']?.schema) {
    return null
  }
  return responses['200'].content['application/json'].schema
}

function generateInterfaces(operations: Operation[], schemas: any): string {
  const interfaces: string[] = []
  const generatedTypes = new Set<string>()

  // Generate interfaces from components.schemas first
  if (schemas) {
    for (const [schemaName, schemaDefinition] of Object.entries(schemas)) {
      if (!generatedTypes.has(schemaName)) {
        const tsType = schemaToTypeScript(schemaDefinition, schemas)
        if (tsType !== 'any') {
          if (tsType.includes(' | ')) {
            // It's a union type, use 'type' instead of 'interface'
            interfaces.push(`export type ${schemaName} = ${tsType}`)
          } else if (tsType.startsWith('{')) {
            interfaces.push(`export interface ${schemaName} ${tsType}`)
          } else {
            interfaces.push(`export type ${schemaName} = ${tsType}`)
          }
        }
        generatedTypes.add(schemaName)
      }
    }
  }

  // Generate interfaces for request bodies
  for (const operation of operations) {
    if (operation.bodyProps.length > 0 || operation.requestBodySchema) {
      const interfaceName = `${toPascalCase(operation.operationId)}Request`
      if (!generatedTypes.has(interfaceName)) {
        if (operation.bodyProps.length > 0) {
          // Generate from body properties
          const properties = operation.bodyProps
            .map((prop) => {
              const tsType = schemaToTypeScript(prop.schema, schemas)
              const deprecatedComment = prop.deprecated
                ? '  /** @deprecated */\n'
                : ''
              return `${deprecatedComment}  ${prop.name}${prop.required ? '' : '?'}: ${tsType}`
            })
            .join('\n')

          interfaces.push(`export interface ${interfaceName} {
${properties}
}`)
        } else if (operation.requestBodySchema) {
          // Generate from complex schema
          const tsType = schemaToTypeScript(
            operation.requestBodySchema,
            schemas,
          )
          if (tsType !== 'any') {
            if (tsType.includes(' | ')) {
              // It's a union type, use 'type' instead of 'interface'
              interfaces.push(`export type ${interfaceName} = ${tsType}`)
            } else if (tsType.startsWith('{')) {
              // It's an inline object type, create an interface
              interfaces.push(`export interface ${interfaceName} ${tsType}`)
            } else {
              // It's a type alias
              interfaces.push(`export type ${interfaceName} = ${tsType}`)
            }
          }
        }
        generatedTypes.add(interfaceName)
      }
    }

    // Generate interfaces for responses
    if (operation.responseSchema) {
      const interfaceName = `${toPascalCase(operation.operationId)}Response`
      if (!generatedTypes.has(interfaceName)) {
        const tsType = schemaToTypeScript(operation.responseSchema, schemas)
        if (tsType !== 'any') {
          if (tsType.includes(' | ')) {
            // It's a union type, use 'type' instead of 'interface'
            interfaces.push(`export type ${interfaceName} = ${tsType}`)
          } else if (tsType.startsWith('{')) {
            // It's an inline object type, create an interface
            interfaces.push(`export interface ${interfaceName} ${tsType}`)
          } else {
            // It's a type alias
            interfaces.push(`export type ${interfaceName} = ${tsType}`)
          }
        }
        generatedTypes.add(interfaceName)
      }
    }
  }

  return interfaces.join('\n\n')
}

function generateParameterInterface(
  params: Parameter[],
  bodyProps: RequestBodyProperty[],
  requestBodySchema: any,
  operationId: string,
): string {
  const pathParams = params.filter((p) => p.in === 'path')
  const queryParams = params.filter((p) => p.in === 'query')

  const pathProps = pathParams.map((p) => `${p.name}: string`)
  const queryProps = queryParams.map(
    (p) => `${p.name}${p.required ? '' : '?'}: string`,
  )

  let bodyInterface = ''
  if (bodyProps.length > 0 || requestBodySchema) {
    const requestTypeName = `${toPascalCase(operationId)}Request`
    bodyInterface = `params: ${requestTypeName}`
  }

  const allProps = [...pathProps, ...queryProps]

  // Check if all parameters are optional (no required path params, no body, all query params optional)
  const hasRequiredParams =
    pathParams.length > 0 ||
    bodyProps.length > 0 ||
    requestBodySchema ||
    queryParams.some((p) => p.required)
  const paramsOptional = !hasRequiredParams && allProps.length > 0

  if (bodyInterface && allProps.length > 0) {
    const paramsPrefix = paramsOptional ? 'params?' : 'params'
    return `${paramsPrefix}: { ${allProps.join('; ')} } & ${bodyInterface.split(': ')[1]}`
  } else if (bodyInterface) {
    return bodyInterface
  } else if (allProps.length > 0) {
    const paramsPrefix = paramsOptional ? 'params?' : 'params'
    return `${paramsPrefix}: { ${allProps.join('; ')} }`
  } else {
    return ''
  }
}

function generateReturnType(responseSchema: any, operationId: string): string {
  if (!responseSchema) {
    return 'any'
  }

  const responseTypeName = `${toPascalCase(operationId)}Response`
  return responseTypeName
}

function generateFunctionBody(
  route: string,
  method: string,
  params: Parameter[],
  bodyProps: RequestBodyProperty[],
  requestBodySchema?: any,
): string {
  const pathParams = params.filter((p) => p.in === 'path')
  const queryParams = params.filter((p) => p.in === 'query')

  const lines: string[] = []

  // Build path parameters object
  if (pathParams.length > 0) {
    const pathParamEntries = pathParams
      .map((p) => `${p.name}: params.${p.name}`)
      .join(', ')
    lines.push(`const pathParams = { ${pathParamEntries} }`)
  }

  // Build query parameters object - filter out undefined values
  if (queryParams.length > 0) {
    // Check if all parameters are optional (no required path params, no body, all query params optional)
    const hasRequiredParams =
      pathParams.length > 0 ||
      bodyProps.length > 0 ||
      requestBodySchema ||
      queryParams.some((p) => p.required)
    const paramsOptional = !hasRequiredParams
    // Check if all query parameters are optional
    const allQueryParamsOptional = queryParams.every((p) => !p.required)

    if (paramsOptional) {
      lines.push(`const query = params ? Object.fromEntries(`)
      lines.push(`  Object.entries({`)
      const queryParamEntries = queryParams
        .map((p) => `    ${p.name}: params.${p.name}`)
        .join(',\n')
      lines.push(queryParamEntries)
      lines.push(`  }).filter(([_, value]) => value !== undefined)`)
      lines.push(`) as Record<string, string> : {}`)
    } else {
      lines.push(`const query = Object.fromEntries(`)
      lines.push(`  Object.entries({`)
      const queryParamEntries = queryParams
        .map((p) => `    ${p.name}: params.${p.name}`)
        .join(',\n')
      lines.push(queryParamEntries)
      lines.push(`  }).filter(([_, value]) => value !== undefined)`)
      lines.push(`) as Record<string, string>`)
    }
  }

  // Build body object
  if (bodyProps.length > 0) {
    const bodyEntries = bodyProps
      .map((p) => `${p.name}: params.${p.name}`)
      .join(', ')
    lines.push(`const body = { ${bodyEntries} }`)
  } else if (requestBodySchema) {
    // For complex schemas, pass the entire params object as the body
    lines.push(`const body = params`)
  }

  // Build the fetcher call
  const fetcherParams: string[] = []
  if (pathParams.length > 0) fetcherParams.push('pathParams')
  if (queryParams.length > 0) {
    // Check if all parameters are optional (no required path params, no body, all query params optional)
    const hasRequiredParams =
      pathParams.length > 0 ||
      bodyProps.length > 0 ||
      queryParams.some((p) => p.required)
    const paramsOptional = !hasRequiredParams
    // Check if all query parameters are optional
    const allQueryParamsOptional = queryParams.every((p) => !p.required)

    if (paramsOptional || allQueryParamsOptional) {
      // Only include query if it has entries
      lines.push(`const hasQuery = Object.keys(query).length > 0`)
      fetcherParams.push('...(hasQuery ? { query } : {})')
    } else {
      fetcherParams.push('query')
    }
  }
  if (bodyProps.length > 0 || requestBodySchema) fetcherParams.push('body')

  const fetcherParamsObj =
    fetcherParams.length > 0 ? `{ ${fetcherParams.join(', ')} }` : '{}'

  lines.push(
    `return fetcher(\`${transformPath(route)}\`, "${method}", ${fetcherParamsObj})`,
  )

  return lines.join('\n')
}

function transformPath(route: string): string {
  return route.replace(/{([^}]+)}/g, '${pathParams.$1}')
}

function schemaToTypeScript(schema: any, schemas: any): string {
  if (!schema) return 'any'

  // Handle references
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop()
    return refName || 'any'
  }

  // Handle const values (literal types)
  if (schema.const !== undefined) {
    if (typeof schema.const === 'string') {
      return `"${schema.const}"`
    } else if (typeof schema.const === 'number') {
      return schema.const.toString()
    } else if (typeof schema.const === 'boolean') {
      return schema.const.toString()
    } else if (schema.const === null) {
      return 'null'
    } else {
      // For other types, stringify the value
      return JSON.stringify(schema.const)
    }
  }

  // Handle allOf (intersection types)
  if (schema.allOf) {
    const baseProperties: Record<string, any> = {}
    const baseRequired: string[] = []
    let discriminatedUnion: any = null

    for (const subSchema of schema.allOf) {
      if (subSchema.properties) {
        Object.assign(baseProperties, subSchema.properties)
        if (subSchema.required) {
          baseRequired.push(...subSchema.required)
        }
      }
      // Handle anyOf within allOf - create discriminated union
      if (subSchema.anyOf) {
        discriminatedUnion = subSchema
      }
    }

    if (discriminatedUnion) {
      // Create intersection of base properties with discriminated union
      let baseType = ''
      if (Object.keys(baseProperties).length > 0) {
        const properties = Object.entries(baseProperties)
          .map(([key, propSchema]: [string, any]) => {
            const isRequired = baseRequired.includes(key)
            const propType = schemaToTypeScript(propSchema, schemas)
            const deprecatedComment =
              propSchema?.deprecated === true ? '  /** @deprecated */\n' : ''
            return `${deprecatedComment}  ${key}${isRequired ? '' : '?'}: ${propType}`
          })
          .join('\n')
        baseType = `{\n${properties}\n}`
      }

      const unionType = schemaToTypeScript(discriminatedUnion, schemas)
      return baseType ? `${baseType} & (${unionType})` : unionType
    } else {
      // Simple allOf - merge all properties
      if (Object.keys(baseProperties).length > 0) {
        const properties = Object.entries(baseProperties)
          .map(([key, propSchema]: [string, any]) => {
            const isRequired = baseRequired.includes(key)
            const propType = schemaToTypeScript(propSchema, schemas)
            const deprecatedComment =
              propSchema?.deprecated === true ? '  /** @deprecated */\n' : ''
            return `${deprecatedComment}  ${key}${isRequired ? '' : '?'}: ${propType}`
          })
          .join('\n')
        return `{\n${properties}\n}`
      }
    }
  }

  // Handle anyOf (union types)
  if (schema.anyOf) {
    // Check if this is a discriminated union of objects with additionalProperties: false
    const isDiscriminatedUnion = schema.anyOf.every(
      (subSchema: any) =>
        subSchema.type === 'object' &&
        subSchema.additionalProperties === false &&
        subSchema.properties,
    )

    if (isDiscriminatedUnion) {
      // Generate discriminated union with never types for mutual exclusion
      const unionTypes = schema.anyOf.map((subSchema: any) => {
        const allKeys = new Set<string>()
        schema.anyOf.forEach((s: any) => {
          Object.keys(s.properties || {}).forEach((key) => allKeys.add(key))
        })

        const currentKeys = new Set(Object.keys(subSchema.properties || {}))
        const properties = Object.entries(subSchema.properties || {}).map(
          ([key, propSchema]: [string, any]) => {
            const isRequired = subSchema.required?.includes(key) ?? false
            const propType = schemaToTypeScript(propSchema, schemas)
            const deprecatedComment =
              propSchema?.deprecated === true ? '    /** @deprecated */\n' : ''
            return `${deprecatedComment}    ${key}${isRequired ? '' : '?'}: ${propType}`
          },
        )

        // Add never types for keys that exist in other union members but not this one
        const neverProperties = Array.from(allKeys)
          .filter((key) => !currentKeys.has(key))
          .map((key) => `    ${key}?: never`)

        const allProperties = [...properties, ...neverProperties].join('\n')
        return `{\n${allProperties}\n  }`
      })

      return unionTypes.join(' | ')
    } else {
      // Regular union handling
      const unionTypes = schema.anyOf.map((subSchema: any) =>
        schemaToTypeScript(subSchema, schemas),
      )
      return unionTypes.join(' | ')
    }
  }

  // Handle type as array (union types like ["string", "null"])
  if (Array.isArray(schema.type)) {
    const unionTypes = schema.type.map((type: string) => {
      if (type === 'null') return 'null'
      if (type === 'string') return 'string'
      if (type === 'number' || type === 'integer') return 'number'
      if (type === 'boolean') return 'boolean'
      if (type === 'object') return 'object'
      if (type === 'array') return 'any[]'
      return 'any'
    })
    return unionTypes.join(' | ')
  }

  // Handle arrays
  if (schema.type === 'array') {
    const itemType = schemaToTypeScript(schema.items, schemas)
    // If item type contains union (|), wrap in Array<> syntax for better readability
    if (itemType.includes(' | ')) {
      return `Array<${itemType}>`
    }
    return `${itemType}[]`
  }

  // Handle objects
  if (schema.type === 'object') {
    if (schema.properties) {
      const properties = Object.entries(schema.properties)
        .map(([key, propSchema]: [string, any]) => {
          const isRequired = schema.required?.includes(key) ?? false
          const propType = schemaToTypeScript(propSchema, schemas)
          const deprecatedComment =
            propSchema?.deprecated === true ? '  /** @deprecated */\n' : ''
          return `${deprecatedComment}  ${key}${isRequired ? '' : '?'}: ${propType}`
        })
        .join('\n')
      return `{\n${properties}\n}`
    }
    return 'Record<string, any>'
  }

  // Handle enums
  if (schema.enum) {
    return schema.enum.map((value: any) => `"${value}"`).join(' | ')
  }

  // Handle primitive types
  switch (schema.type) {
    case 'string':
      return 'string'
    case 'number':
    case 'integer':
      return 'number'
    case 'boolean':
      return 'boolean'
    default:
      return 'any'
  }
}

function toPascalCase(str: string): string {
  return str
    .split('.')
    .map((part) => {
      // Remove curly braces and convert to PascalCase
      return part
        .replace(/[{}]/g, '') // Remove curly braces
        .split(/[-_]/) // Split on hyphens and underscores
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
    })
    .join('')
}

// Main execution
async function main() {
  try {
    const spec = await fetchOpenApiSpec()
    generateSdk(spec, './src/sdk')
  } catch (error) {
    console.error('Failed to generate SDK:', error)
    process.exit(1)
  }
}

main()
