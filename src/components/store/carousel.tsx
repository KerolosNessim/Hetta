import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Horizontal scroll-snap carousel: swipe on touch, arrow buttons on desktop.
 * Direction-aware, so "next" always moves the way the page reads (right-to-left in Arabic).
 *
 * With `loop`, the items repeat endlessly in both directions. That is done by rendering three
 * copies and silently jumping one copy's width whenever the scroll drifts out of the middle copy;
 * the extra copies are hidden from assistive tech and the tab order. When everything already
 * fits on screen there is nothing to loop, so a single copy renders.
 */
export function Carousel({ children, label, className, loop = false }: { children: ReactNode; label: string; className?: string; loop?: boolean }) {
  const track = useRef<HTMLUListElement>(null)
  const [edge, setEdge] = useState({ start: true, end: true })
  const [looping, setLooping] = useState(false)
  const items = Children.toArray(children)
  const count = items.length

  const sign = () => (track.current && getComputedStyle(track.current).direction === 'rtl' ? -1 : 1)
  /** Width of one full copy of the items, including the gap that follows it. */
  const setWidth = () => {
    const el = track.current
    if (!el || !looping || el.children.length < count * 2) return 0
    return Math.abs((el.children[count] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft)
  }

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    const pos = Math.abs(el.scrollLeft)
    setEdge({ start: pos < 4, end: pos > el.scrollWidth - el.clientWidth - 4 })
    if (!loop) return
    // one copy overflows the viewport -> loop; otherwise leave it as a plain row
    const oneCopy = looping ? el.scrollWidth / 3 : el.scrollWidth
    const overflows = oneCopy > el.clientWidth + 8
    if (overflows !== looping) setLooping(overflows)
  }, [loop, looping])

  useEffect(() => {
    const el = track.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, count])

  // start on the middle copy so there is room to scroll both ways
  useLayoutEffect(() => {
    const el = track.current
    const w = setWidth()
    if (el && w) el.scrollTo({ left: sign() * w, behavior: 'instant' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [looping, count])

  const onScroll = () => {
    measure()
    const el = track.current
    const w = setWidth()
    if (!el || !w) return
    const pos = Math.abs(el.scrollLeft)
    if (pos < w * 0.5) el.scrollTo({ left: sign() * (pos + w), behavior: 'instant' })
    else if (pos > w * 1.5) el.scrollTo({ left: sign() * (pos - w), behavior: 'instant' })
  }

  const go = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * sign() * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const copies = looping ? [0, 1, 2] : [0]
  const showArrows = looping || !(edge.start && edge.end)

  return (
    <div className={cn('relative', className)} role="region" aria-roledescription="carousel" aria-label={label}>
      <ul
        ref={track}
        onScroll={onScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3 [scrollbar-width:none] md:mx-0 md:gap-4 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {copies.map((copy) =>
          items.map((item, i) => (
            <li
              key={`${copy}-${i}`}
              className="w-40 shrink-0 snap-start md:w-52"
              // only the middle copy is real; the others exist to make the loop seamless
              aria-hidden={looping && copy !== 1 ? true : undefined}
              inert={looping && copy !== 1 ? true : undefined}
            >
              {item}
            </li>
          )),
        )}
      </ul>
      {showArrows && (
        <>
          <Button
            type="button"
            variant="sticker"
            size="icon"
            className="absolute top-1/2 -start-2 z-10 hidden -translate-y-1/2 rounded-full md:inline-flex"
            aria-label="السابق"
            disabled={!looping && edge.start}
            onClick={() => go(-1)}
          >
            <ChevronRightIcon className="ltr:rotate-180" />
          </Button>
          <Button
            type="button"
            variant="sticker"
            size="icon"
            className="absolute top-1/2 -end-2 z-10 hidden -translate-y-1/2 rounded-full md:inline-flex"
            aria-label="التالي"
            disabled={!looping && edge.end}
            onClick={() => go(1)}
          >
            <ChevronLeftIcon className="ltr:rotate-180" />
          </Button>
        </>
      )}
    </div>
  )
}
