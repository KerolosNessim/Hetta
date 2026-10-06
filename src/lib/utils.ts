import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Arabic-Indic digits for prices and counts shown to shoppers. */
export function formatPrice(value: number | null | undefined) {
  if (value == null) return '—'
  return `${new Intl.NumberFormat('ar-EG').format(value)} ج`
}

/** Turns an Arabic or English name into a URL-safe slug. */
export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}
