import { describe, expect, test } from 'bun:test'
import openapi from '../../v0-sdk/openapi.json'

import { V0_REACT_OPERATION_HOOKS } from '../src/generated/swr'

const methods = new Set(['get', 'post', 'put', 'patch', 'delete'])

describe('generated hook surface', () => {
  test('maps every OpenAPI operation exactly once', () => {
    const operationIds = Object.values(openapi.paths).flatMap((pathItem) =>
      Object.entries(pathItem)
        .filter(([method]) => methods.has(method))
        .map(([, operation]) => (operation as { operationId: string }).operationId),
    )

    expect(Object.keys(V0_REACT_OPERATION_HOOKS).sort()).toEqual(operationIds.sort())
    expect(new Set(Object.values(V0_REACT_OPERATION_HOOKS)).size).toBe(operationIds.length)
  })

  test('uses the confirmed semantic names and streaming defaults', () => {
    expect(V0_REACT_OPERATION_HOOKS['chats.getPreview']).toBe('usePreview')
    expect(V0_REACT_OPERATION_HOOKS['chats.getFiles']).toBe('useFiles')
    expect(V0_REACT_OPERATION_HOOKS['chats.getConnectStatus']).toBe('useConnectStatus')
    expect(V0_REACT_OPERATION_HOOKS['chats.restoreMessage']).toBe('useRestoreMessage')
    expect(V0_REACT_OPERATION_HOOKS['chats.createVercelProject']).toBe('useCreateProject')
    expect(V0_REACT_OPERATION_HOOKS['chats.createStream']).toBe('useCreateChat')
    expect(V0_REACT_OPERATION_HOOKS['chats.create']).toBe('useCreateChatBlocking')
    expect(V0_REACT_OPERATION_HOOKS['messages.sendStream']).toBe('useSendMessage')
    expect(V0_REACT_OPERATION_HOOKS['messages.resolveStream']).toBe('useResolveTask')
    expect(V0_REACT_OPERATION_HOOKS['settings.getPreviewHosts']).toBe('usePreviewHosts')
    expect(V0_REACT_OPERATION_HOOKS['settings.setPreviewHosts']).toBe('useSetPreviewHosts')
  })
})
