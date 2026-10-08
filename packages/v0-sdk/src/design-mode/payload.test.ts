import { describe, expect, test } from 'bun:test'
import { parseDesignModeMessage, toDesignModeMessage } from './payload'
import type { DesignModeEdit, DesignModeMessage } from './types'
import type {
  MessagesSendData,
  MessagesSendAsyncData,
  MessagesSendStreamData,
} from '../generated/types.gen'

const element = { selectorPath: '#heading', tagName: 'h1', textContent: 'Hello' }
const style = {
  type: 'style' as const,
  element,
  changes: { textContent: { from: 'Hello', to: 'Welcome' } },
}
const edits: DesignModeEdit[] = [
  style,
  { type: 'deleteElement', element },
  { type: 'move', element, position: 'inside', toParentSelector: 'main' },
  { type: 'move', element, position: 'before', targetSelector: 'h2' },
  { type: 'move', element, position: 'after', targetSelector: 'h2' },
  { type: 'fontInjection', fontName: 'Inter' },
]

describe('parseDesignModeMessage', () => {
  test('validates normalized frontend input and strips unrelated backend fields', () => {
    const body = {
      message: 'Only this heading',
      designMode: { edits: [style], element: '#heading', unexpected: 'strip' },
      modelConfiguration: { modelId: 'unexpected' },
      mcpServerIds: ['do-not-enable'],
    }
    expect(parseDesignModeMessage(body)).toEqual({
      message: body.message,
      designMode: { edits: [style], element: '#heading' },
    })
  })

  test.each(['jpeg', 'png', 'webp', 'gif'])('accepts %s screenshot data URIs', (format) => {
    const screenshot = { url: `data:image/${format};base64,aGVsbG8=`, anchorElement: '#heading' }
    expect(
      parseDesignModeMessage({ designMode: { edits: [style], screenshot } }).designMode.screenshot,
    ).toEqual(screenshot)
  })

  test('supports HTTPS screenshots and instructions without explicit edits', () => {
    expect(
      parseDesignModeMessage({
        message: 'Fix this',
        designMode: { screenshot: { url: 'https://assets.example/heading.png' } },
      }),
    ).toEqual({
      message: 'Fix this',
      designMode: { edits: [], screenshot: { url: 'https://assets.example/heading.png' } },
    })
  })

  test.each([
    {},
    { message: 'Hello' },
    { designMode: {} },
    { message: 'Fix this', designMode: { edits: null, element: '#heading' } },
    { message: '', designMode: { edits: [style] } },
    { message: 'Generic', designMode: {} },
    { designMode: { edits: [style], screenshot: { url: 'http://assets.example/image.png' } } },
    {
      designMode: {
        edits: [style],
        screenshot: { url: 'https://user:password@assets.example/image.png' },
      },
    },
    { designMode: { edits: [style], screenshot: { url: 'javascript:alert(1)' } } },
    { designMode: { edits: [style], screenshot: { url: 'data:text/plain;base64,aGVsbG8=' } } },
    { designMode: { edits: [style], screenshot: { url: 'data:image/png;base64,invalid' } } },
  ])('rejects invalid public inputs: %j', (body) => {
    expect(() => parseDesignModeMessage(body)).toThrow(TypeError)
  })

  test('validates the converter result without mutating either input', () => {
    const normalized = toDesignModeMessage({
      edits: [style],
      instructions: { elementScreenshot: 'aGVsbG8=' },
    })
    const before = structuredClone(normalized)
    expect(parseDesignModeMessage(normalized)).toEqual(before)
    expect(normalized).toEqual(before)
  })
})

describe('toDesignModeMessage', () => {
  test.each(edits)('converts a $type edit without instructions', (edit) => {
    expect(toDesignModeMessage({ edits: [edit] })).toEqual({ designMode: { edits: [edit] } })
  })

  test('preserves instructions alongside edits without mutating the payload', () => {
    const payload = {
      edits: [style],
      instructions: { message: 'Only change this heading', element: '#heading' },
    }
    const original = structuredClone(payload)
    const result = toDesignModeMessage(payload)
    expect(result).toEqual({
      message: 'Only change this heading',
      designMode: { edits: [style], element: '#heading' },
    })
    expect(payload).toEqual(original)
    const normalizedEdit = result.designMode.edits?.[0]
    if (normalizedEdit?.type === 'style') normalizedEdit.element.textContent = 'Changed elsewhere'
    expect(payload).toEqual(original)
  })

  test('omits empty instructions so the API does not reject an empty message', () => {
    expect(toDesignModeMessage({ edits: [style], instructions: { message: '  ' } })).toEqual({
      designMode: { edits: [style] },
    })
  })

  test('converts region screenshots and anchors', () => {
    expect(
      toDesignModeMessage({
        edits: [],
        instructions: {
          message: 'Fix this',
          screenshot: { base64: 'aGVsbG8=', anchorElement: '#heading' },
        },
      }),
    ).toEqual({
      message: 'Fix this',
      designMode: {
        edits: [],
        screenshot: { url: 'data:image/jpeg;base64,aGVsbG8=', anchorElement: '#heading' },
      },
    })
  })

  test('converts element screenshots without sending their raw fields to the API', () => {
    expect(
      toDesignModeMessage({
        edits: [style],
        instructions: { message: '', element: '#heading', elementScreenshot: 'aGVsbG8=' },
      }),
    ).toEqual({
      designMode: {
        edits: [style],
        element: '#heading',
        screenshot: { url: 'data:image/jpeg;base64,aGVsbG8=' },
      },
    })
  })

  test('matches web precedence when both screenshot forms are present', () => {
    const result = toDesignModeMessage({
      edits: [style],
      instructions: {
        screenshot: { base64: 'aGVsbG8=', anchorElement: '' },
        elementScreenshot: 'invalid',
      },
    })
    expect(result.designMode.screenshot).toEqual({ url: 'data:image/jpeg;base64,aGVsbG8=' })
  })

  test('supports scoped instructions without edits', () => {
    expect(
      toDesignModeMessage({
        edits: [],
        instructions: { message: 'Change this image', element: 'img.hero' },
      }),
    ).toEqual({ message: 'Change this image', designMode: { edits: [], element: 'img.hero' } })
  })

  test('strips non-contract fields', () => {
    expect(
      toDesignModeMessage({
        edits: [
          {
            ...style,
            timestamp: 123,
            element: { ...element, domNode: {}, secret: 'do not forward' },
          },
        ],
        extra: 'do not forward',
      }),
    ).toEqual({ designMode: { edits: [style] } })
  })

  test.each([
    null,
    {},
    { edits: [] },
    { edits: [], instructions: { message: 'Generic prompt' } },
    { edits: [], instructions: { element: '#heading', message: '' } },
    { edits: [{ ...style, changes: {} }] },
    { edits: [{ ...style, element: { selectorPath: '', tagName: 'h1' } }] },
    { edits: [{ ...style, changes: { color: { from: 123, to: 'red' } } }] },
    { edits: [{ type: 'move', element, position: 'inside' }] },
    { edits: [{ type: 'move', element, position: 'before', toParentSelector: 'main' }] },
    { edits: [{ type: 'fontInjection', fontName: '' }] },
    { edits: [{ type: 'unknown', element }] },
    { edits: [style], instructions: { screenshot: { base64: 'not base64', anchorElement: '' } } },
    { edits: [style], instructions: { elementScreenshot: 'data:image/jpeg;base64,aGVsbG8=' } },
    { edits: [style], instructions: { element: { toString: (): string => 'h1' } } },
  ])('rejects invalid or non-actionable payloads: %j', (payload) => {
    expect(() => toDesignModeMessage(payload)).toThrow(TypeError)
  })

  test('rejects arrays and too many edits', () => {
    expect(() => toDesignModeMessage([])).toThrow(TypeError)
    expect(() => toDesignModeMessage({ edits: Array.from({ length: 101 }, () => style) })).toThrow(
      TypeError,
    )
  })

  test('rejects screenshots larger than the API attachment limit', () => {
    expect(() =>
      toDesignModeMessage({
        edits: [style],
        instructions: { elementScreenshot: 'a'.repeat(14 * 1024 * 1024) },
      }),
    ).toThrow('10 MB')
  })

  test('the normalized input is assignable to every generated send body', () => {
    const message: DesignModeMessage = toDesignModeMessage({ edits: [style] })
    const sync: MessagesSendData['body'] = message
    const async: MessagesSendAsyncData['body'] = message
    const stream: MessagesSendStreamData['body'] = message
    expect(sync).toEqual(async)
    expect(sync).toEqual(stream)
  })
})
