/**
 * Geist icons for the vendored AI Elements / shadcn components.
 *
 * This example uses ONLY Vercel's Geist icon set (`geist-icons`). The AI
 * Elements registry components reference a small set of icons by name; this
 * module supplies those names backed by Geist glyphs. Two icons Geist doesn't
 * ship (a plain circle and a return arrow) are provided as small inline SVGs in
 * the same Geist style.
 */
import * as React from 'react'
import {
  ArrowDown,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Cross,
  CrossCircle,
  Image,
  LoaderCircle,
  MagnifyingGlass,
  Microphone,
  Paperclip,
  Plus,
  Sparkles,
  Stop,
  Wrench,
} from 'geist-icons'

type IconProps = React.SVGProps<SVGSVGElement> & { size?: string | number }

function makeInlineIcon(path: React.ReactNode) {
  return React.forwardRef<SVGSVGElement, IconProps>(function InlineIcon(
    { size = 16, ...props },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {path}
      </svg>
    )
  })
}

// Direct Geist equivalents.
export const SearchIcon = MagnifyingGlass
export const XIcon = Cross
export const CheckIcon = Check
export const ChevronRightIcon = ChevronRight
export const ChevronDownIcon = ChevronDown
export const ChevronUpIcon = ChevronUp
export const ChevronLeftIcon = ChevronLeft
export const CheckCircleIcon = CheckCircle
export const XCircleIcon = CrossCircle
export const ClockIcon = Clock
export const WrenchIcon = Wrench
export const ArrowDownIcon = ArrowDown
export const CopyIcon = Copy
export const PaperclipIcon = Paperclip
export const ImageIcon = Image
export const Loader2Icon = LoaderCircle
export const MicIcon = Microphone
export const PlusIcon = Plus
export const SquareIcon = Stop
export const BrainIcon = Sparkles

// Geist has no plain circle / return-key glyph — supply them inline.
export const CircleIcon = makeInlineIcon(<circle cx="8" cy="8" r="5" />)
export const CornerDownLeftIcon = makeInlineIcon(
  <>
    <polyline points="6 3.5 6 10 11.5 10" />
    <polyline points="8.5 7.5 6 10 8.5 12.5" />
  </>,
)
