import { useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/admin-layout'
import { Stars } from '@/components/store/stars'
import { Button } from '@/components/ui/button'
import { Field, Input, Label, Switch, Textarea } from '@/components/ui/form-controls'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui/misc'
import { adminDeleteReview, adminListReviews, adminSaveReview, type ReviewInput } from '@/lib/api'
import type { Review } from '@/lib/types'
import { useAsync } from '@/lib/use-async'
import { cn } from '@/lib/utils'

const EMPTY: ReviewInput = { author_name: '', author_label: '', product_label: '', rating: 5, body: '', is_published: true }

export default function AdminReviewsPage() {
  const { data, loading, error, reload, setData } = useAsync(adminListReviews, [])
  const [draft, setDraft] = useState<ReviewInput>(EMPTY)
  const [saving, setSaving] = useState(false)
  const editing = !!draft.id

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.author_name.trim() || !draft.body.trim()) return toast.error('اكتب اسم العميل ونص الرأي')
    setSaving(true)
    try {
      await adminSaveReview({
        ...draft,
        author_label: draft.author_label?.trim() || null,
        product_label: draft.product_label?.trim() || null,
        sort_order: draft.sort_order ?? (data?.length ?? 0) + 1,
      })
      toast.success(editing ? 'اتعدّل' : 'اتضاف')
      setDraft(EMPTY)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصلت مشكلة')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(r: Review, v: boolean) {
    setData((prev) => prev?.map((x) => (x.id === r.id ? { ...x, is_published: v } : x)) ?? null)
    try {
      await adminSaveReview({ id: r.id, author_name: r.author_name, body: r.body, rating: r.rating, is_published: v })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصلت مشكلة')
      reload()
    }
  }

  async function move(i: number, dir: -1 | 1) {
    if (!data) return
    const next = [...data]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    setData(next)
    try {
      await Promise.all(next.map((r, k) => adminSaveReview({ id: r.id, author_name: r.author_name, body: r.body, rating: r.rating, sort_order: k + 1 })))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصلت مشكلة')
      reload()
    }
  }

  async function remove(r: Review) {
    if (!confirm(`تمسح رأي "${r.author_name}"؟ مش هينفع ترجّعه.`)) return
    try {
      await adminDeleteReview(r.id)
      toast.success('اتمسح')
      if (draft.id === r.id) setDraft(EMPTY)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصلت مشكلة')
    }
  }

  const set = <K extends keyof ReviewInput>(k: K, v: ReviewInput[K]) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <>
      <PageHeader title="آراء العملاء" description="الآراء المنشورة بتظهر في الرئيسية بنفس الترتيب اللي هنا. ضيف آراء عملاء حقيقيين بس." />
      <div className="flex flex-wrap items-start gap-5">
        <Card className="min-w-0 flex-[999_1_480px] overflow-hidden">
          {loading && <Skeleton className="m-4 h-40" />}
          {error && <p role="alert" className="p-4 text-destructive">{error}</p>}
          <ul>
            {data?.map((r, i) => (
              <li key={r.id} className={cn('flex flex-wrap items-center gap-3 border-b px-4 py-3 last:border-0', !r.is_published && 'bg-secondary/40')}>
                <div className="flex flex-col">
                  <Button variant="ghost" size="iconSm" className="h-7" disabled={i === 0} aria-label={`طلّع رأي ${r.author_name} لفوق`} onClick={() => move(i, -1)}>
                    <ArrowUpIcon />
                  </Button>
                  <Button variant="ghost" size="iconSm" className="h-7" disabled={i === data.length - 1} aria-label={`نزّل رأي ${r.author_name} لتحت`} onClick={() => move(i, 1)}>
                    <ArrowDownIcon />
                  </Button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold">{r.author_name}</span>
                    <Stars value={r.rating} />
                  </div>
                  {(r.author_label || r.product_label) && (
                    <div className="text-xs text-muted-foreground">{[r.author_label, r.product_label].filter(Boolean).join(' · ')}</div>
                  )}
                  <p className="mt-1 line-clamp-2 text-sm leading-6">{r.body}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  منشور
                  <Switch checked={r.is_published} onCheckedChange={(v) => togglePublished(r, v)} />
                </label>
                <Button variant="ghost" size="iconSm" aria-label={`تعديل رأي ${r.author_name}`} onClick={() => setDraft(r)}>
                  <PencilIcon />
                </Button>
                <Button variant="ghost" size="iconSm" className="text-destructive" aria-label={`حذف رأي ${r.author_name}`} onClick={() => remove(r)}>
                  <Trash2Icon />
                </Button>
              </li>
            ))}
            {!loading && !error && !data?.length && <li className="p-10 text-center text-muted-foreground">لسه مفيش آراء. ضيف أول رأي من الفورم.</li>}
          </ul>
        </Card>

        <Card className="flex-[1_1_300px]">
          <form onSubmit={save}>
            <CardHeader><CardTitle>{editing ? `تعديل: ${draft.author_name}` : 'إضافة رأي'}</CardTitle></CardHeader>
            <CardContent>
              <Field label="اسم العميل" htmlFor="rv-name">
                <Input id="rv-name" required value={draft.author_name} onChange={(e) => set('author_name', e.target.value)} />
              </Field>
              <Field label="وصف العميل (اختياري)" htmlFor="rv-label" hint="مثلاً: طالبة هندسة — القاهرة">
                <Input id="rv-label" value={draft.author_label ?? ''} onChange={(e) => set('author_label', e.target.value)} />
              </Field>
              <Field label="اشترى إيه (اختياري)" htmlFor="rv-product" hint="مثلاً: ماج سحري بصورتها">
                <Input id="rv-product" value={draft.product_label ?? ''} onChange={(e) => set('product_label', e.target.value)} />
              </Field>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">التقييم</legend>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n.toLocaleString('ar-EG')} نجوم`}
                      aria-pressed={draft.rating === n}
                      onClick={() => set('rating', n)}
                      className="rounded-md p-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <StarIcon className={cn('size-7', n <= draft.rating ? 'fill-[#FFB627] text-ink' : 'text-border')} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <Field label="نص الرأي" htmlFor="rv-body">
                <Textarea id="rv-body" rows={5} required value={draft.body} onChange={(e) => set('body', e.target.value)} />
              </Field>
              <div className="flex items-center justify-between">
                <Label htmlFor="rv-pub">منشور في المتجر</Label>
                <Switch id="rv-pub" checked={draft.is_published ?? true} onCheckedChange={(v) => set('is_published', v)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'بيحفظ…' : editing ? 'حفظ التعديل' : 'إضافة الرأي'}</Button>
                {editing && <Button type="button" variant="outline" onClick={() => setDraft(EMPTY)}>إلغاء</Button>}
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </>
  )
}
