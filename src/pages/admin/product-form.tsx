import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRightIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { ImageListUploader } from '@/components/admin/image-uploader'
import { Button } from '@/components/ui/button'
import { Field, Input, Label, Select, Switch, Textarea } from '@/components/ui/form-controls'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui/misc'
import { adminDeleteProduct, adminGetProduct, adminListCategories, adminSaveProduct, type ProductInput } from '@/lib/api'
import { BADGE_LABEL, FINISH_LABEL, type Badge, type Finish, type ProductSize } from '@/lib/types'
import { useAsync } from '@/lib/use-async'
import { slugify } from '@/lib/utils'

const EMPTY: ProductInput = {
  name: '',
  slug: '',
  description: '',
  category_id: null,
  kind: 'single',
  badge: null,
  finishes: ['matte', 'gloss'],
  images: [],
  is_published: false,
  is_featured: false,
  sort_order: 0,
  product_sizes: [
    { name: 'صغير', dimensions: '', price: 0, is_available: true, sort_order: 0 },
    { name: 'وسط', dimensions: '', price: 0, is_available: true, sort_order: 1 },
    { name: 'كبير', dimensions: '', price: 0, is_available: true, sort_order: 2 },
  ],
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const cats = useAsync(adminListCategories, [])
  const existing = useAsync(() => (isNew ? Promise.resolve(null) : adminGetProduct(id!)), [id])
  const [form, setForm] = useState<ProductInput>(EMPTY)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing.data) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category, ...rest } = existing.data
      setForm(rest)
      setSlugTouched(true)
    }
  }, [existing.data])

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const setSize = (i: number, patch: Partial<ProductSize>) => set('product_sizes', form.product_sizes.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) return toast.error('اكتب اسم المنتج والرابط')
    if (!form.product_sizes.length) return toast.error('ضيف مقاس واحد على الأقل')
    if (form.product_sizes.some((s) => !s.name.trim() || !(Number(s.price) > 0))) return toast.error('كل مقاس محتاج اسم وسعر أكبر من صفر')
    setSaving(true)
    try {
      const savedId = await adminSaveProduct({ ...form, id: isNew ? undefined : id, product_sizes: form.product_sizes.map((s) => ({ ...s, price: Number(s.price), dimensions: s.dimensions || null })) })
      toast.success('اتحفظ')
      if (isNew) navigate(`/admin/products/${savedId}`, { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      toast.error(msg.includes('duplicate') ? 'الرابط ده مستخدم لمنتج تاني' : msg || 'حصلت مشكلة')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (isNew || !confirm(`تمسح "${form.name}"؟`)) return
    await adminDeleteProduct(id!)
    toast.success('اتمسح')
    navigate('/admin/products')
  }

  if (!isNew && existing.loading) return <Skeleton className="h-[600px]" />
  if (!isNew && !existing.data) return <p>المنتج مش موجود. <Link to="/admin/products" className="text-primary">ارجع للمنتجات</Link></p>

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon">
            <Link to="/admin/products" aria-label="رجوع للمنتجات"><ArrowRightIcon /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? 'منتج جديد' : form.name || 'تعديل منتج'}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/admin/products">إلغاء</Link></Button>
          <Button type="submit" disabled={saving}>{saving ? 'بيحفظ…' : 'حفظ'}</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <Card>
            <CardHeader><CardTitle>البيانات الأساسية</CardTitle></CardHeader>
            <CardContent>
              <Field label="اسم المنتج" htmlFor="name">
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => {
                    set('name', e.target.value)
                    if (!slugTouched) set('slug', slugify(e.target.value))
                  }}
                />
              </Field>
              <Field label="الرابط (slug)" htmlFor="slug" hint={`هيظهر كده: /p/${form.slug || '…'}`}>
                <Input id="slug" dir="ltr" className="text-left" required value={form.slug} onChange={(e) => (setSlugTouched(true), set('slug', slugify(e.target.value)))} />
              </Field>
              <Field label="الوصف" htmlFor="desc">
                <Textarea id="desc" rows={4} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>الصور</CardTitle></CardHeader>
            <CardContent>
              <ImageListUploader value={form.images} onChange={(v) => set('images', v)} folder="products" />
              <p className="text-xs text-muted-foreground">PNG أو JPG أو WebP، لحد ٢ ميجا. أول صورة هي اللي بتظهر في الكارت. لو مفيش صور، الكارت بيعرض استيكر بلون القسم.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>المقاسات والأسعار</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => set('product_sizes', [...form.product_sizes, { name: '', dimensions: '', price: 0, is_available: true, sort_order: form.product_sizes.length }])}>
                <PlusIcon /> إضافة مقاس
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-2 text-sm">
                <span className="text-muted-foreground">المقاس</span>
                <span className="text-muted-foreground">الأبعاد (سم)</span>
                <span className="text-muted-foreground">السعر (ج)</span>
                <span className="text-muted-foreground">متاح</span>
                <span />
                {form.product_sizes.map((s, i) => (
                  <SizeRow key={i} s={s} i={i} onChange={setSize} onRemove={() => set('product_sizes', form.product_sizes.filter((_, j) => j !== i))} />
                ))}
              </div>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">الخامات المتاحة</legend>
                <div className="flex gap-5">
                  {(Object.keys(FINISH_LABEL) as Finish[]).map((f) => (
                    <label key={f} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="size-[18px] accent-primary"
                        checked={form.finishes.includes(f)}
                        onChange={(e) => set('finishes', e.target.checked ? [...form.finishes, f] : form.finishes.filter((x) => x !== f))}
                      />
                      {FINISH_LABEL[f]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-[1_1_280px] flex-col gap-5">
          <Card>
            <CardHeader><CardTitle>النشر</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="pub">منشور في المتجر</Label>
                <Switch id="pub" checked={form.is_published} onCheckedChange={(v) => set('is_published', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="feat">يظهر في "الأكثر طلباً"</Label>
                <Switch id="feat" checked={form.is_featured} onCheckedChange={(v) => set('is_featured', v)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>التصنيف</CardTitle></CardHeader>
            <CardContent>
              <Field label="القسم" htmlFor="cat">
                <Select id="cat" value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || null)}>
                  <option value="">بدون قسم</option>
                  {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="النوع" htmlFor="kind">
                <Select id="kind" value={form.kind} onChange={(e) => set('kind', e.target.value as 'single' | 'pack')}>
                  <option value="single">استيكر فردي</option>
                  <option value="pack">باكدج</option>
                </Select>
              </Field>
              <Field label="شارة على الكارت" htmlFor="badge">
                <Select id="badge" value={form.badge ?? ''} onChange={(e) => set('badge', (e.target.value || null) as Badge | null)}>
                  <option value="">بدون</option>
                  {(Object.keys(BADGE_LABEL) as Badge[]).map((b) => <option key={b} value={b}>{BADGE_LABEL[b]}</option>)}
                </Select>
              </Field>
              <Field label="ترتيب الظهور" htmlFor="order" hint="الرقم الأصغر يظهر الأول">
                <Input id="order" type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
              </Field>
            </CardContent>
          </Card>
          {!isNew && (
            <Button type="button" variant="outline" className="border-[#f28b82] bg-[#fdecec] text-destructive hover:bg-[#fbd9d9]" onClick={remove}>
              <Trash2Icon /> حذف المنتج
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

function SizeRow({ s, i, onChange, onRemove }: { s: ProductSize; i: number; onChange: (i: number, p: Partial<ProductSize>) => void; onRemove: () => void }) {
  return (
    <>
      <Input aria-label={`اسم المقاس ${i + 1}`} value={s.name} onChange={(e) => onChange(i, { name: e.target.value })} className="h-10" />
      <Input aria-label={`أبعاد المقاس ${i + 1}`} placeholder="5×5" dir="ltr" value={s.dimensions ?? ''} onChange={(e) => onChange(i, { dimensions: e.target.value })} className="h-10 text-end" />
      <Input aria-label={`سعر المقاس ${i + 1}`} type="number" min={0} step="0.5" value={s.price || ''} onChange={(e) => onChange(i, { price: Number(e.target.value) })} className="h-10" />
      <input type="checkbox" aria-label={`المقاس ${i + 1} متاح`} className="size-[18px] justify-self-center accent-primary" checked={s.is_available} onChange={(e) => onChange(i, { is_available: e.target.checked })} />
      <Button type="button" variant="ghost" size="iconSm" className="text-destructive" aria-label={`امسح المقاس ${i + 1}`} onClick={onRemove}>
        <Trash2Icon />
      </Button>
    </>
  )
}
