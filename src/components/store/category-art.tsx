import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const INK = '#1B1B1B'
const W = '#FFFFFF'
const CREAM = '#FFF6E5'
const YELLOW = '#FFB627'
const PINK = '#FFC6DD'
const ORANGE = '#F25C05'
const TEAL = '#0B6E6D'

const stroke = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' } as const

/** Flat illustrations in the sticker style, keyed by category slug. Drawn on a 120×90 canvas. */
const ART: Record<string, ReactNode> = {
  stickers: (
    <g {...stroke}>
      <rect x="18" y="20" width="52" height="52" rx="12" fill={W} transform="rotate(-8 44 46)" />
      <circle cx="36" cy="44" r="2.5" fill={INK} transform="rotate(-8 44 46)" />
      <circle cx="52" cy="44" r="2.5" fill={INK} transform="rotate(-8 44 46)" />
      <path d="M34 54q10 9 20 0" fill="none" transform="rotate(-8 44 46)" />
      <circle cx="84" cy="52" r="26" fill={YELLOW} />
      <path d="M84 38l4.5 9 10 1.5-7.200 7 1.800 10-9.100-4.800-9.100 4.800 1.800-10-7.200-7 10-1.500z" fill={W} />
    </g>
  ),
  mugs: (
    <g {...stroke}>
      <path d="M88 32h8a12 12 0 010 24h-8" fill="none" strokeWidth={7} />
      <path d="M26 24h64v34a18 18 0 01-18 18H44a18 18 0 01-18-18z" fill={CREAM} />
      <path d="M58 62c-9-7-12-10-12-14a6.500 6.500 0 0112-3 6.500 6.500 0 0112 3c0 4-3 7-12 14z" fill={ORANGE} transform="translate(0 -4)" />
      <path d="M42 8c-4 5 4 7 0 12M58 8c-4 5 4 7 0 12M74 8c-4 5 4 7 0 12" fill="none" />
    </g>
  ),
  notebooks: (
    <g {...stroke}>
      <rect x="30" y="10" width="64" height="72" rx="8" fill={CREAM} transform="rotate(4 62 46)" />
      <rect x="26" y="8" width="64" height="72" rx="8" fill={YELLOW} />
      <rect x="44" y="22" width="34" height="14" rx="4" fill={W} />
      <path d="M44 48h34M44 58h26" fill="none" />
      {[18, 32, 46, 60, 72].map((y) => (
        <g key={y}>
          <rect x="20" y={y - 2} width="14" height="6" rx="3" fill={W} />
        </g>
      ))}
    </g>
  ),
  'id-cards': (
    <g {...stroke}>
      <path d="M48 2v14M72 2v14" fill="none" />
      <path d="M48 16h24" fill="none" strokeWidth={5} />
      <rect x="30" y="20" width="60" height="64" rx="9" fill={W} />
      <rect x="54" y="25" width="12" height="5" rx="2.500" fill={INK} />
      <circle cx="60" cy="46" r="10" fill={PINK} />
      <path d="M42 74c2-9 8-13 18-13s16 4 18 13" fill={TEAL} />
      <path d="M44 80h32" fill="none" />
    </g>
  ),
  coasters: (
    <g {...stroke}>
      <ellipse cx="62" cy="62" rx="38" ry="14" fill={TEAL} />
      <ellipse cx="62" cy="54" rx="38" ry="14" fill={CREAM} />
      <ellipse cx="62" cy="54" rx="26" ry="8.500" fill="none" />
      <ellipse cx="62" cy="40" rx="30" ry="11" fill={ORANGE} />
      <ellipse cx="62" cy="33" rx="30" ry="11" fill={YELLOW} />
      <ellipse cx="62" cy="33" rx="18" ry="6" fill="none" />
    </g>
  ),
  medals: (
    <g {...stroke}>
      <path d="M36 4l24 34 24-34" fill="none" />
      <path d="M36 4h14l10 14L70 4h14L60 38z" fill={ORANGE} />
      <circle cx="60" cy="58" r="26" fill={YELLOW} />
      <circle cx="60" cy="58" r="17" fill="none" />
      <path d="M60 46l4 8.500 9 1.300-6.500 6.300 1.500 9-8-4.300-8 4.300 1.500-9-6.500-6.300 9-1.300z" fill={W} />
    </g>
  ),
  pens: (
    <g {...stroke}>
      <g transform="rotate(-32 60 45)">
        <rect x="14" y="36" width="76" height="18" rx="4" fill={TEAL} />
        <rect x="56" y="36" width="14" height="18" fill={YELLOW} />
        <path d="M90 36l20 9-20 9z" fill={CREAM} />
        <path d="M104 42.500l6 2.500-6 2.500z" fill={INK} />
        <rect x="26" y="28" width="30" height="8" rx="3" fill={W} />
      </g>
    </g>
  ),
}

/** Illustration for a category, or `null` when none exists for the slug. */
export function hasCategoryArt(slug: string) {
  return slug in ART
}

export function CategoryArt({ slug, className }: { slug: string; className?: string }) {
  const art = ART[slug]
  if (!art) return null
  return (
    <svg viewBox="0 0 120 90" aria-hidden="true" className={cn('size-full', className)}>
      {art}
    </svg>
  )
}
