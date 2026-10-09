import { Reveal } from '@/components/motion'
import { Stars } from '@/components/store/stars'
import { tiltFor } from '@/components/store/sticker-art'
import { getReviews } from '@/lib/api'
import type { Review } from '@/lib/types'
import { useAsync } from '@/lib/use-async'
import { cn } from '@/lib/utils'

// Sticker-sheet palette: every note is a different die-cut colour, all legible with ink text.
const PAPER = ['bg-[#FFF6E5]', 'bg-[#FFB627]', 'bg-[#FFC6DD]', 'bg-white', 'bg-teal-subtle']

const n = (v: number) => v.toLocaleString('ar-EG')

/**
 * Customer reviews as notes stuck on a sticker sheet: each one tilted a few degrees,
 * ink-outlined with a hard shadow and a peeled corner, so they read as part of the
 * same product family as the stickers themselves. Hidden when nothing is published.
 */
export function ReviewsSection() {
  const { data } = useAsync(getReviews, [])
  if (!data?.length) return null

  const average = data.reduce((s, r) => s + r.rating, 0) / data.length

  return (
    <Reveal>
      <section aria-labelledby="reviews-h">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="reviews-h" className="font-display text-3xl md:text-[2.75rem]">
            قالوا إيه عن حتة
          </h2>
          <p className="flex items-center gap-2.5 rounded-full border-2 border-ink bg-card py-1.5 ps-4 pe-3 font-semibold">
            <span className="font-display text-2xl leading-none">{n(Math.round(average * 10) / 10)}</span>
            <Stars value={Math.round(average)} />
            <span className="text-sm font-normal text-muted-foreground">من {n(data.length)} {data.length > 10 ? 'رأي' : data.length === 1 ? 'رأي' : 'آراء'}</span>
          </p>
        </div>

        <ul className="columns-1 gap-x-6 sm:columns-2 lg:columns-3">
          {data.map((r, i) => (
            <ReviewNote key={r.id} review={r} index={i} />
          ))}
        </ul>
      </section>
    </Reveal>
  )
}

function ReviewNote({ review: r, index }: { review: Review; index: number }) {
  const tilt = tiltFor(r.id) / 2.5
  return (
    <li className="mb-7 break-inside-avoid">
      <figure
        className={cn(
          'relative flex flex-col gap-4 overflow-hidden rounded-2xl border-2 border-ink p-5 shadow-sticker-sm md:p-6',
          'transition-transform duration-300 motion-safe:hover:rotate-0 motion-safe:hover:-translate-y-1',
          PAPER[index % PAPER.length],
        )}
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        {/* peeled corner */}
        <span
          aria-hidden="true"
          className="absolute top-0 end-0 size-9 bg-ink/15"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
        />
        <Stars value={r.rating} size="size-5" />
        <blockquote className="relative">
          <span aria-hidden="true" className="absolute -top-3 -start-1 font-display text-6xl leading-none text-ink/20 select-none">“</span>
          <p className="relative text-lg leading-8">{r.body}</p>
        </blockquote>
        <figcaption className="flex items-center gap-3 border-t-2 border-dashed border-ink/30 pt-4">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-ink font-display text-lg text-white">
            {r.author_name.trim().charAt(0)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">{r.author_name}</span>
            {(r.author_label || r.product_label) && (
              <span className="truncate text-sm text-ink/70">{[r.author_label, r.product_label].filter(Boolean).join(' · ')}</span>
            )}
          </span>
        </figcaption>
      </figure>
    </li>
  )
}
