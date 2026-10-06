import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Skeleton } from '@/components/ui/misc'
import { ProductCard } from '@/components/store/product-card'
import { StickerArt } from '@/components/store/sticker-art'
import { WhatsappIcon } from '@/components/store/whatsapp-icon'
import { getProductBySlug, getProducts } from '@/lib/api'
import { useCart } from '@/lib/cart'
import { useSettings } from '@/lib/settings'
import { BADGE_LABEL, FINISH_LABEL, type Finish } from '@/lib/types'
import { useAsync } from '@/lib/use-async'
import { cn, formatPrice } from '@/lib/utils'
import { whatsappLink } from '@/lib/whatsapp'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, loading } = useAsync(() => getProductBySlug(slug), [slug])
  const related = useAsync(
    () => (product?.category ? getProducts({ categorySlug: product.category.slug, limit: 5 }) : Promise.resolve([])),
    [product?.id],
  )
  const { add } = useCart()
  const { settings } = useSettings()
  const [sizeIdx, setSizeIdx] = useState(0)
  const [finish, setFinish] = useState<Finish>('matte')
  const [qty, setQty] = useState(1)
  const [image, setImage] = useState(0)

  useEffect(() => {
    if (!product) return
    const firstAvailable = product.product_sizes.findIndex((s) => s.is_available)
    setSizeIdx(Math.max(0, firstAvailable))
    setFinish(product.finishes[0] ?? 'matte')
    setQty(1)
    setImage(0)
    document.title = `${product.name} — حتة`
  }, [product])

  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 md:grid-cols-2 md:px-6">
        <Skeleton className="aspect-square" />
        <Skeleton className="h-96" />
      </div>
    )
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">المنتج ده مش موجود</h1>
        <Button asChild variant="sticker" className="mt-6">
          <Link to="/shop">ارجع للمتجر</Link>
        </Button>
      </div>
    )
  }

  const color = product.category?.color ?? '#0B6E6D'
  const size = product.product_sizes[sizeIdx]
  const canBuy = !!size?.is_available

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-28 md:px-6 md:pb-0">
      <nav aria-label="مسار التصفح" className="mb-5 flex flex-wrap gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">الرئيسية</Link>/
        {product.category && (
          <>
            <Link to={`/shop?cat=${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>/
          </>
        )}
        <span aria-current="page" className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-3">
          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl border-2 border-ink bg-secondary">
            <StickerArt image={product.images[image]} label={product.name} color={color} size="lg" tilt={-6} className="max-md:text-4xl" />
            {product.badge && <Badge variant="highlight" className="absolute top-4 start-4 text-sm">{BADGE_LABEL[product.badge]}</Badge>}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImage(i)}
                  aria-label={`الصورة ${i + 1}`}
                  aria-pressed={i === image}
                  className={cn('size-16 overflow-hidden rounded-xl border-2 bg-card', i === image ? 'border-primary ring-2 ring-primary' : 'border-border')}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
            <div className="text-2xl font-bold text-primary">{formatPrice(size ? Number(size.price) : null)}</div>
            {product.description && <p className="leading-8 text-muted-foreground">{product.description}</p>}
          </div>

          {product.product_sizes.length > 0 && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 font-semibold">المقاس</legend>
              <div className="flex flex-wrap gap-2.5">
                {product.product_sizes.map((s, i) => (
                  <button
                    key={s.id ?? s.name}
                    type="button"
                    disabled={!s.is_available}
                    aria-pressed={i === sizeIdx}
                    onClick={() => setSizeIdx(i)}
                    className={cn(
                      'flex min-h-13 min-w-24 flex-1 flex-col items-center justify-center rounded-xl border-2 border-ink px-3 py-1.5 font-semibold transition outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through',
                      i === sizeIdx ? 'bg-ink text-white' : 'bg-card hover:bg-secondary',
                    )}
                  >
                    {s.name}
                    {s.dimensions && <span className="text-xs font-normal opacity-80">{s.dimensions} سم</span>}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {product.finishes.length > 1 && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 font-semibold">الخامة</legend>
              <div className="flex gap-2.5">
                {product.finishes.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={f === finish}
                    onClick={() => setFinish(f)}
                    className={cn('h-12 flex-1 rounded-xl border-2 border-ink font-semibold transition outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50', f === finish ? 'bg-ink text-white' : 'bg-card hover:bg-secondary')}
                  >
                    {FINISH_LABEL[f]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="flex items-center justify-between">
            <span className="font-semibold">الكمية</span>
            <div className="flex items-center rounded-xl border-2 border-ink bg-card">
              <Button variant="ghost" size="icon" aria-label="زوّد" onClick={() => setQty((q) => q + 1)}><PlusIcon /></Button>
              <span className="min-w-8 text-center text-lg font-bold" aria-live="polite">{qty.toLocaleString('ar-EG')}</span>
              <Button variant="ghost" size="icon" aria-label="قلّل" onClick={() => setQty((q) => Math.max(1, q - 1))}><MinusIcon /></Button>
            </div>
          </div>

          {settings.shipping_note && <p className="rounded-2xl bg-teal-subtle p-4 text-sm leading-7">{settings.shipping_note}</p>}

          <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t-2 border-ink bg-card p-3 md:static md:border-0 md:bg-transparent md:p-0">
            <Button
              variant="sticker"
              size="lg"
              className="flex-1"
              disabled={!canBuy}
              onClick={() => size && add({ productId: product.id, slug: product.slug, name: product.name, color, sizeName: size.name, finish, price: Number(size.price) }, qty)}
            >
              {canBuy ? 'أضف للسلة' : 'غير متاح دلوقتي'}
            </Button>
            {settings.whatsapp_number && (
              <Button asChild variant="stickerPrimary" size="lg" className="w-13 px-0 md:w-auto md:px-5">
                <a href={whatsappLink(settings.whatsapp_number, `أهلاً حتة، عندي سؤال عن "${product.name}"`)} target="_blank" rel="noreferrer" aria-label="اسأل على الواتساب">
                  <WhatsappIcon className="size-5" />
                  <span className="hidden md:inline">اسأل</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {!!related.data?.filter((p) => p.id !== product.id).length && (
        <section aria-labelledby="rel-h" className="mt-16">
          <h2 id="rel-h" className="mb-5 font-display text-3xl">ممكن يعجبك كمان</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {related.data
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} color={p.category?.color ?? color} />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
