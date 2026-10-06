import { cn } from '@/lib/utils'

const INK_ON: Record<string, string> = {
  '#ffb627': '#1B1B1B',
  '#ffc6dd': '#1B1B1B',
  '#fff6e5': '#0B6E6D',
  '#e7f4f3': '#0B6E6D',
  '#ffffff': '#0B6E6D',
}

/** Text color that reads on a given sticker background. */
export function inkFor(bg: string) {
  return INK_ON[bg.toLowerCase()] ?? (bg.toLowerCase() === '#1b1b1b' ? '#FFB627' : '#FFFFFF')
}

/**
 * Product visual: the real photo when there is one, otherwise a sticker-shaped
 * placeholder with the product name so the grid never shows empty boxes.
 */
export function StickerArt({
  image,
  label,
  color,
  tilt = -5,
  size = 'md',
  className,
}: {
  image?: string | null
  label: string
  color: string
  tilt?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  if (image) {
    return <img src={image} alt={label} loading="lazy" className={cn('size-full object-contain p-4', className)} />
  }
  const text = { sm: 'text-xs px-1.5 py-1 border-[3px] whitespace-nowrap', md: 'text-2xl px-5 py-4 border-[7px] line-clamp-2', lg: 'text-5xl px-8 py-7 border-[10px] line-clamp-2' }[size]
  return (
    <span
      aria-hidden="true"
      className={cn('max-w-[85%] rounded-2xl border-white text-center leading-tight font-display shadow-sticker', text, className)}
      style={{ background: color, color: inkFor(color), transform: `rotate(${tilt}deg)` }}
    >
      {label}
    </span>
  )
}

/** Stable pseudo-random tilt per product so cards don't all lean the same way. */
export function tiltFor(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0
  return ((Math.abs(h) % 13) - 6) || 4
}
