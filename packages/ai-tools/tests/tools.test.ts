import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type OpenApiDocument = {
  paths: Record<string, Record<string, { operationId?: string }>>
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(dirname, '../../..')
const openApi = JSON.parse(
  readFileSync(path.join(repoRoot, 'packages/v0-sdk/openapi.json'), 'utf8'),
) as OpenApiDocument

const httpMethods = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'])

const operationIds = Object.values(openApi.paths)
  .flatMap((pathItem) =>
    Object.entries(pathItem)
      .filter(([method]) => httpMethods.has(method))
      .map(([, operation]) => operation.operationId),
  )
  .filter((operationId): operationId is string => operationId !== undefined)
  .sort()

const operationKeys = operationIds.map(toCanonicalToolKey).sort()

let currentClient: unknown = {}

mock.module('v0', () => ({
  createV0Client: () => currentClient,
}))

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

describe('generated v0 tools', () => {
  beforeEach(() => {
    currentClient = {}
  })

  test('flat tools contain every OpenAPI operation', async () => {
    const { v0Tools } = await import('../src')
    const tools = v0Tools({ auth: 'test-key' })

    expect(Object.keys(tools).sort()).toEqual(operationKeys)
  })

  test('tools are grouped by first operationId segment', async () => {
    const { v0ToolsByCategory } = await import('../src')
    const toolsByCategory = v0ToolsByCategory({ auth: 'test-key' })
    const expectedCategories = [
      ...new Set(
        operationIds.map((operationId) => {
          const [category] = operationId.split('.')
          if (!category) {
            throw new Error(`Invalid operationId: ${operationId}`)
          }

          return category
        }),
      ),
    ].sort()

    expect(Object.keys(toolsByCategory).sort()).toEqual(expectedCategories)

    for (const category of expectedCategories) {
      const expectedKeys = operationIds
        .filter((operationId) => operationId.startsWith(`${category}.`))
        .map(toCanonicalToolKey)
        .sort()

      expect(Object.keys(toolsByCategory[category as keyof typeof toolsByCategory]).sort()).toEqual(
        expectedKeys,
      )
    }
  })

  test('generated tools include description, inputSchema, and execute', async () => {
    const { v0Tools } = await import('../src')
    const tools = v0Tools({ auth: 'test-key' })

    for (const key of operationKeys as Array<keyof typeof tools>) {
      const generatedTool = tools[key]
      expect(generatedTool).toBeDefined()
      expect(generatedTool?.description).toBeString()
      expect(generatedTool?.inputSchema).toBeDefined()
      expect(generatedTool?.execute).toBeFunction()
    }
  })

  test('generated Zod schemas validate required body and path fields', async () => {
    const { v0Tools } = await import('../src')
    const tools = v0Tools({ auth: 'test-key' })
    const messagesSend = tools['messagesSend']
    if (!messagesSend) {
      throw new Error('messagesSend tool was not generated')
    }

    const inputSchema = messagesSend.inputSchema as {
      safeParse(input: unknown): { success: boolean }
    }

    expect(
      inputSchema.safeParse({
        chatId: 'chat_123',
        message: 'Build a dashboard',
      }).success,
    ).toBe(true)

    expect(
      inputSchema.safeParse({
        message: 'Build a dashboard',
      }).success,
    ).toBe(false)
  })

  test('execute routes flat fields to the matching SDK method', async () => {
    const calls: unknown[] = []
    currentClient = {
      messages: {
        send: mock((options: unknown) => {
          calls.push(options)
          return {
            data: { id: 'message_123' },
            error: undefined,
            request: new Request('https://v0.app/api/v2/chats/chat_123/messages'),
            response: new Response('{}'),
          }
        }),
      },
    }

    const { v0Tools } = await import('../src')
    const tools = v0Tools({ auth: 'test-key' })
    const messagesSend = tools['messagesSend']
    if (!messagesSend?.execute) {
      throw new Error('messagesSend execute was not generated')
    }

    const result = await messagesSend.execute(
      {
        chatId: 'chat_123',
        message: 'Build a dashboard',
      },
      { toolCallId: 'tool_call_123', messages: [] },
    )

    expect(result).toEqual({ id: 'message_123' })
    expect(structuredClone(result)).toEqual({ id: 'message_123' })
    expect(calls).toEqual([
      {
        chatId: 'chat_123',
        message: 'Build a dashboard',
      },
    ])
  })

  test('streaming execute yields SDK stream events', async () => {
    const calls: unknown[] = []
    async function* streamEvents() {
      yield { type: 'chunk', value: 'one' }
      yield { type: 'chunk', value: 'two' }
    }

    currentClient = {
      messages: {
        sendStream: mock((options: unknown) => {
          calls.push(options)
          return { stream: streamEvents() }
        }),
      },
    }

    const { v0Tools } = await import('../src')
    const tools = v0Tools({ auth: 'test-key' })
    const messagesSendStream = tools['messagesSendStream']
    if (!messagesSendStream?.execute) {
      throw new Error('messagesSendStream execute was not generated')
    }

    const result = messagesSendStream.execute(
      {
        chatId: 'chat_123',
        message: 'Build a dashboard',
      },
      { toolCallId: 'tool_call_123', messages: [] },
    )

    expect(typeof (result as AsyncIterable<unknown>)[Symbol.asyncIterator]).toBe('function')

    const events = []
    for await (const event of result as AsyncIterable<unknown>) {
      events.push(event)
    }

    expect(events).toEqual([
      { type: 'chunk', value: 'one' },
      { type: 'chunk', value: 'two' },
    ])
    expect(calls).toEqual([
      {
        chatId: 'chat_123',
        message: 'Build a dashboard',
      },
    ])
  })

  test('execute routes nested operationIds to nested SDK clients', async () => {
    const calls: unknown[] = []
    currentClient = {
      organizations: {
        teams: {
          listApiKeys: mock((options: unknown) => {
            calls.push(options)
            return {
              data: { data: [] },
              error: undefined,
              request: new Request(
                'https://v0.app/api/v2/organizations/org_123/teams/team_123/keys',
              ),
              response: new Response('{}'),
            }
          }),
        },
      },
    }

    const { v0Tools } = await import('../src')
    const tools = v0Tools({ auth: 'test-key' })
    const listApiKeys = tools['organizationsTeamsListApiKeys']
    if (!listApiKeys?.execute) {
      throw new Error('organizationsTeamsListApiKeys execute was not generated')
    }

    const result = await listApiKeys.execute(
      {
        orgId: 'org_123',
        teamId: 'team_123',
      },
      { toolCallId: 'tool_call_123', messages: [] },
    )

    expect(result).toEqual({ data: [] })
    expect(structuredClone(result)).toEqual({ data: [] })
    expect(calls).toEqual([
      {
        orgId: 'org_123',
        teamId: 'team_123',
      },
    ])
  })
})
