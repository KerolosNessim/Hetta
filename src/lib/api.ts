import { supabase } from './supabase'
import { demoBanners, demoCategories, demoProducts, demoSettings } from './demo-data'
import type { Banner, BannerPlacement, Category, Product, ProductSize, Settings } from './types'

const PRODUCT_SELECT = '*, product_sizes(*), category:categories(id, name, slug, color)'

function sortSizes(p: Product): Product {
  return { ...p, product_sizes: [...(p.product_sizes ?? [])].sort((a, b) => a.sort_order - b.sort_order) }
}

// Tiny read cache: the storefront asks for the same lists on every page, so repeat visits
// within a minute resolve instantly. Any admin call clears it.
const TTL = 60_000
const cache = new Map<string, { at: number; value: Promise<unknown> }>()
function memo<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return hit.value as Promise<T>
  const value = load()
  cache.set(key, { at: Date.now(), value })
  value.catch(() => cache.delete(key))
  return value
}

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

// ───────────────────────── storefront (public reads) ─────────────────────────

export function getCategories(opts: { homeOnly?: boolean } = {}): Promise<Category[]> {
  return memo(`categories:${!!opts.homeOnly}`, () => loadCategories(opts))
}

async function loadCategories(opts: { homeOnly?: boolean }): Promise<Category[]> {
  if (!supabase) return demoCategories.filter((c) => !opts.homeOnly || c.show_on_home)
  let q = supabase.from('categories').select('*').eq('is_visible', true).order('sort_order')
  if (opts.homeOnly) q = q.eq('show_on_home', true)
  return must(await q)
}

export type ProductQuery = { categorySlug?: string; featured?: boolean; search?: string; kind?: 'single' | 'pack'; sort?: 'default' | 'newest'; limit?: number }

export function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  return memo(`products:${JSON.stringify(query)}`, () => loadProducts(query))
}

async function loadProducts(query: ProductQuery): Promise<Product[]> {
  if (!supabase) {
    let list = demoProducts
    if (query.categorySlug) list = list.filter((p) => p.category?.slug === query.categorySlug)
    if (query.featured) list = list.filter((p) => p.is_featured)
    if (query.kind) list = list.filter((p) => p.kind === query.kind)
    if (query.search) list = list.filter((p) => p.name.includes(query.search!))
    return list.slice(0, query.limit ?? list.length)
  }
  const select = query.categorySlug ? PRODUCT_SELECT.replace('category:categories(', 'category:categories!inner(') : PRODUCT_SELECT
  let q = supabase.from('products').select(select).eq('is_published', true)
  if (query.featured) q = q.eq('is_featured', true)
  if (query.kind) q = q.eq('kind', query.kind)
  if (query.search) q = q.ilike('name', `%${query.search}%`)
  if (query.categorySlug) q = q.eq('category.slug', query.categorySlug)
  q = query.sort === 'newest' ? q.order('created_at', { ascending: false }) : q.order('sort_order').order('created_at', { ascending: false })
  if (query.limit) q = q.limit(query.limit)
  return (must(await q) as unknown as Product[]).map(sortSizes)
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return memo(`product:${slug}`, () => loadProduct(slug))
}

async function loadProduct(slug: string): Promise<Product | null> {
  if (!supabase) return demoProducts.find((p) => p.slug === slug) ?? null
  const data = must(await supabase.from('products').select(PRODUCT_SELECT).eq('slug', slug).maybeSingle()) as Product | null
  return data ? sortSizes(data) : null
}

export function getBanners(placement: BannerPlacement): Promise<Banner[]> {
  return memo(`banners:${placement}`, () => loadBanners(placement))
}

async function loadBanners(placement: BannerPlacement): Promise<Banner[]> {
  if (!supabase) return demoBanners.filter((b) => b.placement === placement)
  // RLS already hides inactive / out-of-date banners for shoppers.
  return must(await supabase.from('banners').select('*').eq('placement', placement).order('sort_order'))
}

export function getSettings(): Promise<Settings> {
  return memo("settings", loadSettings)
}

async function loadSettings(): Promise<Settings> {
  if (!supabase) return demoSettings
  return must(await supabase.from('settings').select('*').eq('id', 1).single())
}

// ───────────────────────── admin (writes, protected by RLS) ─────────────────────────

function db() {
  cache.clear()
  if (!supabase) throw new Error('Supabase مش متوصل. املأ ملف .env الأول.')
  return supabase
}

export async function adminListProducts(): Promise<Product[]> {
  const rows = must(await db().from('products').select(PRODUCT_SELECT).order('sort_order').order('created_at', { ascending: false }))
  return (rows as Product[]).map(sortSizes)
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const data = must(await db().from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle()) as Product | null
  return data ? sortSizes(data) : null
}

export type ProductInput = Omit<Product, 'id' | 'product_sizes' | 'category'> & { id?: string; product_sizes: ProductSize[] }

/** Saves the product row, then replaces its sizes. */
export async function adminSaveProduct(input: ProductInput): Promise<string> {
  const { product_sizes, id, ...row } = input
  const saved = id
    ? must(await db().from('products').update(row).eq('id', id).select('id').single())
    : must(await db().from('products').insert(row).select('id').single())
  const productId = (saved as unknown as { id: string }).id
  must(await db().from('product_sizes').delete().eq('product_id', productId))
  if (product_sizes.length) {
    must(
      await db()
        .from('product_sizes')
        .insert(product_sizes.map((s, i) => ({ name: s.name, dimensions: s.dimensions, price: s.price, is_available: s.is_available, sort_order: i, product_id: productId }))),
    )
  }
  return productId
}

export async function adminUpdateProduct(id: string, patch: Partial<Pick<Product, 'is_published' | 'is_featured'>>) {
  must(await db().from('products').update(patch).eq('id', id))
}

export async function adminDeleteProduct(id: string) {
  must(await db().from('products').delete().eq('id', id))
}

export async function adminListCategories(): Promise<Category[]> {
  return must(await db().from('categories').select('*').order('sort_order'))
}

export async function adminSaveCategory(cat: Partial<Category> & { name: string; slug: string }) {
  const { id, ...row } = cat
  if (id) must(await db().from('categories').update(row).eq('id', id))
  else must(await db().from('categories').insert(row))
}

export async function adminDeleteCategory(id: string) {
  must(await db().from('categories').delete().eq('id', id))
}

export async function adminReorderCategories(ids: string[]) {
  await Promise.all(ids.map((id, i) => db().from('categories').update({ sort_order: i + 1 }).eq('id', id)))
}

export async function adminListBanners(): Promise<Banner[]> {
  return must(await db().from('banners').select('*').order('placement').order('sort_order'))
}

export async function adminSaveBanner(b: Partial<Banner> & { title: string }) {
  const { id, ...row } = b
  if (id) must(await db().from('banners').update(row).eq('id', id))
  else must(await db().from('banners').insert(row))
}

export async function adminDeleteBanner(id: string) {
  must(await db().from('banners').delete().eq('id', id))
}

export async function adminSaveSettings(s: Settings) {
  must(await db().from('settings').update(s).eq('id', 1))
}

/** Uploads an image to the public `media` bucket and returns its URL. */
export async function uploadImage(file: File, folder: 'products' | 'banners' | 'categories'): Promise<string> {
  const ext = file.name.split('.').pop() || 'png'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await db().storage.from('media').upload(path, file, { cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)
  return db().storage.from('media').getPublicUrl(path).data.publicUrl
}
