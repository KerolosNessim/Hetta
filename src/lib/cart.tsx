import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type CartItem = {
  key: string // productId|size
  productId: string
  slug: string
  name: string
  color: string
  sizeName: string
  price: number
  qty: number
}

type CartCtx = {
  items: CartItem[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (v: boolean) => void
  add: (item: Omit<CartItem, 'key' | 'qty'>, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)
const STORAGE_KEY = 'hetta-cart-v1'

function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CartItem[]
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* private mode: cart just won't persist */
    }
  }, [items])

  const value = useMemo<CartCtx>(() => {
    const add: CartCtx['add'] = (item, qty = 1) => {
      const key = `${item.productId}|${item.sizeName}`
      setItems((prev) => {
        const hit = prev.find((i) => i.key === key)
        if (hit) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
        return [...prev, { ...item, key, qty }]
      })
      setOpen(true)
    }
    return {
      items,
      open,
      setOpen,
      add,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
      setQty: (key, qty) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i))),
      remove: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
      clear: () => setItems([]),
    }
  }, [items, open])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
