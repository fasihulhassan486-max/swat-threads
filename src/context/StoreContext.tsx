import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Line, Product } from '../types'
import { products as mock } from '../data/products'
import { fetchProducts, wooEnabled } from '../lib/woocommerce'
import { track } from '../lib/analytics'
interface Store {
  products: Product[]; loading: boolean; lines: Line[]; wishlist: string[]
  inStock: (p: Product) => boolean; inCart: (id: string) => boolean
  addProduct: (p: Product, gift?: boolean, note?: string, packing?: string) => void
  addBundle: (m: Product, w: Product, colorNote: string) => void
  addCustom: (l: Omit<Line, 'id'>) => void
  remove: (id: string) => void; toggleWish: (id: string) => void; setGift: (id: string, gift: boolean, note: string, packing: string) => void
  completeOrder: () => void
}
const Ctx = createContext<Store>(null as unknown as Store)
export const useStore = () => useContext(Ctx)
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T } catch { return d } }
export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(wooEnabled ? [] : mock)
  const [loading, setLoading] = useState(wooEnabled)
  const [lines, setLines] = useState<Line[]>(() => load('st-lines', []))
  const [wishlist, setWish] = useState<string[]>(() => load('st-wish', []))
  const [sold, setSold] = useState<string[]>(() => load('st-sold', []))
  useEffect(() => { if (wooEnabled) fetchProducts().then(setProducts).catch(console.error).finally(() => setLoading(false)) }, [])
  useEffect(() => { localStorage.setItem('st-lines', JSON.stringify(lines)); localStorage.setItem('st-wish', JSON.stringify(wishlist)); localStorage.setItem('st-sold', JSON.stringify(sold)) }, [lines, wishlist, sold])
  const inStock = (p: Product) => p.stockQuantity > 0 && !sold.includes(p.id)
  const inCart = (id: string) => lines.some(l => l.productId === id)
  const mk = (p: Product, gift = false, note = '', packing = '', colorNote = ''): Line => ({ id: p.id, productId: p.id, category: p.category, name: p.name, unit: p.price, gift, note, packing, colorNote })
  const value: Store = {
    products, loading, lines, wishlist, inStock, inCart,
    addProduct: (p, gift, note, packing) => { if (!inStock(p) || inCart(p.id)) return; setLines(ls => [...ls, mk(p, gift, note, packing)]); track('AddToCart', { content_ids: [p.id], value: p.price, currency: 'PKR' }) },
    addBundle: (m, w, colorNote) => { const add = [m, w].filter(p => inStock(p) && !inCart(p.id)); setLines(ls => [...ls, ...add.map(p => mk(p, false, '', '', colorNote))]); track('AddToCart', { content_ids: [m.id, w.id], value: m.price + w.price, currency: 'PKR' }) },
    addCustom: l => { setLines(ls => [...ls, { ...l, id: 'c' + Date.now() }]); track('AddToCart', { value: l.unit, currency: 'PKR' }) },
    remove: id => setLines(ls => ls.filter(l => l.id !== id)),
    toggleWish: id => setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]),
    setGift: (id, gift, note, packing) => setLines(ls => ls.map(l => l.id === id ? { ...l, gift, note, packing } : l)),
    completeOrder: () => { setSold(s => [...s, ...lines.filter(l => l.productId).map(l => l.productId!)]); setLines([]) },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
