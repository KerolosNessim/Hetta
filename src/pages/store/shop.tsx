import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form-controls'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/misc'
import { ProductCard } from '@/components/store/product-card'
import { getBanners, getCategories, getProducts } from '@/lib/api'
import { startingPrice } from '@/lib/types'
import { useAsync } from '@/lib/use-async'
import { cn, formatPrice } from '@/lib/utils'

const n = (v: number) => v.toLocaleString('ar-EG')

export default function ShopPage() {
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') ?? ''
  const q = params.get('q') ?? ''
  const kind = (params.get('kind') as 'single' | 'pack' | null) ?? undefined
  const sort = (params.get('sort') as 'default' | 'newest' | null) ?? 'default'
  const min = params.get('min') ?? ''
  const max = params.get('max') ?? ''
  const [text, setText] = useState(q)
  const [drawer, setDrawer] = useState(false)
  useEffect(() => setText(q), [q])

  const cats = useAsync(() => getCategories(), [])
  const shopBanner = useAsync(() => getBanners('shop'), [])
  const everything = useAsync(() => getProducts(), [])
  const products = useAsync(() => getProducts({ categorySlug: cat || undefined, search: q || undefined, kind, sort }), [cat, q, kind, sort])

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
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
      if (p.category) byCat[p.category.slug] = (byCat[p.category.slug] ?? 0) + 1
      byKind[p.kind]++
    }
    return { byCat, byKind, total: everything.data?.length ?? 0 }
  }, [everything.data])

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

  const activeCat = cats.data?.find((c) => c.slug === cat)
  const title = activeCat?.name ?? (kind === 'pack' ? 'الباكدجات' : 'كل الاستيكرات')
  const chips = [
    activeCat && { label: activeCat.name, clear: { cat: undefined } },
    kind && { label: kind === 'pack' ? 'باكدج' : 'استيكر فردي', clear: { kind: undefined } },
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
    hasFilters: chips.length > 0,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      {shopBanner.data?.[0] && (
        <div className="mb-6 rounded-2xl border-2 border-ink px-5 py-4 text-center font-semibold text-white" style={{ background: shopBanner.data[0].bg_color }}>
          {shopBanner.data[0].title}
        </div>
      )}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-6xl">{title}</h1>
          <p className="mt-1 text-muted-foreground" aria-live="polite">
            {products.loading ? ' ' : `${n(shown.length)} منتج`}
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
          <SheetTitle className="text-primary">فلتر المنتجات</SheetTitle>
          <FilterPanel {...panelProps} idPrefix="m" />
          <Button size="lg" className="mt-auto" onClick={() => setDrawer(false)}>
            اعرض {n(shown.length)} منتج
          </Button>
        </SheetContent>
      </Sheet>

      <div className="lg:grid lg:grid-cols-[270px_1fr] lg:items-start lg:gap-8">
        <aside aria-label="الفلاتر" className="sticky top-24 hidden max-h-[calc(100svh-7rem)] overflow-y-auto rounded-2xl border-2 border-ink bg-card p-5 lg:block">
          <FilterPanel {...panelProps} idPrefix="s" />
        </aside>
        <div>
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

          {products.error && <p role="alert" className="text-destructive">حصلت مشكلة في التحميل: {products.error}</p>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-6">
            {products.loading
              ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-72 md:h-96" />)
              : shown.map((p) => <ProductCard key={p.id} product={p} color={p.category?.color ?? '#0B6E6D'} />)}
          </div>
          {!products.loading && !shown.length && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input py-16 text-center text-muted-foreground">
              مفيش منتجات بالفلاتر دي. جرّب قسم تاني أو وسّع السعر.
              {chips.length > 0 && <Button variant="outlineInk" onClick={() => setParams({}, { replace: true })}>امسح الفلاتر</Button>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type PanelProps = {
  text: string
  setText: (v: string) => void
  onSearch: () => void
  cats: { id: string; name: string; slug: string }[]
  counts: { byCat: Record<string, number>; byKind: { single: number; pack: number }; total: number }
  cat: string
  kind?: 'single' | 'pack'
  sort: string
  min: string
  max: string
  bounds: { lo: number; hi: number } | null
  update: (patch: Record<string, string | undefined>) => void
  onClear: () => void
  hasFilters: boolean
  idPrefix: string
}

function FilterPanel({ text, setText, onSearch, cats, counts, cat, kind, sort, min, max, bounds, update, onClear, hasFilters, idPrefix }: PanelProps) {
  // price fields commit on blur / Enter so the grid doesn't refilter on every keystroke
  const [lo, setLo] = useState(min)
  const [hi, setHi] = useState(max)
  useEffect(() => setLo(min), [min])
  useEffect(() => setHi(max), [max])
  const commit = () => update({ min: lo || undefined, max: hi || undefined })

  return (
    <div className="flex flex-col gap-6">
      <form role="search" className="relative" onSubmit={(e) => (e.preventDefault(), onSearch())}>
        <label htmlFor={`${idPrefix}-q`} className="sr-only">ابحث عن استيكر</label>
        <SearchIcon className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={`${idPrefix}-q`} value={text} onChange={(e) => setText(e.target.value)} placeholder="ابحث عن استيكر…" className="border-2 border-ink ps-9" />
      </form>

      <FilterGroup title="الأقسام">
        <Option active={!cat} count={counts.total} onClick={() => update({ cat: undefined })}>الكل</Option>
        {cats.map((c) => (
          <Option key={c.id} active={cat === c.slug} count={counts.byCat[c.slug] ?? 0} onClick={() => update({ cat: cat === c.slug ? undefined : c.slug })}>
            {c.name}
          </Option>
        ))}
      </FilterGroup>

      <FilterGroup title="النوع">
        <Option active={kind === 'single'} count={counts.byKind.single} onClick={() => update({ kind: kind === 'single' ? undefined : 'single' })}>استيكر فردي</Option>
        <Option active={kind === 'pack'} count={counts.byKind.pack} onClick={() => update({ kind: kind === 'pack' ? undefined : 'pack' })}>باكدج</Option>
      </FilterGroup>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-display text-2xl">السعر (يبدأ من)</legend>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">أقل سعر</span>
            <Input type="number" inputMode="numeric" min={0} dir="ltr" value={lo} placeholder={bounds ? String(bounds.lo) : 'من'} onChange={(e) => setLo(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} className="border-2 border-ink text-center" />
          </label>
          <span aria-hidden="true">–</span>
          <label className="flex-1">
            <span className="sr-only">أعلى سعر</span>
            <Input type="number" inputMode="numeric" min={0} dir="ltr" value={hi} placeholder={bounds ? String(bounds.hi) : 'لحد'} onChange={(e) => setHi(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} className="border-2 border-ink text-center" />
          </label>
        </div>
        {bounds && <p className="text-xs text-muted-foreground">الأسعار من {formatPrice(bounds.lo)} لحد {formatPrice(bounds.hi)}</p>}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-sort`} className="font-display text-2xl">الترتيب</label>
        <Select id={`${idPrefix}-sort`} value={sort} onChange={(e) => update({ sort: e.target.value === 'default' ? undefined : e.target.value })} className="border-2 border-ink">
          <option value="default">المميز أولاً</option>
          <option value="newest">الأحدث</option>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="link" className="justify-start px-0" onClick={onClear}>
          <XIcon /> مسح الفلاتر
        </Button>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={title} className="flex flex-col gap-1">
      <h2 className="mb-1 font-display text-2xl">{title}</h2>
      {children}
    </div>
  )
}

function Option({ active, count, onClick, children }: { active: boolean; count: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={!active && count === 0}
      className={cn(
        'flex items-center justify-between gap-2 rounded-xl border-2 px-3.5 py-2 text-start font-medium transition outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40',
        active ? 'border-ink bg-ink text-white' : 'border-transparent hover:bg-secondary',
      )}
    >
      {children}
      <span className={cn('min-w-6 rounded-full px-1.5 text-center text-xs', active ? 'bg-white/20' : 'bg-secondary text-muted-foreground')}>{n(count)}</span>
    </button>
  )
}
