'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DropdownMenuItem as DialogDropdownMenuItem } from '@/components/ui/dropdown-menu'
import { SettingsIcon, ChevronDownIcon, CheckIcon } from 'lucide-react'
import { Settings, ModelType, useSettings } from '../../lib/hooks/useSettings'

interface SettingsDialogProps {
  trigger?: React.ReactNode
}

export default function SettingsDialog({ trigger }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings()
  const [open, setOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState<Settings>(settings)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Reset temp settings when opening
      setTempSettings(settings)
    }
  }

  const handleSave = () => {
    updateSettings(tempSettings)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempSettings(settings)
    setOpen(false)
  }

  const modelOptions = [
    {
      value: 'v0-1.5-sm' as ModelType,
      label: 'v0-1.5-sm',
      description: 'Fast and efficient for simple apps',
    },
    {
      value: 'v0-1.5-md' as ModelType,
      label: 'v0-1.5-md',
      description: 'Balanced performance and quality (default)',
    },
    {
      value: 'v0-1.5-lg' as ModelType,
      label: 'v0-1.5-lg',
      description: 'Best quality for complex applications',
    },
  ]

  const currentModel = modelOptions.find(
    (option) => option.value === tempSettings.model,
  )

  const defaultTrigger = (
    <DialogDropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <SettingsIcon className="mr-2 h-4 w-4" />
      Settings
    </DialogDropdownMenuItem>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your preferences for app generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Model</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="font-medium">{currentModel?.label}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[400px]">
                {modelOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() =>
                      setTempSettings({
                        ...tempSettings,
                        model: option.value,
                      })
                    }
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                      {tempSettings.model === option.value && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image Generations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-medium">Image Generations</h3>
              <p className="text-xs text-muted-foreground">
                Enable AI-generated images in your apps
              </p>
            </div>
            <Switch
              checked={tempSettings.imageGenerations}
              onCheckedChange={(checked) =>
                setTempSettings({
                  ...tempSettings,
                  imageGenerations: checked,
                })
              }
            />
          </div>

          {/* Thinking */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-medium">Thinking</h3>
              <p className="text-xs text-muted-foreground">
                Show AI reasoning process during generation
              </p>
            </div>
            <Switch
              checked={tempSettings.thinking}
              onCheckedChange={(checked) =>
                setTempSettings({
                  ...tempSettings,
                  thinking: checked,
                })
              }
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
