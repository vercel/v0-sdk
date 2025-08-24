import React from 'react'
import {
  ChevronRight,
  ChevronDown,
  Search,
  Folder,
  Settings,
  FileText,
  Brain,
  Wrench,
} from 'lucide-react'

interface IconProps {
  name:
    | 'chevron-right'
    | 'chevron-down'
    | 'search'
    | 'folder'
    | 'settings'
    | 'file-text'
    | 'brain'
    | 'wrench'
  className?: string
}

export function Icon({ name, className }: IconProps) {
  switch (name) {
    case 'chevron-right':
      return <ChevronRight className={className} suppressHydrationWarning />
    case 'chevron-down':
      return <ChevronDown className={className} suppressHydrationWarning />
    case 'search':
      return <Search className={className} suppressHydrationWarning />
    case 'folder':
      return <Folder className={className} suppressHydrationWarning />
    case 'settings':
      return <Settings className={className} suppressHydrationWarning />
    case 'file-text':
      return <FileText className={className} suppressHydrationWarning />
    case 'brain':
      return <Brain className={className} suppressHydrationWarning />
    case 'wrench':
      return <Wrench className={className} suppressHydrationWarning />
    default:
      return null
  }
}
