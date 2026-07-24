/**
 * Central icon module. Every icon in the app comes from `geist-icons`
 * (Vercel's Geist icon set) — re-exported here under app-friendly names so
 * the rest of the codebase never imports an icon library directly.
 *
 * Hard rule for this example: Geist icons only — no other icon library. If you
 * need a new glyph, add it here from `geist-icons` and import it from
 * `@/lib/icons`.
 */
export {
  MagnifyingGlass as SearchIcon,
  Plus as PlusIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Sparkles as SparklesIcon,
  ArrowUp as ArrowUpIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Code as CodeIcon,
  Eye as EyeIcon,
  Display as MonitorIcon,
  TabletDevice as TabletIcon,
  PhoneDevice as PhoneIcon,
  Fullscreen as FullscreenIcon,
  FullscreenClose as FullscreenCloseIcon,
  RefreshClockwise as RefreshIcon,
  SidebarLeft as SidebarToggleIcon,
  Coins as CreditsIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Cross as CrossIcon,
  CrossCircle as CrossCircleIcon,
  Trash as TrashIcon,
  MoreHorizontal as MoreHorizontalIcon,
  PencilEdit as RenameIcon,
  LoaderCircle as SpinnerIcon,
  ExternalSmall as ExternalIcon,
  Copy as CopyIcon,
  Download as DownloadIcon,
  LogoV0 as V0LogoIcon,
  LogoVercel as VercelLogoIcon,
  Stop as StopIcon,
  SettingsGear as SettingsIcon,
  FileText as FileIcon,
  Terminal as TerminalIcon,
  Wrench as ToolIcon,
  Robot as AgentIcon,
  Star as StarIcon,
  StarFill as StarFillIcon,
} from 'geist-icons'
