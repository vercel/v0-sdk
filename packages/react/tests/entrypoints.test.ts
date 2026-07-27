import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import * as root from '../src'
import * as swr from '../src/swr'

describe('package entrypoints', () => {
  test('keeps every generated SWR hook off the cache-agnostic root', () => {
    for (const hookName of Object.values(swr.V0_REACT_OPERATION_HOOKS)) {
      expect(typeof swr[hookName]).toBe('function')
      expect(hookName in root).toBe(false)
    }
  })

  test('the root source graph has no SWR runtime import', async () => {
    const result = await Bun.build({
      entrypoints: [fileURLToPath(new URL('../src/index.ts', import.meta.url))],
      format: 'esm',
      minify: true,
      packages: 'external',
      target: 'browser',
    })

    expect(result.success).toBe(true)
    const output = await result.outputs[0]!.text()
    expect(output).not.toMatch(/from["']swr(?:\/|["'])/)
  })

  test('publishes the explicit SWR subpath', async () => {
    const packageJson = JSON.parse(
      await readFile(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { exports: Record<string, unknown>; peerDependenciesMeta?: Record<string, unknown> }

    expect(packageJson.exports['./swr']).toBeDefined()
    expect(packageJson.peerDependenciesMeta?.['swr']).toEqual({ optional: true })
  })
})
