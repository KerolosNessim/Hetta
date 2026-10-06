export type Category = {
  id: string
  name: string
  slug: string
  color: string
  image_url: string | null
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

export type Finish = 'matte' | 'gloss'
export type Badge = 'best_seller' | 'new' | 'sale'

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  kind: 'single' | 'pack'
  badge: Badge | null
  finishes: Finish[]
  images: string[]
  is_published: boolean
  is_featured: boolean
  sort_order: number
  product_sizes: ProductSize[]
  category?: Pick<Category, 'id' | 'name' | 'slug' | 'color'> | null
}

export type BannerPlacement = 'home_hero' | 'home_middle' | 'announcement' | 'shop'
export type BannerTarget = 'shop' | 'category' | 'product' | 'whatsapp' | 'url'

export type Banner = {
  id: string
  title: string
  subtitle: string | null
  placement: BannerPlacement
  cta_label: string | null
  cta_target: BannerTarget
  cta_value: string | null
  bg_color: string
  image_desktop_url: string | null
  image_mobile_url: string | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  sort_order: number
}

export type Settings = {
  whatsapp_number: string
  instagram_handle: string | null
  tiktok_handle: string | null
  shipping_note: string | null
  bulk_min_qty: number | null
}

export const FINISH_LABEL: Record<Finish, string> = { matte: 'مطفي', gloss: 'لامع' }
export const BADGE_LABEL: Record<Badge, string> = { best_seller: 'الأكثر طلباً', new: 'جديد', sale: 'عرض' }
export const PLACEMENT_LABEL: Record<BannerPlacement, string> = {
  home_hero: 'الرئيسية — البانر الكبير',
  home_middle: 'الرئيسية — وسط الصفحة',
  announcement: 'شريط الإعلان فوق',
  shop: 'صفحة المتجر',
}
export const TARGET_LABEL: Record<BannerTarget, string> = {
  shop: 'صفحة المتجر',
  category: 'قسم معيّن',
  product: 'منتج معيّن',
  whatsapp: 'الواتساب',
  url: 'رابط خارجي',
}

/** Lowest available price, used on product cards ("يبدأ من"). */
export function startingPrice(p: Pick<Product, 'product_sizes'>) {
  const prices = p.product_sizes.filter((s) => s.is_available).map((s) => Number(s.price))
  return prices.length ? Math.min(...prices) : null
}
