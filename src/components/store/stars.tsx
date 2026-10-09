import { StarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Read-only 1–5 star rating drawn in the brand's ink outline + yellow fill. */
export function Stars({ value, className, size = 'size-4' }: { value: number; className?: string; size?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} role="img" aria-label={`${value.toLocaleString('ar-EG')} من ٥`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} aria-hidden="true" className={cn(size, n <= value ? 'fill-[#FFB627] text-ink' : 'text-border')} />
      ))}
    </span>
  )
}
