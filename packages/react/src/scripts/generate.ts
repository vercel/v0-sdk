import { spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { V0Sdk } from 'v0/browser'

type HttpMethod = 'get' | 'post' | 'patch' | 'delete' | 'put'
type Parameter = {
  name?: string
  in?: 'path' | 'query' | 'header'
  required?: boolean
}
type Response = { description?: string; content?: Record<string, unknown> }
type OperationObject = {
  operationId?: string
  parameters?: Parameter[]
  requestBody?: unknown
  responses?: Record<string, Response>
}
type PathItem = Partial<Record<HttpMethod, OperationObject>> & {
  parameters?: Parameter[]
}
type OpenApiDocument = { paths: Record<string, PathItem> }

type V0SdkOperationId = {
  [Resource in keyof V0Sdk & string]: `${Resource}.${keyof V0Sdk[Resource] & string}`
}[keyof V0Sdk & string]

type Operation = {
  operationId: keyof typeof semanticNames
  publicName: string
  typePrefix: string
  httpMethod: Uppercase<HttpMethod>
  queryParameters: Parameter[]
  hasBody: boolean
  responseKind: 'json' | 'stream' | 'blob'
  paginated: boolean
  invalidates?: readonly V0SdkOperationId[]
  transformer?: string
}

const semanticNames = {
  'chats.create': 'useCreateChatBlocking',
  'chats.list': 'useChats',
  'chats.createFromFiles': 'useCreateChatFromFiles',
  'chats.createFromZip': 'useCreateChatFromZip',
  'chats.createFromRepo': 'useCreateChatFromRepo',
  'chats.createStream': 'useCreateChat',
  'chats.createAsync': 'useCreateChatAsync',
  'messages.list': 'useMessages',
  'messages.send': 'useSendMessageBlocking',
  'messages.get': 'useMessage',
  'messages.sendStream': 'useSendMessage',
  'messages.sendAsync': 'useSendMessageAsync',
  'messages.resolve': 'useResolveTaskBlocking',
  'messages.resolveStream': 'useResolveTask',
  'messages.resolveAsync': 'useResolveTaskAsync',
  'messages.stop': 'useStopMessage',
  'chats.get': 'useChat',
  'chats.update': 'useUpdateChat',
  'chats.delete': 'useDeleteChat',
  'chats.getPreview': 'usePreview',
  'chats.getFiles': 'useFiles',
  'chats.getConnectStatus': 'useConnectStatus',
  'chats.updateFiles': 'useUpdateChatFiles',
  'chats.downloadFiles': 'useDownloadChatFiles',
  'chats.restoreMessage': 'useRestoreMessage',
  'chats.duplicate': 'useDuplicateChat',
  'chats.deploy': 'useDeployChat',
  'chats.createVercelProject': 'useCreateProject',
  'chats.resume': 'useResumeChat',
  'mcpServers.list': 'useMcpServers',
  'mcpServers.create': 'useCreateMcpServer',
  'mcpServers.get': 'useMcpServer',
  'mcpServers.update': 'useUpdateMcpServer',
  'mcpServers.delete': 'useDeleteMcpServer',
  'settings.getPreviewHosts': 'usePreviewHosts',
  'settings.setPreviewHosts': 'useSetPreviewHosts',
  'webhooks.list': 'useWebhooks',
  'webhooks.create': 'useCreateWebhook',
  'webhooks.get': 'useWebhook',
  'webhooks.update': 'useUpdateWebhook',
  'webhooks.delete': 'useDeleteWebhook',
} as const satisfies Record<V0SdkOperationId, string>

const mutationInvalidations: Partial<Record<V0SdkOperationId, readonly V0SdkOperationId[]>> = {
  'chats.delete': ['chats.list'],
  'chats.restoreMessage': ['chats.getFiles', 'messages.list'],
  'chats.update': ['chats.get', 'chats.list'],
  'chats.updateFiles': ['chats.getFiles', 'messages.list'],
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(dirname, '../../../..')
const openApiPath = path.join(repoRoot, 'packages/v0-sdk/openapi.json')
const transformersPath = path.join(repoRoot, 'packages/v0-sdk/src/generated/transformers.gen.ts')
const outputPath = path.join(repoRoot, 'packages/react/src/generated/swr.ts')

async function main() {
  const spec = JSON.parse(await readFile(openApiPath, 'utf8')) as OpenApiDocument
  const transformerSource = await readFile(transformersPath, 'utf8')
  const availableTransformers = new Set(
    [...transformerSource.matchAll(/export const (\w+ResponseTransformer)\s*=/g)].map(
      (match) => match[1]!,
    ),
  )
  const operations = collectOperations(spec, availableTransformers)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, render(operations))
  format(outputPath)
  console.log(`Generated ${operations.length} SWR hooks from packages/v0-sdk/openapi.json`)
}

function collectOperations(spec: OpenApiDocument, availableTransformers: Set<string>): Operation[] {
  const operations: Operation[] = []
  const foundIds = new Set<string>()
  const foundNames = new Set<string>()
  const methods = new Set<HttpMethod>(['get', 'post', 'patch', 'delete', 'put'])

  for (const [route, pathItem] of Object.entries(spec.paths)) {
    for (const [method, value] of Object.entries(pathItem)) {
      if (!methods.has(method as HttpMethod) || !value) continue
      const operation = value as OperationObject
      if (!operation.operationId) {
        throw new Error(`OpenAPI operation ${method.toUpperCase()} ${route} is missing operationId`)
      }
      if (foundIds.has(operation.operationId)) {
        throw new Error(`Duplicate OpenAPI operationId ${operation.operationId}`)
      }
      if (!(operation.operationId in semanticNames)) {
        throw new Error(
          `OpenAPI operation ${operation.operationId} has no semantic React hook name`,
        )
      }

      const operationId = operation.operationId as keyof typeof semanticNames
      const publicName = semanticNames[operationId]
      if (foundNames.has(publicName)) {
        throw new Error(`Duplicate semantic React hook name ${publicName}`)
      }
      foundIds.add(operationId)
      foundNames.add(publicName)

      const parameters = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]
      const successResponses = Object.entries(operation.responses ?? {})
        .filter(([status]) => /^2\d\d$/.test(status))
        .map(([, response]) => response)
      const contentTypes = successResponses.flatMap((response) =>
        Object.keys(response.content ?? {}),
      )
      const responseKind = contentTypes.includes('text/event-stream')
        ? 'stream'
        : operationId === 'chats.downloadFiles' ||
            contentTypes.some((type) => type.includes('zip') || type.includes('octet-stream')) ||
            successResponses.some((response) => /\bzip\b|binary/i.test(response.description ?? ''))
          ? 'blob'
          : 'json'
      const typePrefix = toTypePrefix(operationId)
      const transformer = `${lowerFirst(typePrefix)}ResponseTransformer`
      const invalidates = mutationInvalidations[operationId]

      operations.push({
        operationId,
        publicName,
        typePrefix,
        httpMethod: method.toUpperCase() as Uppercase<HttpMethod>,
        queryParameters: parameters.filter((parameter) => parameter.in === 'query'),
        hasBody: operation.requestBody !== undefined,
        responseKind,
        paginated: parameters.some(
          (parameter) => parameter.in === 'query' && parameter.name === 'cursor',
        ),
        ...(invalidates ? { invalidates } : {}),
        ...(availableTransformers.has(transformer) ? { transformer } : {}),
      })
    }
  }

  for (const [operationId, publicName] of Object.entries(semanticNames)) {
    if (!foundIds.has(operationId)) {
      throw new Error(
        `Semantic React hook ${publicName} refers to missing OpenAPI operation ${operationId}`,
      )
    }
  }

  return operations.sort((left, right) => left.operationId.localeCompare(right.operationId))
}

function render(operations: Operation[]): string {
  const typeImports = new Set<string>()
  const transformerImports = new Set<string>()
  for (const operation of operations) {
    if (operation.queryParameters.length || operation.hasBody) {
      typeImports.add(`${operation.typePrefix}Data`)
    }
    typeImports.add(`${operation.typePrefix}Error`)
    if (operation.responseKind === 'json') {
      typeImports.add(`${operation.typePrefix}Response`)
    }
    if (operation.transformer) transformerImports.add(operation.transformer)
  }

  const operationMap = operations
    .map((operation) => `  '${operation.operationId}': '${operation.publicName}',`)
    .join('\n')
  const transformerBlock = transformerImports.size
    ? `import {\n${[...transformerImports]
        .sort()
        .map((name) => `  ${name},`)
        .join('\n')}\n} from 'v0/browser'\n`
    : ''

  return `// This file is generated from packages/v0-sdk/openapi.json. Do not edit.\n\n${transformerBlock}import type {\n${[
    ...typeImports,
  ]
    .sort()
    .map((name) => `  ${name},`)
    .join(
      '\n',
    )}\n} from 'v0/browser'\n\nimport type { V0Operation } from '../request'\nimport { useV0CursorQuery, useV0Mutation, useV0Query } from '../swr-runtime'\nimport type {\n  V0InfiniteConfiguration,\n  V0MutationConfiguration,\n  V0QueryConfiguration,\n  V0Url,\n} from '../swr-runtime'\n\nexport const V0_REACT_OPERATION_HOOKS = {\n${operationMap}\n} as const\n\n${operations.map(renderOperation).join('\n')}`
}

function renderOperation(operation: Operation): string {
  const query = renderQuery(operation)
  if (operation.paginated) {
    return `${query}\n${renderInfinite(operation)}`
  }
  if (operation.httpMethod === 'GET' && operation.responseKind !== 'blob') {
    return query
  }
  return renderMutation(operation)
}

function renderOperationDefinition(operation: Operation): string {
  const responseType = getResponseType(operation)
  return `const ${getOperationName(operation)}: V0Operation<${responseType}> = {\n  id: '${operation.operationId}',\n  method: '${operation.httpMethod}',\n  response: '${operation.responseKind}'${operation.transformer ? `,\n  transform: ${operation.transformer}` : ''}${operation.invalidates ? `,\n  invalidates: [${operation.invalidates.map((id) => `'${id}'`).join(', ')}]` : ''},\n}`
}

function renderQuery(operation: Operation): string {
  const { typePrefix, publicName } = operation
  const responseType = `${typePrefix}Response`
  const errorType = `${typePrefix}Error`
  const queryRequired = operation.queryParameters.some((parameter) => parameter.required)
  const queryType = operation.queryParameters.length
    ? `NonNullable<${typePrefix}Data['query']>${queryRequired ? '' : ' | undefined'}`
    : 'undefined'
  const paramsLine = operation.queryParameters.length
    ? `  params${queryRequired ? '' : '?'}: NonNullable<${typePrefix}Data['query']>,\n`
    : ''
  const queryName = operation.queryParameters.length ? 'params' : 'undefined'

  return `${renderOperationDefinition(operation)}\n\nexport function ${publicName}(\n  url: V0Url,\n${paramsLine}  configuration: V0QueryConfiguration<${responseType}, ${errorType}> = {},\n) {\n  return useV0Query<${responseType}, ${errorType}, ${queryType}>(\n    ${getOperationName(operation)},\n    url,\n    ${queryName},\n    configuration,\n  )\n}\n`
}

function renderInfinite(operation: Operation): string {
  const { typePrefix } = operation
  const publicName = `${operation.publicName}Infinite`
  const responseType = `${typePrefix}Response`
  const errorType = `${typePrefix}Error`
  const queryType = `Omit<NonNullable<${typePrefix}Data['query']>, 'cursor'>`
  const requiredQuery = operation.queryParameters.some(
    (parameter) => parameter.name !== 'cursor' && parameter.required,
  )
  const paramsLine = `  params${requiredQuery ? '' : '?'}: ${queryType},`
  const input = requiredQuery ? 'params' : 'params ?? {}'

  return `export function ${publicName}(\n  url: V0Url,\n${paramsLine}\n  configuration: V0InfiniteConfiguration<${responseType}, ${errorType}> = {},\n) {\n  return useV0CursorQuery(\n    ${getOperationName(operation)},\n    url,\n    ${input},\n    (page) => page.cursor,\n    configuration,\n  )\n}\n`
}

function renderMutation(operation: Operation): string {
  const { typePrefix, publicName } = operation
  const responseType = getResponseType(operation)
  const errorType = `${typePrefix}Error`
  const inputType = operation.hasBody ? `${typePrefix}Data['body']` : 'never'
  const inputAlias = `${publicName.slice(3)}Input`

  return `${renderOperationDefinition(operation)}\n\n${operation.hasBody ? `export type ${inputAlias} = ${inputType}\n` : ''}export function ${publicName}(\n  url: string,\n  configuration: V0MutationConfiguration<${responseType}, ${errorType}, ${inputType}> = {},\n) {\n  return useV0Mutation(${getOperationName(operation)}, url, configuration)\n}\n`
}

function getResponseType(operation: Operation): string {
  return operation.responseKind === 'stream'
    ? 'Response'
    : operation.responseKind === 'blob'
      ? 'Blob'
      : `${operation.typePrefix}Response`
}

function getOperationName(operation: Operation): string {
  return `${lowerFirst(operation.publicName.slice(3))}Operation`
}

function toTypePrefix(operationId: string): string {
  return operationId
    .split('.')
    .map((segment) => segment[0]!.toUpperCase() + segment.slice(1))
    .join('')
}

function lowerFirst(value: string): string {
  return value[0]!.toLowerCase() + value.slice(1)
}

function format(file: string) {
  const result = spawnSync(path.join(repoRoot, 'node_modules/.bin/oxfmt'), [file], {
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Failed to format ${file}`)
}

await main()
