import { GlobalRegistrator } from '@happy-dom/global-registrator'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

const preservedGlobals = [
  'AbortController',
  'AbortSignal',
  'Blob',
  'crypto',
  'fetch',
  'File',
  'FormData',
  'Headers',
  'MessageChannel',
  'MessagePort',
  'performance',
  'queueMicrotask',
  'ReadableStream',
  'Request',
  'Response',
  'structuredClone',
  'TextDecoder',
  'TextDecoderStream',
  'TextEncoder',
  'TextEncoderStream',
  'TransformStream',
  'URL',
  'URLSearchParams',
  'WritableStream',
] as const

const globalRecord = globalThis as unknown as Record<string, unknown>
const snapshot = new Map<string, unknown>()

for (const key of preservedGlobals) {
  if (key in globalRecord) {
    snapshot.set(key, globalRecord[key])
  }
}

GlobalRegistrator.register()

for (const [key, value] of snapshot) {
  globalRecord[key] = value
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true
