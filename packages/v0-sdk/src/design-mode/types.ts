import type { MessagesSendData } from '../generated/types.gen'

export type DesignModeInput = NonNullable<MessagesSendData['body']['designMode']>
export type DesignModeEdit = NonNullable<DesignModeInput['edits']>[number]
export type DesignModeElement = Extract<DesignModeEdit, { type: 'style' }>['element']

/** Input for messages.send, sendStream, or sendAsync. Add chatId separately. */
export type DesignModeMessage = {
  message?: string
  designMode: DesignModeInput
}

/** The payload emitted by the preview runtime's Apply button. */
export type DesignModeRuntimePayload = {
  edits: DesignModeEdit[]
  instructions?: {
    message: string
    element?: string
    screenshot?: { base64: string; anchorElement: string }
    elementScreenshot?: string
  }
}

export type DesignModeSelection = {
  readonly nodeId: string | null
  readonly selectedNodeIds: readonly string[]
}

export type DesignModeLayer = {
  readonly id: string
  readonly tag: string
  readonly name: string
  readonly children: readonly DesignModeLayer[]
  readonly layout?: 'flex' | 'grid'
  readonly role?: string
  readonly hidden?: boolean
}

export type DesignModeState = Readonly<{
  connected: boolean
  enabled: boolean
  applying: boolean
  selection: DesignModeSelection | null
  tree: DesignModeLayer | null
}>

/** Default v0 branding, no logo, or a custom HTTP(S) image. */
export type DesignModeLogo = boolean | { url: string; alt: string }

export type DesignModeBridgeOptions = {
  iframe: HTMLIFrameElement
  /** Exact origin of the iframe, including the customer's preview proxy when used. */
  targetOrigin: string
  /** Forward the normalized message to your backend. Return false to reject Apply. */
  onApply: (message: DesignModeMessage, context: { signal: AbortSignal }) => Promise<boolean | void>
  enabled?: boolean
  /** Sent on every enable, including reconnects. Omit to use the runtime's v0 logo. */
  logo?: DesignModeLogo
  onError?: (error: Error) => void
  /** Timeout for parent-to-preview RPC calls, not for the onApply callback. */
  timeoutMs?: number
}

export type DesignModeBridge = {
  /** Resolves when the preview runtime establishes an authenticated connection. */
  ready: Promise<void>
  setEnabled: (enabled: boolean) => void
  getState: () => DesignModeState
  subscribe: (listener: (state: DesignModeState) => void) => () => void
  selectNode: (id: string) => Promise<void>
  hoverNode: (id: string) => Promise<void>
  clearHoveredNode: () => Promise<void>
  setNodeVisibility: (id: string, hidden: boolean) => Promise<void>
  /** Removes listeners, closes the connection, and aborts pending Apply callbacks. */
  dispose: () => void
}
