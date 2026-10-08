import { describe, expect, test } from 'bun:test'
import { resolve } from 'node:path'
import * as browser from '../browser'
import * as server from '../index'

describe('Design Mode entrypoints', () => {
  test('only exposes the DOM bridge from the browser-safe entrypoint', () => {
    expect(typeof browser.createDesignModeBridge).toBe('function')
    expect('createDesignModeBridge' in server).toBe(false)
    expect(browser.toDesignModeMessage).toBe(server.toDesignModeMessage)
    expect(browser.parseDesignModeMessage).toBe(server.parseDesignModeMessage)
  })

  test('browser entrypoint bundles without Node or authenticated-client dependencies', async () => {
    const result = await Bun.build({
      entrypoints: [resolve(__dirname, '../browser.ts')],
      format: 'esm',
      target: 'browser',
      minify: true,
    })
    expect(result.success).toBe(true)
    const output = await result.outputs[0]!.text()
    expect(output).not.toContain('V0_API_KEY')
    expect(output).not.toContain('node:async_hooks')
    expect(output).not.toContain('getVercelOidcToken')
  })

  test('pure payload helpers bundle without the runtime channel', async () => {
    const result = await Bun.build({
      entrypoints: [resolve(__dirname, './payload.ts')],
      format: 'esm',
      target: 'browser',
      minify: true,
    })
    expect(result.success).toBe(true)
    expect(await result.outputs[0]!.text()).not.toContain('bidc-connect')
  })
})
