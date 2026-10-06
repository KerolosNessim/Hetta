import { useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/admin-layout'
import { SingleImageUploader } from '@/components/admin/image-uploader'
import { inkFor } from '@/components/store/sticker-art'
import { Button } from '@/components/ui/button'
import { Field, Input, Label, Switch } from '@/components/ui/form-controls'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui/misc'
import { adminDeleteCategory, adminListCategories, adminReorderCategories, adminSaveCategory } from '@/lib/api'
import type { Category } from '@/lib/types'
import { useAsync } from '@/lib/use-async'
import { cn, slugify } from '@/lib/utils'

export const BRAND_SWATCHES = [
  { value: '#0B6E6D', label: 'تيل' },
  { value: '#FFB627', label: 'أصفر' },
  { value: '#F25C05', label: 'برتقالي' },
  { value: '#1B1B1B', label: 'أسود' },
  { value: '#FFF6E5', label: 'كريمي' },
  { value: '#FFC6DD', label: 'بينك' },
]

type Draft = Partial<Category> & { name: string; slug: string }
const EMPTY: Draft = { name: '', slug: '', color: '#0B6E6D', image_url: null, is_visible: true, show_on_home: true }

export default function AdminCategoriesPage() {
  const { data, loading, reload, setData } = useAsync(adminListCategories, [])
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const editing = !!draft.id

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.name.trim() || !draft.slug) return toast.error('اكتب اسم القسم')
    setSaving(true)
    try {
      await adminSaveCategory({ ...draft, sort_order: draft.sort_order ?? (data?.length ?? 0) + 1 })
      toast.success(editing ? 'اتعدّل' : 'اتضاف')
      setDraft(EMPTY)
      reload()
    } catch (err) {
      toast.error(err instanceof Error && err.message.includes('duplicate') ? 'الرابط ده مستخدم' : 'حصلت مشكلة')
    } finally {
      setSaving(false)
    }
  }

  async function move(i: number, dir: -1 | 1) {
    if (!data) return
    const next = [...data]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    setData(next)
    await adminReorderCategories(next.map((c) => c.id))
  }

  async function patch(c: Category, p: Partial<Category>) {
    setData((prev) => prev?.map((x) => (x.id === c.id ? { ...x, ...p } : x)) ?? null)
    await adminSaveCategory({ id: c.id, name: c.name, slug: c.slug, ...p })
  }

  async function remove(c: Category) {
    if (!confirm(`تمسح قسم "${c.name}"؟ المنتجات اللي فيه هتفضل بس من غير قسم.`)) return
    await adminDeleteCategory(c.id)
    toast.success('اتمسح')
    reload()
  }

  return (
    <>
      <PageHeader title="الأقسام" description="رتّب الأقسام بالأسهم، والترتيب ده هو اللي بيظهر في المتجر والرئيسية." />
      <div className="flex flex-wrap items-start gap-5">
        <Card className="min-w-0 flex-[999_1_480px] overflow-hidden">
          {loading && <Skeleton className="m-4 h-40" />}
          <ul>
            {data?.map((c, i) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 border-b px-4 py-3 last:border-0">
                <div className="flex flex-col">
                  <Button variant="ghost" size="iconSm" className="h-7" disabled={i === 0} aria-label={`طلّع ${c.name} لفوق`} onClick={() => move(i, -1)}>
                    <ArrowUpIcon />
                  </Button>
                  <Button variant="ghost" size="iconSm" className="h-7" disabled={i === data.length - 1} aria-label={`نزّل ${c.name} لتحت`} onClick={() => move(i, 1)}>
                    <ArrowDownIcon />
                  </Button>
                </div>
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl font-display text-xs" style={{ background: c.color, color: inkFor(c.color) }}>
                  {c.image_url ? <img src={c.image_url} alt="" className="size-full object-cover" /> : c.name.split(' ')[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">/shop?cat={c.slug}</div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  ظاهر
                  <Switch checked={c.is_visible} onCheckedChange={(v) => patch(c, { is_visible: v })} />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  في الرئيسية
                  <Switch checked={c.show_on_home} onCheckedChange={(v) => patch(c, { show_on_home: v })} />
                </label>
                <Button variant="ghost" size="iconSm" aria-label={`تعديل ${c.name}`} onClick={() => setDraft(c)}>
                  <PencilIcon />
                </Button>
                <Button variant="ghost" size="iconSm" className="text-destructive" aria-label={`حذف ${c.name}`} onClick={() => remove(c)}>
                  <Trash2Icon />
                </Button>
              </li>
            ))}
            {!loading && !data?.length && <li className="p-10 text-center text-muted-foreground">لسه مفيش أقسام.</li>}
          </ul>
        </Card>

        <Card className="flex-[1_1_300px]">
          <form onSubmit={save}>
            <CardHeader><CardTitle>{editing ? `تعديل: ${draft.name}` : 'إضافة قسم'}</CardTitle></CardHeader>
            <CardContent>
              <Field label="اسم القسم" htmlFor="cat-name">
                <Input id="cat-name" placeholder="مثلاً: عربيات" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value, slug: editing ? d.slug : slugify(e.target.value) }))} />
              </Field>
              <Field label="الرابط (slug)" htmlFor="cat-slug">
                <Input id="cat-slug" dir="ltr" className="text-left" value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} />
              </Field>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">لون الكارت</legend>
                <div className="flex flex-wrap gap-2.5">
                  {BRAND_SWATCHES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      aria-label={s.label}
                      aria-pressed={draft.color === s.value}
                      onClick={() => setDraft((d) => ({ ...d, color: s.value }))}
                      className={cn('size-9 rounded-full border-2', draft.color === s.value ? 'border-ink ring-2 ring-ink ring-offset-2' : 'border-border')}
                      style={{ background: s.value }}
                    />
                  ))}
                </div>
              </fieldset>
              <SingleImageUploader label="صورة القسم (اختياري)" value={draft.image_url ?? null} onChange={(v) => setDraft((d) => ({ ...d, image_url: v }))} folder="categories" />
              <div className="flex items-center justify-between">
                <Label htmlFor="cat-home">يظهر في الرئيسية</Label>
                <Switch id="cat-home" checked={draft.show_on_home ?? true} onCheckedChange={(v) => setDraft((d) => ({ ...d, show_on_home: v }))} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>{editing ? 'حفظ التعديل' : 'إضافة القسم'}</Button>
                {editing && <Button type="button" variant="outline" onClick={() => setDraft(EMPTY)}>إلغاء</Button>}
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </>
  )
}
