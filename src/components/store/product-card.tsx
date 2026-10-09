import { Link } from 'react-router-dom'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/misc'
import { useCart } from '@/lib/cart'
import { BADGE_LABEL, startingPrice, type Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { StickerArt, tiltFor } from './sticker-art'

export function ProductCard({ product, color }: { product: Product; color: string }) {
  const { add } = useCart()
  const price = startingPrice(product)
  const firstSize = product.product_sizes.find((s) => s.is_available)
  const hasChoices = product.product_sizes.filter((s) => s.is_available).length > 1

  return (
    <article className="group animate-in fade-in slide-in-from-bottom-3 duration-500 transition-transform hover:-translate-y-1 flex flex-col gap-3 rounded-2xl border-2 border-ink bg-card p-3 md:p-4">
      <Link
        to={`/p/${product.slug}`}
        className="relative grid h-36 place-items-center overflow-hidden rounded-xl bg-secondary md:h-56"
        aria-label={product.name}
      >
        <StickerArt image={product.images[0]} label={product.name} color={color} tilt={tiltFor(product.id)} size="md" className="max-md:text-lg max-md:px-3 max-md:py-2 max-md:border-[5px] transition-transform group-hover:scale-105" />
        {product.badge && (
          <Badge variant="highlight" className="absolute top-2.5 start-2.5">
            {BADGE_LABEL[product.badge]}
          </Badge>
        )}
      </Link>
      <div className="flex flex-col gap-0.5">
        {product.category && <span className="text-xs text-muted-foreground md:text-sm">{product.category.name}</span>}
        <Link to={`/p/${product.slug}`} className="font-semibold leading-snug hover:text-primary md:text-lg">
          {product.name}
        </Link>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-primary md:text-base">
          {hasChoices && price != null && <span className="font-normal text-muted-foreground">من </span>}
          {formatPrice(price)}
        </span>
        {hasChoices || !firstSize ? (
          <Button asChild variant="sticker" size="sm" className="max-md:size-11 max-md:p-0">
            <Link to={`/p/${product.slug}`} aria-label={`اختار مقاس ${product.name}`}>
              <PlusIcon className="md:hidden" />
              <span className="max-md:sr-only">اختار</span>
            </Link>
          </Button>
        ) : (
          <Button
            variant="sticker"
            size="sm"
            className="max-md:size-11 max-md:p-0"
            aria-label={`أضف ${product.name} للسلة`}
            onClick={() =>
              add({ productId: product.id, slug: product.slug, name: product.name, color, sizeName: firstSize.name, price: Number(firstSize.price) })
            }
          >
            <PlusIcon className="md:hidden" />
            <span className="max-md:sr-only">أضف للسلة</span>
          </Button>
        )}
      </div>
    </article>
  )
}
