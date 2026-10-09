import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CategoryArt, hasCategoryArt } from '@/components/store/category-art'
import { EASE } from '@/components/motion'
import { Skeleton } from '@/components/ui/misc'
import { getCategories } from '@/lib/api'
import { useAsync } from '@/lib/use-async'
import { cn } from '@/lib/utils'

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** True when white text reads better than ink on this background. */
function prefersWhite(bg: string) {
  const l = luminance(bg)
  return 1.05 / (l + 0.05) >= (l + 0.05) / (luminance('#1B1B1B') + 0.05)
}

const MAX_ITEMS = 8

const ROTATE_MS = 3200

/**
 * Home hero. One sentence with a word that keeps changing ("حتة من شخصيتك على ... ماج / نوت بوك / قلم"),
 * a big die-cut product that swaps with it, and a panel colour that follows. It says what the shop does
 * (prints your idea on anything) and shows the range in the first five seconds. Pauses while the visitor
 * hovers or focuses it, and does not auto-rotate for people who ask for reduced motion.
 */
export function Hero() {
  const reduce = useReducedMotion()
  const cats = useAsync(() => getCategories({ homeOnly: true }), [])
  const items = (cats.data ?? []).slice(0, MAX_ITEMS)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = items.length

  useEffect(() => {
    if (reduce || paused || count < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % count), ROTATE_MS)
    return () => clearInterval(t)
  }, [reduce, paused, count])

  if (cats.loading) return <Skeleton className="h-[34rem] rounded-[2rem]" />
  if (!count) return null
  const item = items[i % count]
  const dark = prefersWhite(item.color)
  const fg = dark ? '#FFFFFF' : '#1B1B1B'

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border-[3px] border-ink shadow-sticker-lg transition-colors duration-700"
      style={{ background: item.color, color: fg }}
      // pause only for a real mouse hover or keyboard focus; a tap or a click on a dot must not freeze it
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={(e) => e.target.matches(':focus-visible') && setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* dotted paper texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(currentColor 1.6px, transparent 1.6px)', backgroundSize: '22px 22px' }}
      />

      <div className="relative grid items-center gap-8 p-6 md:min-h-[34rem] md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-6 md:p-14">
        {/* message */}
        <div className="flex flex-col gap-6">
          <h1 className="flex flex-col gap-2 font-display leading-[1.05]">
            <span className="sr-only">
              {`لزّق حتة من شخصيتك على ${items.map((c) => c.name).join("، ")}`}
            </span>
            <span aria-hidden="true" className="text-3xl md:text-5xl">
              لزّق حتة من شخصيتك على
            </span>
            <span aria-hidden="true" className="relative block h-[1.25em] text-6xl md:text-8xl">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={item.id}
                  initial={reduce ? false : { y: '70%', opacity: 0, rotate: 3 }}
                  animate={{ y: 0, opacity: 1, rotate: -2 }}
                  exit={reduce ? undefined : { y: '-70%', opacity: 0, rotate: -6 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute start-0 top-0 inline-block rounded-2xl border-[3px] border-ink bg-white px-5 pb-1 text-ink shadow-sticker"
                >
                  <bdi>{item.name}</bdi>
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="max-w-md text-lg leading-8 md:text-xl">
            استيكرات وماجات ودفاتر وكروت وكوسترز وميداليات وأقلام بتصميمك. اطلب دلوقتي وهنوصلك لحد البيت.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className={cn(
                'inline-flex h-14 items-center rounded-xl border-2 border-ink px-7 text-lg font-bold shadow-sticker-sm transition outline-none motion-safe:hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/60',
                dark ? 'bg-white text-ink' : 'bg-ink text-white',
              )}
            >
              تسوّق دلوقتي
            </Link>
            <a href="#custom" className="inline-flex h-14 items-center rounded-xl border-2 border-current px-6 text-lg font-semibold outline-none transition hover:bg-white/15 focus-visible:ring-[3px] focus-visible:ring-ring/60">
              صمم بنفسك
            </a>
          </div>
        </div>

        {/* the product */}
        <div className="flex flex-col items-center gap-6">
          <Link to={`/shop?cat=${item.slug}`} aria-label={`شوف ${item.name}`} className="relative block w-full max-w-[22rem] outline-none md:max-w-[26rem]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={item.id}
                initial={reduce ? false : { y: 50, scale: 0.8, rotate: -14, opacity: 0 }}
                animate={{ y: 0, scale: 1, rotate: -5, opacity: 1 }}
                exit={reduce ? undefined : { y: -50, scale: 0.85, rotate: 10, opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="block aspect-[4/3.4] rounded-[2.5rem] border-[4px] border-ink bg-white p-4 shadow-sticker-lg"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="size-full rounded-2xl object-cover" />
                ) : hasCategoryArt(item.slug) ? (
                  <CategoryArt slug={item.slug} className="drop-shadow-[0_6px_0_rgba(0,0,0,0.08)]" />
                ) : (
                  <span className="grid size-full place-items-center font-display text-5xl text-ink">{item.name}</span>
                )}
              </motion.span>
            </AnimatePresence>
            {/* spare sparkle stickers that float around the product */}
            <span aria-hidden="true" style={{ '--float': '-9px', '--dur': '3.6s' } as React.CSSProperties} className="animate-float absolute -top-4 -end-3 grid size-14 rotate-12 place-items-center rounded-full border-[3px] border-ink bg-accent text-2xl text-ink shadow-sticker-sm">
              ✦
            </span>
            <span aria-hidden="true" style={{ '--float': '8px', '--dur': '4.4s' } as React.CSSProperties} className="animate-float absolute -bottom-3 -start-4 size-9 -rotate-6 rounded-lg border-[3px] border-ink bg-white shadow-sticker-sm" />
          </Link>

          {/* position indicator: one dot per category, the current one stretches */}
          <ul className="flex items-center justify-center" aria-label="اختار منتج">
            {items.map((it, idx) => {
              const active = idx === i % count
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    aria-label={it.name}
                    aria-current={active}
                    onClick={() => setI(idx)}
                    className="group grid h-8 place-items-center px-1 outline-none"
                  >
                    <span
                      className={cn(
                        'block h-3 rounded-full border-2 border-ink bg-white transition-all duration-300 group-focus-visible:ring-[3px] group-focus-visible:ring-ring/60',
                        active ? 'w-6' : 'w-3 opacity-60 group-hover:opacity-100',
                      )}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
