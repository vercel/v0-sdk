import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

type OpenApiDocument = {
  components?: {
    schemas?: Record<string, OpenApiSchema>
    parameters?: Record<string, OpenApiParameter>
    requestBodies?: Record<string, OpenApiRequestBody>
  }
  paths: Record<string, OpenApiPathItem>
}

type OpenApiPathItem = {
  parameters?: OpenApiParameterLike[]
} & Partial<Record<HttpMethod, OpenApiOperation>>

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'

type OpenApiOperation = {
  operationId?: string
  summary?: string
  description?: string
  parameters?: OpenApiParameterLike[]
  requestBody?: OpenApiRequestBodyLike
  responses?: Record<string, OpenApiResponseLike>
}

type OpenApiReference = {
  $ref: string
}

type OpenApiParameterLike = OpenApiParameter | OpenApiReference

type OpenApiParameter = {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  schema?: OpenApiSchemaLike
}

type OpenApiRequestBodyLike = OpenApiRequestBody | OpenApiReference

type OpenApiResponseLike = OpenApiResponse | OpenApiReference

type OpenApiResponse = {
  content?: Record<
    string,
    {
      schema?: OpenApiSchemaLike
    }
  >
}

type OpenApiRequestBody = {
  description?: string
  required?: boolean
  content?: Record<
    string,
    {
      schema?: OpenApiSchemaLike
    }
  >
}

type OpenApiSchemaLike = OpenApiSchema | OpenApiReference

type OpenApiSchema = {
  type?: string | string[]
  format?: string
  description?: string
  nullable?: boolean
  enum?: Json[]
  const?: Json
  default?: Json
  properties?: Record<string, OpenApiSchemaLike>
  required?: string[]
  items?: OpenApiSchemaLike
  additionalProperties?: boolean | OpenApiSchemaLike
  allOf?: OpenApiSchemaLike[]
  anyOf?: OpenApiSchemaLike[]
  oneOf?: OpenApiSchemaLike[]
  not?: OpenApiSchemaLike
}

type OperationInputProperty = {
  name: string
  schema: OpenApiSchemaLike
  required: boolean
  description?: string
}

type OperationMetadata = {
  operationId: string
  key: string
  category: string
  clientPath: string[]
  description: string
  pathProperties: OperationInputProperty[]
  queryProperties: OperationInputProperty[]
  bodyProperties: OperationInputProperty[]
  bodySchema?: OpenApiSchemaLike
  hasBody: boolean
  bodyObjectFlattened: boolean
  isStreaming: boolean
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(dirname, '../../../..')
const openApiPath = path.join(repoRoot, 'packages/v0-sdk/openapi.json')
const outputPath = path.join(repoRoot, 'packages/ai-tools/src/generated/tools.ts')

const httpMethods = new Set<HttpMethod>([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
])

async function main() {
  const spec = JSON.parse(await readFile(openApiPath, 'utf8')) as OpenApiDocument
  const operations = collectOperations(spec)

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderTools(operations, spec))
  formatGeneratedFile(outputPath)

  console.log(
    `Generated ${operations.length} AI tools from ${path.relative(repoRoot, openApiPath)}`,
  )
}

function formatGeneratedFile(filePath: string): void {
  const result = spawnSync('oxfmt', [filePath], { stdio: 'inherit' })

  if (result.error && 'code' in result.error && result.error.code === 'ENOENT') {
    return
  }

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`Failed to format generated file ${filePath}`)
  }
}

function collectOperations(spec: OpenApiDocument): OperationMetadata[] {
  const operations: OperationMetadata[] = []

  for (const [urlPath, pathItem] of Object.entries(spec.paths)) {
    for (const [method, maybeOperation] of Object.entries(pathItem)) {
      if (!httpMethods.has(method as HttpMethod) || maybeOperation === undefined) {
        continue
      }

      const operation = maybeOperation as OpenApiOperation
      if (!operation.operationId) {
        throw new Error(`${method.toUpperCase()} ${urlPath} is missing operationId`)
      }

      const operationId = operation.operationId
      const operationSegments = operationId.split('.')
      const pathAndOperationParameters = [
        ...(pathItem.parameters ?? []),
        ...(operation.parameters ?? []),
      ].map((parameter) => resolveReference(spec, parameter))

      const pathProperties = pathAndOperationParameters
        .filter((parameter) => parameter.in === 'path')
        .map((parameter) => parameterToInputProperty(parameter, true))

      const queryProperties = pathAndOperationParameters
        .filter((parameter) => parameter.in === 'query')
        .map((parameter) => parameterToInputProperty(parameter, Boolean(parameter.required)))

      const requestBody = operation.requestBody
        ? resolveReference(spec, operation.requestBody)
        : undefined
      const requestBodySchema = requestBody ? getJsonRequestBodySchema(requestBody) : undefined
      const bodyProperties = requestBodySchema
        ? schemaToBodyInputProperties(spec, requestBodySchema, Boolean(requestBody?.required))
        : []

      assertNoInputCollisions(operationId, [
        ...pathProperties,
        ...queryProperties,
        ...bodyProperties,
      ])

      operations.push({
        operationId,
        key: toCanonicalToolKey(operationId),
        category: operationSegments[0] ?? 'default',
        clientPath: operationSegments,
        description: getOperationDescription(operation),
        pathProperties,
        queryProperties,
        bodyProperties,
        bodySchema: requestBodySchema,
        hasBody: requestBodySchema !== undefined,
        bodyObjectFlattened:
          bodyProperties.length > 0 &&
          !(bodyProperties.length === 1 && bodyProperties[0]?.name === 'body'),
        isStreaming: operationHasEventStreamResponse(spec, operation),
      })
    }
  }

  operations.sort((left, right) => left.operationId.localeCompare(right.operationId))
  assertUnique(
    operations.map((operation) => operation.key),
    'tool key',
  )
  return operations
}

function getOperationDescription(operation: OpenApiOperation): string {
  const summary = normalizeDescription(operation.summary)
  const description = normalizeDescription(operation.description)

  if (summary && description && summary !== description) {
    return `${summary}: ${description}`
  }

  return summary ?? description ?? operation.operationId ?? 'v0 API operation'
}

function normalizeDescription(value: string | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim()
  return normalized === '' ? undefined : normalized
}

function parameterToInputProperty(
  parameter: OpenApiParameter,
  required: boolean,
): OperationInputProperty {
  return {
    name: parameter.name,
    schema: parameter.schema ?? { type: 'string' },
    required,
    description: parameter.description,
  }
}

function getJsonRequestBodySchema(requestBody: OpenApiRequestBody): OpenApiSchemaLike | undefined {
  const content = requestBody.content
  if (!content) {
    return undefined
  }

  return (
    content['application/json']?.schema ??
    content['application/vnd.api+json']?.schema ??
    Object.entries(content).find(([contentType]) => contentType.includes('json'))?.[1].schema
  )
}

function operationHasEventStreamResponse(
  spec: OpenApiDocument,
  operation: OpenApiOperation,
): boolean {
  return Object.values(operation.responses ?? {}).some((responseLike) => {
    const response = resolveReference(spec, responseLike)

    return Object.keys(response.content ?? {}).some((contentType) =>
      contentType.includes('text/event-stream'),
    )
  })
}

function schemaToBodyInputProperties(
  spec: OpenApiDocument,
  schemaLike: OpenApiSchemaLike,
  bodyRequired: boolean,
): OperationInputProperty[] {
  const objectSchema = resolveObjectSchema(spec, schemaLike)

  if (!objectSchema?.properties) {
    return [
      {
        name: 'body',
        schema: schemaLike,
        required: bodyRequired,
        description: objectSchema?.description,
      },
    ]
  }

  const required = new Set(objectSchema.required ?? [])

  return Object.entries(objectSchema.properties).map(([name, propertySchema]) => {
    const resolvedProperty = resolveReference(spec, propertySchema)

    return {
      name,
      schema: propertySchema,
      required: bodyRequired && required.has(name),
      description: 'description' in resolvedProperty ? resolvedProperty.description : undefined,
    }
  })
}

function resolveObjectSchema(
  spec: OpenApiDocument,
  schemaLike: OpenApiSchemaLike,
): OpenApiSchema | undefined {
  const schema = resolveReference(spec, schemaLike)

  if (schema.allOf) {
    return schema.allOf.reduce<OpenApiSchema>(
      (merged, child) => mergeObjectSchemas(merged, resolveObjectSchema(spec, child)),
      { type: 'object', properties: {}, required: [] },
    )
  }

  if (schema.type === 'object' || schema.properties) {
    return schema
  }

  return undefined
}

function mergeObjectSchemas(left: OpenApiSchema, right: OpenApiSchema | undefined): OpenApiSchema {
  if (!right) {
    return left
  }

  return {
    ...left,
    ...right,
    properties: {
      ...(left.properties ?? {}),
      ...(right.properties ?? {}),
    },
    required: [...(left.required ?? []), ...(right.required ?? [])],
  }
}

function renderTools(operations: OperationMetadata[], spec: OpenApiDocument): string {
  const categories = [...new Set(operations.map((operation) => operation.category))].sort()
  const schemaDeclarations = operations
    .map((operation) => renderInputSchemaDeclaration(spec, operation))
    .join('\n\n')
  const flatEntries = operations.map((operation) => renderToolEntry(operation)).join('\n')
  const categoryEntries = categories
    .map((category) => renderCategoryEntry(category, operations))
    .join('\n')
  const toolNameType = operations
    .map((operation) => `  | ${JSON.stringify(operation.key)}`)
    .join('\n')
  const categoryTypeEntries = categories
    .map((category) => renderCategoryTypeEntry(category, operations))
    .join('\n')

  return `${generatedHeader()}
import { tool, type ToolSet } from 'ai'
import { createV0Client } from 'v0'
import type { createV0Client as createV0ClientType } from 'v0'
import { z } from 'zod'

export type V0ToolsConfig = Parameters<typeof createV0ClientType>[0] & {
  apiKey?: string
}

type V0GeneratedTool = NonNullable<ToolSet[string]>

export type V0ToolName =
${toolNameType}

export type V0ToolsFlat = Record<V0ToolName, V0GeneratedTool>

export type V0ToolsByCategory = {
${categoryTypeEntries}
}

export type V0ToolCategory = keyof V0ToolsByCategory

${schemaDeclarations}

export function v0Tools(config: V0ToolsConfig = {}): V0ToolsFlat {
  const client = createV0Client(resolveV0ToolsConfig(config))

  return {
${flatEntries}
  } satisfies V0ToolsFlat
}

export function v0ToolsByCategory(config: V0ToolsConfig = {}): V0ToolsByCategory {
  const tools = v0Tools(config)

  return {
${categoryEntries}
  }
}

function resolveV0ToolsConfig(config: V0ToolsConfig): Parameters<typeof createV0ClientType>[0] {
  const { apiKey, ...clientConfig } = config
  const envAuth =
    typeof process !== 'undefined' ? process.env["VERCEL_TOKEN"] ?? process.env["V0_API_KEY"] : undefined
  const auth = clientConfig.auth ?? apiKey ?? envAuth

  return auth === undefined ? clientConfig : { ...clientConfig, auth }
}

function pickTool(tools: V0ToolsFlat, key: V0ToolName): V0GeneratedTool {
  const selected = tools[key]
  if (!selected) {
    throw new Error(\`Missing generated v0 tool: \${key}\`)
  }

  return selected
}

function toToolResult(result: unknown): unknown {
  if (result && typeof result === 'object' && ('data' in result || 'error' in result)) {
    const response = result as { data?: unknown; error?: unknown }

    if (response.error !== undefined) {
      return { error: response.error }
    }

    return response.data ?? null
  }

  return result
}
`
}

function generatedHeader(): string {
  return `// This file is generated by packages/ai-tools/src/scripts/generate.ts.
// Do not edit this file directly.
`
}

function renderInputSchemaDeclaration(spec: OpenApiDocument, operation: OperationMetadata): string {
  if (
    operation.hasBody &&
    !operation.bodyObjectFlattened &&
    operation.bodySchema &&
    operation.pathProperties.length === 0 &&
    operation.queryProperties.length === 0
  ) {
    return `const ${operation.key}InputSchema = ${schemaToZodExpression(spec, operation.bodySchema)}`
  }

  const properties = [
    ...operation.pathProperties,
    ...operation.queryProperties,
    ...operation.bodyProperties,
  ]
  const objectProperties = properties
    .map((property) => renderObjectProperty(spec, property))
    .join('\n')

  return `const ${operation.key}InputSchema = z.object({
${objectProperties}
})`
}

function renderObjectProperty(spec: OpenApiDocument, property: OperationInputProperty): string {
  const schemaExpression = applyOptionality(
    withDescription(schemaToZodExpression(spec, property.schema), property.description),
    property.required,
  )

  return `  ${quoteProperty(property.name)}: ${schemaExpression},`
}

function applyOptionality(schemaExpression: string, required: boolean): string {
  return required ? schemaExpression : `${schemaExpression}.optional()`
}

function renderToolEntry(operation: OperationMetadata): string {
  const executeParameters = operationUsesInput(operation) ? 'input' : ''
  const executeDeclaration = operation.isStreaming
    ? `async function* (${executeParameters})`
    : `async (${executeParameters}) =>`

  return `    ${quoteProperty(operation.key)}: tool({
      description: ${JSON.stringify(operation.description)},
      inputSchema: ${operation.key}InputSchema,
      execute: ${executeDeclaration} {
${renderExecuteBody(operation)}
      },
    }),`
}

function renderExecuteBody(operation: OperationMetadata): string {
  const methodPath = ['client', ...operation.clientPath].join('.')

  if (!operationUsesInput(operation)) {
    if (operation.isStreaming) {
      return `        const result = await ${methodPath}()
        yield* result.stream`
    }

    return `        return toToolResult(await ${methodPath}())`
  }

  if (operation.isStreaming) {
    return `${renderParametersSetup(operation)}
        const result = await ${methodPath}(parameters)
        yield* result.stream`
  }

  return `${renderParametersSetup(operation)}
        return toToolResult(await ${methodPath}(parameters))`
}

function renderParametersSetup(operation: OperationMetadata): string {
  if (operation.hasBody && !operation.bodyObjectFlattened) {
    if (operation.pathProperties.length === 0 && operation.queryProperties.length === 0) {
      return `        const parameters = input as Record<string, unknown>`
    }

    return `        const parameters = {
${renderParameterEntries([...operation.pathProperties, ...operation.queryProperties])}
          body: input.body,
        }`
  }

  const properties = [
    ...operation.pathProperties,
    ...operation.queryProperties,
    ...operation.bodyProperties,
  ]

  return `        const parameters = {
${renderParameterEntries(properties)}
        }`
}

function renderParameterEntries(properties: OperationInputProperty[]): string {
  return properties
    .map(
      (property) =>
        `          ${quoteProperty(property.name)}: input.${accessProperty(property.name)},`,
    )
    .join('\n')
}

function renderCategoryEntry(category: string, operations: OperationMetadata[]): string {
  const entries = operations
    .filter((operation) => operation.category === category)
    .map(
      (operation) =>
        `      ${quoteProperty(operation.key)}: pickTool(tools, ${JSON.stringify(operation.key)}),`,
    )
    .join('\n')

  return `    ${quoteProperty(category)}: {
${entries}
    },`
}

function renderCategoryTypeEntry(category: string, operations: OperationMetadata[]): string {
  const operationKeys = operations
    .filter((operation) => operation.category === category)
    .map((operation) => JSON.stringify(operation.key))
    .join(' | ')

  return `  ${quoteProperty(category)}: Pick<V0ToolsFlat, ${operationKeys}>`
}

function operationUsesInput(operation: OperationMetadata): boolean {
  return (
    operation.pathProperties.length > 0 || operation.queryProperties.length > 0 || operation.hasBody
  )
}

function schemaToZodExpression(spec: OpenApiDocument, schemaLike: OpenApiSchemaLike): string {
  const schema = resolveReference(spec, schemaLike)
  const nullable = schema.nullable || (Array.isArray(schema.type) && schema.type.includes('null'))
  const withoutNullType = Array.isArray(schema.type)
    ? { ...schema, type: schema.type.filter((type) => type !== 'null') }
    : schema

  let expression = schemaToNonNullableZodExpression(spec, withoutNullType)

  if (nullable) {
    expression = `${expression}.nullable()`
  }

  return expression
}

function schemaToNonNullableZodExpression(spec: OpenApiDocument, schema: OpenApiSchema): string {
  if (schema.const !== undefined) {
    return `z.literal(${JSON.stringify(schema.const)})`
  }

  if (schema.enum) {
    return enumToZodExpression(schema.enum)
  }

  if (schema.allOf?.length) {
    return schema.allOf
      .map((child) => schemaToZodExpression(spec, child))
      .reduce((left, right) => `z.intersection(${left}, ${right})`)
  }

  if (schema.anyOf?.length) {
    return unionToZodExpression(spec, schema.anyOf)
  }

  if (schema.oneOf?.length) {
    return unionToZodExpression(spec, schema.oneOf)
  }

  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type

  if (type === 'string') {
    return stringToZodExpression(schema)
  }

  if (type === 'integer') {
    return 'z.number().int()'
  }

  if (type === 'number') {
    return 'z.number()'
  }

  if (type === 'boolean') {
    return 'z.boolean()'
  }

  if (type === 'array' || schema.items) {
    return `z.array(${schema.items ? schemaToZodExpression(spec, schema.items) : 'z.unknown()'})`
  }

  if (type === 'object' || schema.properties || schema.additionalProperties) {
    return objectToZodExpression(spec, schema)
  }

  return 'z.unknown()'
}

function enumToZodExpression(values: Json[]): string {
  const stringValues = values.filter((value): value is string => typeof value === 'string')

  if (stringValues.length === values.length && stringValues.length > 0) {
    return `z.enum([${stringValues.map((value) => JSON.stringify(value)).join(', ')}])`
  }

  if (values.length === 1) {
    return `z.literal(${JSON.stringify(values[0])})`
  }

  if (values.length > 1) {
    return `z.union([${values.map((value) => `z.literal(${JSON.stringify(value)})`).join(', ')}])`
  }

  return 'z.never()'
}

function stringToZodExpression(schema: OpenApiSchema): string {
  if (schema.format === 'date-time') {
    return 'z.string().datetime()'
  }

  if (schema.format === 'date') {
    return 'z.string().date()'
  }

  if (schema.format === 'uri' || schema.format === 'url') {
    return 'z.string().url()'
  }

  return 'z.string()'
}

function objectToZodExpression(spec: OpenApiDocument, schema: OpenApiSchema): string {
  const required = new Set(schema.required ?? [])

  if (schema.properties) {
    const properties = Object.entries(schema.properties)
      .map(([name, propertySchema]) => {
        const resolvedProperty = resolveReference(spec, propertySchema)
        const description =
          'description' in resolvedProperty ? resolvedProperty.description : undefined
        const expression = applyOptionality(
          withDescription(schemaToZodExpression(spec, propertySchema), description),
          required.has(name),
        )

        return `  ${quoteProperty(name)}: ${expression},`
      })
      .join('\n')

    return `z.object({
${properties}
})`
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    return `z.record(z.string(), ${schemaToZodExpression(spec, schema.additionalProperties)})`
  }

  return 'z.record(z.string(), z.unknown())'
}

function unionToZodExpression(spec: OpenApiDocument, schemas: OpenApiSchemaLike[]): string {
  if (schemas.length === 1) {
    return schemaToZodExpression(spec, schemas[0]!)
  }

  return `z.union([${schemas.map((schema) => schemaToZodExpression(spec, schema)).join(', ')}])`
}

function withDescription(expression: string, description: string | undefined): string {
  return description ? `${expression}.describe(${JSON.stringify(description)})` : expression
}

function resolveReference<T>(spec: OpenApiDocument, value: T | OpenApiReference): T {
  if (!isReference(value)) {
    return value
  }

  const pointerParts = value.$ref.replace(/^#\//, '').split('/')
  let current: unknown = spec

  for (const part of pointerParts) {
    if (current === null || typeof current !== 'object') {
      throw new Error(`Invalid OpenAPI reference ${value.$ref}`)
    }

    current = (current as Record<string, unknown>)[part.replaceAll('~1', '/').replaceAll('~0', '~')]
  }

  if (current === undefined) {
    throw new Error(`Unable to resolve OpenAPI reference ${value.$ref}`)
  }

  return current as T
}

function isReference(value: unknown): value is OpenApiReference {
  return Boolean(value && typeof value === 'object' && '$ref' in value)
}

function toCanonicalToolKey(operationId: string): string {
  return operationId
    .split('.')
    .map((segment, index) => {
      const camelSegment = toCamelCase(segment)
      return index === 0 ? lowerFirst(camelSegment) : upperFirst(camelSegment)
    })
    .join('')
}

function toCamelCase(value: string): string {
  const [first = '', ...rest] = value.split(/[^a-zA-Z0-9]+/).filter(Boolean)
  return [lowerFirst(first), ...rest.map(upperFirst)].join('')
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1)
}

function upperFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function quoteProperty(name: string): string {
  return /^[a-zA-Z_$][\w$]*$/.test(name) ? name : JSON.stringify(name)
}

function accessProperty(name: string): string {
  return /^[a-zA-Z_$][\w$]*$/.test(name) ? name : `[${JSON.stringify(name)}]`
}

function assertNoInputCollisions(operationId: string, properties: OperationInputProperty[]): void {
  const names = new Set<string>()

  for (const property of properties) {
    if (names.has(property.name)) {
      throw new Error(`${operationId} has multiple input fields named ${property.name}`)
    }

    names.add(property.name)
  }
}

function assertUnique(values: string[], label: string): void {
  const seen = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`)
    }

    seen.add(value)
  }
}

await main()
