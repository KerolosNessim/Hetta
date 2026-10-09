import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form-controls'
import { Pagination, paginate } from '@/components/ui/pagination'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/misc'
import { ProductCard } from '@/components/store/product-card'
import { getCategories, getProducts } from '@/lib/api'
import { startingPrice } from '@/lib/types'
import { useAsync } from '@/lib/use-async'
import { cn, formatPrice } from '@/lib/utils'

const PAGE_SIZE = 12
const n = (v: number) => v.toLocaleString('ar-EG')

export default function ShopPage() {
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') ?? ''
  const q = params.get('q') ?? ''
  const kind = (params.get('kind') as 'single' | 'pack' | null) ?? undefined
  const sort = (params.get('sort') as 'default' | 'newest' | null) ?? 'default'
  const min = params.get('min') ?? ''
  const max = params.get('max') ?? ''
  const pageParam = Number(params.get('page')) || 1
  const [text, setText] = useState(q)
  const [drawer, setDrawer] = useState(false)
  const results = useRef<HTMLDivElement>(null)
  useEffect(() => setText(q), [q])

  const cats = useAsync(() => getCategories(), [])
  const everything = useAsync(() => getProducts(), [])
  const products = useAsync(() => getProducts({ categorySlug: cat || undefined, search: q || undefined, kind, sort }), [cat, q, kind, sort])

  // any filter change goes back to page 1; only an explicit `page` in the patch keeps it
  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    if (!('page' in patch)) next.delete('page')
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }

  // counts per category and per kind, from the unfiltered list
  const counts = useMemo(() => {
    const byCat: Record<string, number> = {}
    const byKind = { single: 0, pack: 0 }
    for (const p of everything.data ?? []) {
      if (p.category) {
        byCat[p.category.slug] = (byCat[p.category.slug] ?? 0) + 1
        // a main category's count includes its sub-categories' products
        const parent = p.category.parent_id && cats.data?.find((c) => c.id === p.category!.parent_id)
        if (parent) byCat[parent.slug] = (byCat[parent.slug] ?? 0) + 1
      }
      byKind[p.kind]++
    }
    return { byCat, byKind, total: everything.data?.length ?? 0 }
  }, [everything.data, cats.data])

  const bounds = useMemo(() => {
    const prices = (everything.data ?? []).map(startingPrice).filter((p): p is number => p != null)
    return prices.length ? { lo: Math.floor(Math.min(...prices)), hi: Math.ceil(Math.max(...prices)) } : null
  }, [everything.data])

  const shown = useMemo(() => {
    const lo = min ? Number(min) : null
    const hi = max ? Number(max) : null
    return (products.data ?? []).filter((p) => {
      const price = startingPrice(p)
      if (price == null) return lo == null && hi == null
      return (lo == null || price >= lo) && (hi == null || price <= hi)
    })
  }, [products.data, min, max])

  const paged = paginate(shown, pageParam, PAGE_SIZE)
  const goToPage = (p: number) => {
    update({ page: p > 1 ? String(p) : undefined })
    results.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeCat = cats.data?.find((c) => c.slug === cat)
  // the main category in play (the active one, or the parent of the active sub-category) and its sub-categories
  const mainCat = activeCat?.parent_id ? cats.data?.find((c) => c.id === activeCat.parent_id) : activeCat
  const subs = mainCat ? (cats.data ?? []).filter((c) => c.parent_id === mainCat.id) : []
  const title = (activeCat && mainCat && mainCat !== activeCat ? `${mainCat.name} — ${activeCat.name}` : activeCat?.name) ?? (kind === 'pack' ? 'الباكدجات' : 'كل المنتجات')
  const chips = [
    activeCat && { label: activeCat.name, clear: { cat: undefined } },
    kind && { label: kind === 'pack' ? 'باكدج' : 'منتج فردي', clear: { kind: undefined } },
    q && { label: `بحث: ${q}`, clear: { q: undefined } },
    (min || max) && { label: min && max ? `${n(Number(min))} – ${n(Number(max))} ج` : min ? `من ${n(Number(min))} ج` : `لحد ${n(Number(max))} ج`, clear: { min: undefined, max: undefined } },
  ].filter(Boolean) as { label: string; clear: Record<string, undefined> }[]

  const panelProps = {
    text,
    setText,
    onSearch: () => update({ q: text.trim() || undefined }),
    cats: cats.data ?? [],
    counts,
    cat,
    kind,
    sort,
    min,
    max,
    bounds,
    update,
    onClear: () => setParams({}, { replace: true }),
    activeCount: chips.length,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-6xl">{title}</h1>
          <p className="mt-1 text-muted-foreground" aria-live="polite">
            {products.loading ? ' ' : shown.length ? `عرض ${n(paged.from + 1)}–${n(paged.to)} من ${n(shown.length)} منتج` : '٠ منتج'}
          </p>
        </div>
        <Button variant="outlineInk" className="relative lg:hidden" onClick={() => setDrawer(true)}>
          <SlidersHorizontalIcon className="size-5" />
          فلتر
          {chips.length > 0 && <span className="absolute -top-2 -start-2 grid size-6 place-items-center rounded-full bg-orange text-xs font-bold text-white">{n(chips.length)}</span>}
        </Button>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="right" className="gap-5 overflow-y-auto p-6" aria-describedby={undefined}>
          <SheetTitle className="sr-only">فلتر المنتجات</SheetTitle>
          <FilterPanel {...panelProps} idPrefix="m" />
          <Button size="lg" className="mt-auto" onClick={() => setDrawer(false)}>
            اعرض {n(shown.length)} منتج
          </Button>
        </SheetContent>
      </Sheet>

      <div className="lg:grid lg:grid-cols-[290px_1fr] lg:items-start lg:gap-8">
        <aside aria-label="الفلاتر" className="sticky top-24 hidden max-h-[calc(100svh-7rem)] overflow-y-auto rounded-2xl border-2 border-ink bg-card p-5 shadow-sticker-sm lg:block">
          <FilterPanel {...panelProps} idPrefix="s" />
        </aside>
        <div ref={results} className="scroll-mt-28">
          {chips.length > 0 && (
            <ul className="mb-5 flex flex-wrap items-center gap-2" aria-label="الفلاتر المفعّلة">
              {chips.map((c) => (
                <li key={c.label}>
                  <button
                    type="button"
                    onClick={() => update(c.clear)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-ink bg-accent ps-3.5 pe-2.5 text-sm font-medium outline-none transition hover:bg-accent/80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label={`إزالة ${c.label}`}
                  >
                    {c.label}
                    <XIcon className="size-4" />
                  </button>
                </li>
              ))}
              <li>
                <Button variant="link" className="px-2" onClick={() => setParams({}, { replace: true })}>
                  مسح الكل
                </Button>
              </li>
            </ul>
          )}

          {subs.length > 0 && (
            <ul className="mb-5 flex flex-wrap gap-2" aria-label="الأقسام الفرعية">
              {subs.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={cat === s.slug}
                    onClick={() => update({ cat: cat === s.slug ? mainCat!.slug : s.slug })}
                    className={cn(
                      'h-10 rounded-full border-2 border-ink px-4 font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      cat === s.slug ? 'bg-ink text-white' : 'bg-card hover:bg-secondary',
                    )}
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {products.error && <p role="alert" className="text-destructive">حصلت مشكلة في التحميل: {products.error}</p>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-6">
            {products.loading
              ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-72 md:h-96" />)
              : paged.slice.map((p) => <ProductCard key={p.id} product={p} color={p.category?.color ?? '#0B6E6D'} />)}
          </div>
          {!products.loading && !shown.length && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input py-16 text-center text-muted-foreground">
              مفيش منتجات بالفلاتر دي. جرّب قسم تاني أو وسّع السعر.
              {chips.length > 0 && <Button variant="outlineInk" onClick={() => setParams({}, { replace: true })}>امسح الفلاتر</Button>}
            </div>
          )}
          {!products.loading && <Pagination className="mt-10" page={paged.page} count={paged.count} onChange={goToPage} />}
        </div>
      </div>
    </div>
  )
}

type PanelProps = {
  text: string
  setText: (v: string) => void
  onSearch: () => void
  cats: { id: string; name: string; slug: string; color: string; parent_id: string | null }[]
  counts: { byCat: Record<string, number>; byKind: { single: number; pack: number }; total: number }
  cat: string
  kind?: 'single' | 'pack'
  sort: string
  min: string
  max: string
  bounds: { lo: number; hi: number } | null
  update: (patch: Record<string, string | undefined>) => void
  onClear: () => void
  activeCount: number
  idPrefix: string
}

/** Three price bands across the real price range, rounded to 5 so the labels look intentional. */
function priceBands(b: { lo: number; hi: number } | null) {
  if (!b || b.hi - b.lo < 20) return []
  const round = (v: number) => Math.round(v / 5) * 5
  const t1 = round(b.lo + (b.hi - b.lo) / 3)
  const t2 = round(b.lo + ((b.hi - b.lo) * 2) / 3)
  if (t1 <= b.lo || t2 <= t1 || t2 >= b.hi) return []
  return [
    { label: `لحد ${n(t1)} ج`, min: undefined, max: String(t1) },
    { label: `${n(t1)} – ${n(t2)} ج`, min: String(t1), max: String(t2) },
    { label: `من ${n(t2)} ج`, min: String(t2), max: undefined },
  ]
}

function FilterPanel({ text, setText, onSearch, cats, counts, cat, kind, sort, min, max, bounds, update, onClear, activeCount, idPrefix }: PanelProps) {
  // price fields commit on blur / Enter so the grid doesn't refilter on every keystroke
  const [lo, setLo] = useState(min)
  const [hi, setHi] = useState(max)
  useEffect(() => setLo(min), [min])
  useEffect(() => setHi(max), [max])
  const commit = () => update({ min: lo || undefined, max: hi || undefined })
  const bands = priceBands(bounds)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl">الفلاتر</h2>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <XIcon className="size-4" /> مسح الكل
          </button>
        )}
      </div>

      <form role="search" className="relative" onSubmit={(e) => (e.preventDefault(), onSearch())}>
        <label htmlFor={`${idPrefix}-q`} className="sr-only">ابحث عن منتج</label>
        <SearchIcon className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={`${idPrefix}-q`} value={text} onChange={(e) => setText(e.target.value)} placeholder="ابحث عن منتج…" className="border-2 border-ink bg-background ps-9" />
      </form>

      <Section title="الأقسام">
        <div className="flex flex-col gap-1">
          <Option active={!cat} count={counts.total} onClick={() => update({ cat: undefined })}>الكل</Option>
          {cats.filter((c) => !c.parent_id).map((c) => {
            const subs = cats.filter((s) => s.parent_id === c.id)
            // sub-categories show while their main category (or one of them) is selected
            const open = cat === c.slug || subs.some((s) => s.slug === cat)
            return (
              <div key={c.id} className="flex flex-col gap-1">
                <Option dot={c.color} active={cat === c.slug} count={counts.byCat[c.slug] ?? 0} onClick={() => update({ cat: cat === c.slug ? undefined : c.slug })}>
                  {c.name}
                </Option>
                {open && subs.length > 0 && (
                  <div className="ms-5 flex flex-col gap-1 border-s-2 border-ink/15 ps-2">
                    {subs.map((s) => (
                      <Option key={s.id} small active={cat === s.slug} count={counts.byCat[s.slug] ?? 0} onClick={() => update({ cat: cat === s.slug ? c.slug : s.slug })}>
                        {s.name}
                      </Option>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="النوع">
        <Segmented
          value={kind ?? ''}
          onChange={(v) => update({ kind: v || undefined })}
          options={[
            { value: '', label: 'الكل' },
            { value: 'single', label: 'فردي', count: counts.byKind.single },
            { value: 'pack', label: 'باكدج', count: counts.byKind.pack },
          ]}
        />
      </Section>

      <Section title="السعر (يبدأ من)">
        {bands.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bands.map((b) => {
              const on = (min || undefined) === b.min && (max || undefined) === b.max
              return (
                <button
                  key={b.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ min: on ? undefined : b.min, max: on ? undefined : b.max })}
                  className={cn(
                    'h-8 rounded-full border-2 border-ink px-3 text-sm font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    on ? 'bg-accent' : 'bg-card hover:bg-secondary',
                  )}
                >
                  {b.label}
                </button>
              )
            })}
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="relative flex-1">
            <span className="sr-only">أقل سعر</span>
            <Input type="number" inputMode="numeric" min={0} dir="ltr" value={lo} placeholder={bounds ? String(bounds.lo) : 'من'} onChange={(e) => setLo(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} className="border-2 border-ink bg-background text-center" />
          </label>
          <span aria-hidden="true" className="text-muted-foreground">–</span>
          <label className="relative flex-1">
            <span className="sr-only">أعلى سعر</span>
            <Input type="number" inputMode="numeric" min={0} dir="ltr" value={hi} placeholder={bounds ? String(bounds.hi) : 'لحد'} onChange={(e) => setHi(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} className="border-2 border-ink bg-background text-center" />
          </label>
        </div>
        {bounds && <p className="text-xs text-muted-foreground">الأسعار من {formatPrice(bounds.lo)} لحد {formatPrice(bounds.hi)}</p>}
      </Section>

      <Section title="الترتيب">
        <Segmented
          value={sort}
          onChange={(v) => update({ sort: v === 'default' ? undefined : v })}
          options={[
            { value: 'default', label: 'المميز' },
            { value: 'newest', label: 'الأحدث' },
          ]}
        />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={title} className="flex flex-col gap-3 border-t-2 border-dashed border-ink/20 pt-5">
      <h3 className="font-display text-xl">{title}</h3>
      {children}
    </div>
  )
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string; count?: number }[] }) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border-2 border-ink bg-secondary p-1">
      {options.map((o) => {
        const on = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            disabled={!on && o.count === 0}
            className={cn(
              'h-9 rounded-lg px-2 text-sm font-semibold outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40',
              on ? 'bg-ink text-white shadow-sm' : 'hover:bg-card',
            )}
          >
            {o.label}
            {o.count != null && <span className={cn('ms-1.5 text-xs font-normal', on ? 'text-white/70' : 'text-muted-foreground')}>{n(o.count)}</span>}
          </button>
        )
      })}
    </div>
  )
}

function Option({ active, count, onClick, dot, small, children }: { active: boolean; count: number; onClick: () => void; dot?: string; small?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={!active && count === 0}
      className={cn(
        'flex items-center gap-2.5 rounded-xl border-2 px-3 text-start font-medium transition outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40',
        small ? 'py-1.5 text-sm' : 'py-2',
        active ? 'border-ink bg-ink text-white' : 'border-transparent hover:bg-secondary',
      )}
    >
      {dot && <span aria-hidden="true" className="size-3.5 shrink-0 rounded-full border-2 border-white/90 ring-1 ring-ink" style={{ background: dot }} />}
      <span className="flex-1">{children}</span>
      <span className={cn('min-w-6 rounded-full px-1.5 text-center text-xs', active ? 'bg-white/20' : 'bg-secondary text-muted-foreground')}>{n(count)}</span>
    </button>
  )
}
