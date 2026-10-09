export type Category = {
  id: string
  name: string
  slug: string
  color: string
  image_url: string | null
  parent_id: string | null
  is_visible: boolean
  show_on_home: boolean
  sort_order: number
}

export type ProductSize = {
  id?: string
  product_id?: string
  name: string
  dimensions: string | null
  price: number
  is_available: boolean
  sort_order: number
}

export type Badge = 'best_seller' | 'new' | 'sale'

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  kind: 'single' | 'pack'
  badge: Badge | null
  images: string[]
  is_published: boolean
  is_featured: boolean
  sort_order: number
  product_sizes: ProductSize[]
  category?: Pick<Category, 'id' | 'name' | 'slug' | 'color' | 'parent_id'> | null
}

export type Settings = {
  whatsapp_number: string
  instagram_handle: string | null
  tiktok_handle: string | null
  shipping_note: string | null
  bulk_min_qty: number | null
}

export const BADGE_LABEL: Record<Badge, string> = { best_seller: 'الأكثر طلباً', new: 'جديد', sale: 'عرض' }

/** Lowest available price, used on product cards ("يبدأ من"). */
export function startingPrice(p: Pick<Product, 'product_sizes'>) {
  const prices = p.product_sizes.filter((s) => s.is_available).map((s) => Number(s.price))
  return prices.length ? Math.min(...prices) : null
}

/** Main categories followed by their sub-categories, each with its depth (0 or 1). */
export function categoryTree<T extends Pick<Category, 'id' | 'parent_id'>>(cats: T[]): { cat: T; depth: number }[] {
  const ids = new Set(cats.map((c) => c.id))
  const isTop = (c: T) => !c.parent_id || !ids.has(c.parent_id)
  return cats.filter(isTop).flatMap((top) => [
    { cat: top, depth: 0 },
    ...cats.filter((c) => c.parent_id === top.id).map((cat) => ({ cat, depth: 1 })),
  ])
}

/** "Main › Sub" for a sub-category, or just the name for a main category. */
export function categoryLabel(cat: Pick<Category, 'name' | 'parent_id'> | null | undefined, all: Pick<Category, 'id' | 'name'>[] = []) {
  if (!cat) return ''
  const parent = cat.parent_id ? all.find((c) => c.id === cat.parent_id) : undefined
  return parent ? `${parent.name} › ${cat.name}` : cat.name
}

export type Review = {
  id: string
  author_name: string
  author_label: string | null
  product_label: string | null
  rating: number
  body: string
  is_published: boolean
  sort_order: number
  created_at: string
}
