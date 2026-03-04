'use client'

import { useEffect } from 'react'
import { useControls } from 'leva'

type UIStateMode =
  | 'auto'
  | 'landing'
  | 'chat-empty'
  | 'chat-messages'
  | 'chat-messages-filled'
  | 'chat-loading'
  | 'chat-error'
  | 'chat-preview'

type CursorPreset = 'system' | 'frutiger-aero' | 'roundy-normal'
type LayoutMode = 'chat+artifact' | 'chat' | 'artifact'

type DevControlsState = {
  layoutMode: LayoutMode
  uiState: UIStateMode
  cursorPreset: CursorPreset
}

interface HomeDevControlsProps {
  onChange: (controls: DevControlsState) => void
}

const CURSOR_PRESET_OPTIONS: Record<string, CursorPreset> = {
  System: 'system',
  'Frutiger Aero': 'frutiger-aero',
  'Roundy Normal': 'roundy-normal',
}

export function HomeDevControls({ onChange }: HomeDevControlsProps) {
  const { layoutMode, uiState } = useControls('Page Layout', {
    layoutMode: {
      value: 'chat+artifact',
      options: {
        'Chat + Artifact': 'chat+artifact',
        Chat: 'chat',
        Artifact: 'artifact',
      },
    },
    uiState: {
      value: 'auto',
      options: {
        Auto: 'auto',
        Landing: 'landing',
        'Chat Empty': 'chat-empty',
        'Chat Messages': 'chat-messages',
        'Chat Messages (Filled)': 'chat-messages-filled',
        'Chat Loading': 'chat-loading',
        'Chat Error': 'chat-error',
        'Chat + Preview': 'chat-preview',
      },
    },
  })

  const { cursorPreset } = useControls('Cursor', {
    cursorPreset: {
      value: 'system',
      options: CURSOR_PRESET_OPTIONS,
      label: 'Preset',
    },
  })

  useEffect(() => {
    onChange({
      layoutMode: layoutMode as LayoutMode,
      uiState: uiState as UIStateMode,
      cursorPreset: cursorPreset as CursorPreset,
    })
  }, [cursorPreset, layoutMode, onChange, uiState])

  return null
}
