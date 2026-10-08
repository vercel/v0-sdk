import type { DesignModeEdit, DesignModeElement, DesignModeMessage } from './types'

export function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`)
  }
  return value as Record<string, unknown>
}

export function string(value: unknown, name: string, allowEmpty = false): string {
  if (typeof value !== 'string') throw new TypeError(`${name} must be a string`)
  if (!allowEmpty && !value.trim()) throw new TypeError(`${name} must not be empty`)
  return value
}

function element(value: unknown): DesignModeElement {
  const input = record(value, 'element')
  const result: DesignModeElement = {
    selectorPath: string(input['selectorPath'], 'element.selectorPath'),
    tagName: string(input['tagName'], 'element.tagName'),
  }
  for (const key of ['id', 'textContent', 'reactComponentName'] as const) {
    if (input[key] !== undefined) result[key] = string(input[key], `element.${key}`, true)
  }
  if (input['classNames'] !== undefined) {
    if (!Array.isArray(input['classNames']))
      throw new TypeError('element.classNames must be an array')
    result.classNames = input['classNames'].map((item) =>
      string(item, 'element.classNames[]', true),
    )
  }
  return result
}

function edit(value: unknown): DesignModeEdit {
  const input = record(value, 'edit')
  if (input['type'] === 'fontInjection') {
    return { type: 'fontInjection', fontName: string(input['fontName'], 'fontName') }
  }
  const target = element(input['element'])
  if (input['type'] === 'deleteElement') return { type: 'deleteElement', element: target }
  if (input['type'] === 'style') {
    const changes = record(input['changes'], 'changes')
    const entries = Object.entries(changes)
    if (!entries.length) throw new TypeError('A style edit requires at least one change')
    return {
      type: 'style',
      element: target,
      changes: Object.fromEntries(
        entries.map(([key, value]) => {
          string(key, 'CSS property')
          const change = record(value, `changes.${key}`)
          return [
            key,
            {
              from: string(change['from'], `changes.${key}.from`, true),
              to: string(change['to'], `changes.${key}.to`, true),
            },
          ]
        }),
      ),
    }
  }
  if (input['type'] === 'move') {
    const position = input['position']
    if (position !== 'inside' && position !== 'before' && position !== 'after') {
      throw new TypeError('Move position must be inside, before, or after')
    }
    const result: Extract<DesignModeEdit, { type: 'move' }> = {
      type: 'move',
      element: target,
      position,
    }
    if (input['toParentSelector'] !== undefined) {
      result.toParentSelector = string(input['toParentSelector'], 'toParentSelector')
    }
    if (input['targetSelector'] !== undefined) {
      result.targetSelector = string(input['targetSelector'], 'targetSelector')
    }
    if (position === 'inside' && !result.toParentSelector) {
      throw new TypeError('An inside move requires toParentSelector')
    }
    if (position !== 'inside' && !result.targetSelector) {
      throw new TypeError('A before or after move requires targetSelector')
    }
    return result
  }
  throw new TypeError('Unknown Design Mode edit type')
}

function screenshotUrl(value: unknown): string {
  const base64 = string(value, 'screenshot base64')
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw new TypeError('Screenshot must contain base64 image data without a data URI prefix')
  }
  let padding = 0
  if (base64.endsWith('==')) padding = 2
  else if (base64.endsWith('=')) padding = 1
  if ((base64.length * 3) / 4 - padding > 10 * 1024 * 1024) {
    throw new TypeError('Screenshot exceeds the 10 MB attachment limit')
  }
  // The existing runtime captures both region and element screenshots as JPEG.
  return `data:image/jpeg;base64,${base64}`
}

function requireAction(message: DesignModeMessage) {
  if (!message.message && !message.designMode.edits?.length) {
    throw new TypeError('Provide instructions or at least one Design Mode edit')
  }
  if (
    !message.designMode.edits?.length &&
    !message.designMode.element &&
    !message.designMode.screenshot
  ) {
    throw new TypeError('Instructions without edits require an element or screenshot')
  }
}

/** Validate and copy public Design Mode input on your backend, stripping unrelated fields. */
export function parseDesignModeMessage(value: unknown): DesignModeMessage {
  const input = record(value, 'Design Mode message')
  const designMode = record(input['designMode'], 'designMode')
  let edits = designMode['edits']
  if (edits === undefined) edits = []
  if (!Array.isArray(edits) || edits.length > 100) {
    throw new TypeError('edits must be an array containing at most 100 edits')
  }
  const result: DesignModeMessage = { designMode: { edits: edits.map(edit) } }
  if (input['message'] !== undefined) result.message = string(input['message'], 'message')
  if (designMode['element'] !== undefined)
    result.designMode.element = string(designMode['element'], 'designMode.element')
  if (designMode['screenshot'] !== undefined) {
    const screenshot = record(designMode['screenshot'], 'designMode.screenshot')
    const url = string(screenshot['url'], 'screenshot.url')
    if (url.startsWith('data:')) {
      const match = /^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/.exec(url)
      if (!match) throw new TypeError('Screenshot must be a supported base64 image data URI')
      screenshotUrl(match[2])
    } else {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
        throw new TypeError('Screenshot URL must use HTTPS without credentials')
      }
    }
    result.designMode.screenshot = { url }
    if (screenshot['anchorElement'] !== undefined) {
      result.designMode.screenshot.anchorElement = string(
        screenshot['anchorElement'],
        'screenshot.anchorElement',
      )
    }
  }
  requireAction(result)
  return result
}

/**
 * Convert a preview-runtime Apply payload to public API v2 message input.
 * Safe to use in the browser or on your backend. Throws TypeError for invalid
 * or non-actionable input. Does not mutate the payload or make network requests.
 */
export function toDesignModeMessage(payload: unknown): DesignModeMessage {
  const input = record(payload, 'Design Mode payload')
  const edits = input['edits']
  if (!Array.isArray(edits) || edits.length > 100) {
    throw new TypeError('edits must be an array containing at most 100 edits')
  }
  const result: DesignModeMessage = { designMode: { edits: edits.map(edit) } }
  if (input['instructions'] !== undefined) {
    const instructions = record(input['instructions'], 'instructions')
    if (instructions['message'] !== undefined) {
      const message = string(instructions['message'], 'instructions.message', true)
      if (message.trim()) result.message = message
    }
    if (instructions['element'] !== undefined) {
      result.designMode.element = string(instructions['element'], 'instructions.element')
    }
    if (instructions['screenshot'] !== undefined) {
      const screenshot = record(instructions['screenshot'], 'instructions.screenshot')
      result.designMode.screenshot = { url: screenshotUrl(screenshot['base64']) }
      if (screenshot['anchorElement'] !== undefined) {
        const anchor = string(screenshot['anchorElement'], 'screenshot.anchorElement', true)
        if (anchor.trim()) result.designMode.screenshot.anchorElement = anchor
      }
    } else if (instructions['elementScreenshot'] !== undefined) {
      result.designMode.screenshot = { url: screenshotUrl(instructions['elementScreenshot']) }
    }
  }
  requireAction(result)
  return result
}
