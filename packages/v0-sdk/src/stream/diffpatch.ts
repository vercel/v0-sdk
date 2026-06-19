import * as jsondiffpatch from 'jsondiffpatch'
import type { ArrayDelta, Delta } from 'jsondiffpatch'

const jsonDiffPatcher = jsondiffpatch.create({})

export type JsonDiffPatchDelta = Delta
export type V0StringAppendDelta = [[...number[], string], 9, 9]
export type V0StreamDelta = JsonDiffPatchDelta | V0StringAppendDelta

function isArrayStringAppend(delta: Delta): false | [...number[], string] {
  if (!isArrayDelta(delta)) {
    return false
  }

  let index = -1
  let removedIndex = -1

  for (const key in delta) {
    if (key === '_t') {
      continue
    }

    if (key.startsWith('_')) {
      removedIndex = Number(key.slice(1))
      continue
    }

    if (index !== -1) {
      return false
    }

    index = Number(key)
  }

  if (index === -1) {
    return false
  }

  if (removedIndex === -1) {
    const nestedDelta = delta[index]
    const result = isArrayStringAppend(nestedDelta)
    if (result === false) {
      return false
    }

    return [index, ...result]
  }

  if (index !== removedIndex) {
    return false
  }

  const deltaNew = delta[index]
  const deltaOld = delta[`_${removedIndex}`]

  if (
    Array.isArray(deltaNew) &&
    deltaNew.length === 1 &&
    typeof deltaNew[0] === 'string' &&
    Array.isArray(deltaOld) &&
    deltaOld.length === 3 &&
    typeof deltaOld[0] === 'string' &&
    deltaOld[1] === 0 &&
    deltaOld[2] === 0
  ) {
    const newString = deltaNew[0]
    const oldString = deltaOld[0]

    if (newString.startsWith(oldString)) {
      return [index, newString.slice(oldString.length)]
    }
  }

  return false
}

export function diff(original: unknown, modified: unknown): V0StreamDelta {
  const delta = jsonDiffPatcher.diff(original, modified)
  const maybeStringAppend = isArrayStringAppend(delta)

  if (maybeStringAppend !== false) {
    return [maybeStringAppend, 9, 9]
  }

  return delta
}

export function patch<T = unknown>(original: T, delta: unknown): T {
  if (!delta) {
    return original
  }

  try {
    const newValue = jsonDiffPatcher.clone(original)

    if (isV0StringAppendDelta(delta)) {
      return applyStringAppendDelta(newValue, delta) as T
    }

    return jsonDiffPatcher.patch(newValue, delta as Delta) as T
  } catch {
    return original
  }
}

function isArrayDelta(delta: Delta): delta is ArrayDelta {
  return typeof delta === 'object' && delta !== null && '_t' in delta && delta._t === 'a'
}

function isV0StringAppendDelta(delta: unknown): delta is V0StringAppendDelta {
  if (!Array.isArray(delta)) {
    return false
  }

  const path = delta[0]
  if (!Array.isArray(path) || path.length === 0) {
    return false
  }

  const appendedText = path[path.length - 1]
  return (
    delta[1] === 9 &&
    delta[2] === 9 &&
    typeof appendedText === 'string' &&
    path.slice(0, -1).every((segment) => Number.isInteger(segment))
  )
}

function applyStringAppendDelta(original: unknown, delta: V0StringAppendDelta): unknown {
  const path = delta[0]
  const appendedText = path[path.length - 1]

  if (typeof appendedText !== 'string') {
    return original
  }

  const indexes = path.slice(0, -1) as number[]

  if (indexes.length === 0) {
    if (typeof original === 'string') {
      return `${original}${appendedText}`
    }

    return original
  }

  let current = original

  for (const index of indexes) {
    if (!canAccessIndex(current)) {
      return original
    }

    const next = current[index]
    if (typeof next === 'string') {
      current[index] = `${next}${appendedText}`
      return original
    }

    current = next
  }

  return original
}

function canAccessIndex(value: unknown): value is Record<number, unknown> {
  return typeof value === 'object' && value !== null
}
