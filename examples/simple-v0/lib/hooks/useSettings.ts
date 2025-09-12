import { useState, useEffect } from 'react'

export type ModelType = 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg'

export interface Settings {
  model: ModelType
  imageGenerations: boolean
  thinking: boolean
}

const DEFAULT_SETTINGS: Settings = {
  model: 'v0-1.5-md',
  imageGenerations: false,
  thinking: false,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('v0-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    }
  }, [])

  // Save settings to localStorage when they change
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    try {
      localStorage.setItem('v0-settings', JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error)
    }
  }

  return {
    settings,
    updateSettings,
  }
}
