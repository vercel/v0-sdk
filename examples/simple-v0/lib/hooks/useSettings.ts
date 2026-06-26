import { useState, useEffect } from 'react'

export type ModelType = 'v0-auto' | 'v0-mini' | 'v0-pro' | 'v0-max' | 'v0-max-fast'

export interface Settings {
  model: ModelType
  imageGenerations: boolean
}

const DEFAULT_SETTINGS: Settings = {
  model: 'v0-pro',
  imageGenerations: false,
}

const SETTINGS_STORAGE_KEY = 'v0-settings'
const SETTINGS_UPDATE_EVENT = 'v0-settings-updated'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const syncSettings = () => {
      setSettings(readStoredSettings())
    }

    syncSettings()
    window.addEventListener('storage', syncSettings)
    window.addEventListener(SETTINGS_UPDATE_EVENT, syncSettings)

    return () => {
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener(SETTINGS_UPDATE_EVENT, syncSettings)
    }
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event(SETTINGS_UPDATE_EVENT))
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error)
    }
  }

  return {
    settings,
    updateSettings,
  }
}

function readStoredSettings(): Settings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS

    const parsed = JSON.parse(saved)

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      model: isModelType(parsed.model) ? parsed.model : DEFAULT_SETTINGS.model,
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error)
    return DEFAULT_SETTINGS
  }
}

function isModelType(value: unknown): value is ModelType {
  return (
    value === 'v0-auto' ||
    value === 'v0-mini' ||
    value === 'v0-pro' ||
    value === 'v0-max' ||
    value === 'v0-max-fast'
  )
}
