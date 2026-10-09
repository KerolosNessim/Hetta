import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input, Select, Switch } from '@/components/ui/form-controls'
import { Pagination, paginate } from '@/components/ui/pagination'
import { Badge, Card, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/misc'
import { inkFor } from '@/components/store/sticker-art'
import { adminDeleteProduct, adminListCategories, adminListProducts, adminUpdateProduct } from '@/lib/api'
import { categoryLabel, categoryTree, startingPrice } from '@/lib/types'
import { useAsync } from '@/lib/use-async'
import { cn, formatPrice } from '@/lib/utils'

const PAGE_SIZE = 10

type Tab = 'all' | 'published' | 'draft'

export default function AdminProductsPage() {
  const { data, loading, error, setData } = useAsync(adminListProducts, [])
  const cats = useAsync(adminListCategories, [])
  const [tab, setTab] = useState<Tab>('all')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [page, setPage] = useState(1)

  // main category id -> ids of its sub-categories, so filtering by a main category includes them
  const catIdsUnder = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const c of cats.data ?? []) if (c.parent_id) m.set(c.parent_id, (m.get(c.parent_id) ?? new Set()).add(c.id))
    return m
  }, [cats.data])

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (p) =>
          (tab === 'all' || (tab === 'published' ? p.is_published : !p.is_published)) &&
          (!q || p.name.includes(q)) &&
          (!cat || p.category_id === cat || (!!p.category_id && catIdsUnder.get(cat)?.has(p.category_id))),
      ),
    [data, tab, q, cat, catIdsUnder],
  )

  // a new filter starts from the first page
  useEffect(() => setPage(1), [tab, q, cat])
  const paged = paginate(rows, page, PAGE_SIZE)

  async function toggle(id: string, patch: { is_published?: boolean; is_featured?: boolean }) {
    setData((prev) => prev?.map((p) => (p.id === id ? { ...p, ...patch } : p)) ?? null)
    try {
      await adminUpdateProduct(id, patch)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'حصلت مشكلة')
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`تمسح "${name}"؟ مش هينفع ترجّعه.`)) return
    try {
      await adminDeleteProduct(id)
      setData((prev) => prev?.filter((p) => p.id !== id) ?? null)
      toast.success('اتمسح')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'حصلت مشكلة')
    }
  }

  const counts = { all: data?.length ?? 0, published: data?.filter((p) => p.is_published).length ?? 0, draft: data?.filter((p) => !p.is_published).length ?? 0 }

  return (
    <>
      <PageHeader
        title="المنتجات"
        description="أضف وعدّل المنتجات اللي بتظهر في المتجر."
        action={
          <Button asChild>
            <Link to="/admin/products/new">
              <PlusIcon /> إضافة منتج
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="الحالة" className="flex rounded-lg bg-secondary p-1">
          {(['all', 'published', 'draft'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn('h-9 rounded-md px-3.5 text-sm', tab === t ? 'bg-card font-semibold shadow-sm' : 'text-muted-foreground')}
            >
              {{ all: 'الكل', published: 'منشور', draft: 'مسودة' }[t]} ({counts[t].toLocaleString('ar-EG')})
            </button>
          ))}
        </div>
        <label className="min-w-52 flex-1">
          <span className="sr-only">بحث</span>
          <Input placeholder="ابحث باسم المنتج…" value={q} onChange={(e) => setQ(e.target.value)} className="h-10" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          القسم
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 w-auto">
            <option value="">كل الأقسام</option>
            {categoryTree(cats.data ?? []).map(({ cat: c, depth }) => (
              <option key={c.id} value={c.id}>{depth ? `— ${c.name}` : c.name}</option>
            ))}
          </Select>
        </label>
      </div>

      {error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
      <Card className="overflow-hidden">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>المنتج</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>المقاسات</TableHead>
              <TableHead>منشور</TableHead>
              <TableHead>مميز</TableHead>
              <TableHead><span className="sr-only">إجراءات</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-10" /></TableCell>
                </TableRow>
              ))}
            {paged.slice.map((p) => {
              const color = p.category?.color ?? '#0B6E6D'
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt="" className="size-11 rounded-lg object-cover" />
                      ) : (
                        <span className="grid size-11 shrink-0 place-items-center rounded-lg font-display text-xs" style={{ background: color, color: inkFor(color) }}>
                          {p.name.split(' ')[0]}
                        </span>
                      )}
                      <Link to={`/admin/products/${p.id}`} className="font-semibold hover:text-primary">{p.name}</Link>
                      {!p.is_published && <Badge variant="muted">مسودة</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#3e382f]">{categoryLabel(p.category, cats.data ?? []) || '—'}</TableCell>
                  <TableCell>{formatPrice(startingPrice(p))}</TableCell>
                  <TableCell className="text-[#3e382f]">{p.product_sizes.map((s) => s.name).join('، ') || '—'}</TableCell>
                  <TableCell>
                    <Switch checked={p.is_published} onCheckedChange={(v) => toggle(p.id, { is_published: v })} aria-label={`نشر ${p.name}`} />
                  </TableCell>
                  <TableCell>
                    <Switch checked={p.is_featured} onCheckedChange={(v) => toggle(p.id, { is_featured: v })} aria-label={`${p.name} في الأكثر طلباً`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="iconSm">
                        <Link to={`/admin/products/${p.id}`} aria-label={`تعديل ${p.name}`}><PencilIcon /></Link>
                      </Button>
                      <Button variant="ghost" size="iconSm" className="text-destructive" aria-label={`حذف ${p.name}`} onClick={() => remove(p.id, p.name)}>
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {!loading && !rows.length && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  {data?.length ? 'مفيش منتجات بالفلاتر دي.' : 'لسه مفيش منتجات. ابدأ بـ "إضافة منتج".'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {rows.length > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {`عرض ${(paged.from + 1).toLocaleString('ar-EG')}–${paged.to.toLocaleString('ar-EG')} من ${rows.length.toLocaleString('ar-EG')}`}
            </p>
            <Pagination variant="admin" page={paged.page} count={paged.count} onChange={setPage} className="justify-end" />
          </div>
        )}
      </Card>
    </>
  )
}
