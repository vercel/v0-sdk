import { expect, test } from 'bun:test'
import { collectOperations } from '../src/scripts/generate'

test('skips operations that opt out of agent tools', () => {
  const spec: Parameters<typeof collectOperations>[0] = {
    paths: {
      '/kept': { get: { operationId: 'kept.get' } },
      '/opted-out': { put: { operationId: 'optedOut.set', 'x-v0-mcp-tool': false } },
      '/opted-in': { put: { operationId: 'optedIn.set', 'x-v0-mcp-tool': true } },
    },
  }

  expect(collectOperations(spec).map(({ operationId }) => operationId)).toEqual([
    'kept.get',
    'optedIn.set',
  ])
})
