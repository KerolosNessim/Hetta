import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const n = (v: number) => v.toLocaleString('ar-EG')

/** Page numbers to show: always the first and last, the current page with one neighbour each side, gaps as null. */
export function pageWindow(page: number, count: number): (number | null)[] {
  const wanted = new Set([1, count, page - 1, page, page + 1])
  if (page <= 3) [2, 3].forEach((p) => wanted.add(p))
  if (page >= count - 2) [count - 1, count - 2].forEach((p) => wanted.add(p))
  const sorted = [...wanted].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i && p - sorted[i - 1] > 1 ? [null, p] : [p]))
}

/** Slice of `items` for a 1-based page, plus the clamped page and the page count. */
export function paginate<T>(items: T[], page: number, size: number) {
  const count = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(1, page), count)
  const from = (current - 1) * size
  return { slice: items.slice(from, from + size), page: current, count, from, to: Math.min(from + size, items.length) }
}

/**
 * Previous / numbered pages / next. `store` matches the storefront's inked sticker buttons,
 * `admin` is the quieter dashboard look. Renders nothing when there is only one page.
 */
export function Pagination({
  page,
  count,
  onChange,
  variant = 'store',
  className,
}: {
  page: number
  count: number
  onChange: (page: number) => void
  variant?: 'store' | 'admin'
  className?: string
}) {
  if (count <= 1) return null
  const store = variant === 'store'
  const base = cn(
    'inline-grid h-10 min-w-10 place-items-center rounded-xl border-2 px-3 text-sm font-semibold outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40',
    store ? 'border-ink' : 'rounded-lg border',
  )
  const idle = store ? 'bg-card hover:bg-secondary' : 'border-input bg-card hover:bg-secondary'
  const active = store ? 'bg-ink text-white shadow-sticker-sm' : 'border-primary bg-primary text-primary-foreground'

  return (
    <nav aria-label="الصفحات" className={cn('flex flex-wrap items-center justify-center gap-1.5', className)}>
      <button type="button" className={cn(base, idle, 'gap-1 ps-2 pe-3')} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <span className="flex items-center gap-1">
          <ChevronRightIcon className="size-4 ltr:rotate-180" />
          <span className="max-sm:sr-only">السابق</span>
        </span>
      </button>

      {pageWindow(page, count).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            type="button"
            aria-label={`صفحة ${n(p)}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(base, p === page ? active : idle)}
            onClick={() => onChange(p)}
          >
            {n(p)}
          </button>
        ),
      )}

      <button type="button" className={cn(base, idle, 'gap-1 ps-3 pe-2')} disabled={page >= count} onClick={() => onChange(page + 1)}>
        <span className="flex items-center gap-1">
          <span className="max-sm:sr-only">التالي</span>
          <ChevronLeftIcon className="size-4 ltr:rotate-180" />
        </span>
      </button>
    </nav>
  )
}
